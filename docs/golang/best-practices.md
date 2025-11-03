---
sidebar_position: 13
title: Best Practices
---

# Best Practices

Guidelines and recommendations for using the Cocobase Go SDK effectively.

## Table of Contents

- [General Principles](#general-principles)
- [Client Configuration](#client-configuration)
- [Error Handling](#error-handling)
- [Query Optimization](#query-optimization)
- [Authentication](#authentication)
- [Data Management](#data-management)
- [Real-time Updates](#real-time-updates)
- [Performance](#performance)
- [Security](#security)
- [Testing](#testing)

## General Principles

### Use Context Everywhere

Always use `context.Context` for cancellation and timeouts:

```go
// Good: Context with timeout
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

doc, err := client.GetDocument(ctx, "users", id)

// Bad: No context control
doc, err := client.GetDocument(context.Background(), "users", id)
```

### Check All Errors

Never ignore errors:

```go
// Good: Check errors
doc, err := client.GetDocument(ctx, "users", id)
if err != nil {
    return fmt.Errorf("failed to get user: %w", err)
}

// Bad: Ignore errors
doc, _ := client.GetDocument(ctx, "users", id)
```

### Use Defer for Cleanup

Always clean up resources:

```go
// Good: Defer cleanup
conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
if err != nil {
    return err
}
defer conn.Close()

// Bad: No cleanup guarantee
conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
// Might forget to close
```

## Client Configuration

### Single Client Instance

Create one client instance and reuse it:

```go
// Good: Single instance
var client *cocobase.Client

func init() {
    client = cocobase.NewClient(cocobase.Config{
        APIKey: os.Getenv("COCOBASE_API_KEY"),
    })
}

// Bad: Creating clients repeatedly
func getUser() {
    client := cocobase.NewClient(...)  // Don't do this
}
```

### Use Environment Variables

Store configuration in environment variables:

```go
// Good: Environment variables
client := cocobase.NewClient(cocobase.Config{
    APIKey:  os.Getenv("COCOBASE_API_KEY"),
    BaseURL: os.Getenv("COCOBASE_BASE_URL"),
})

// Bad: Hard-coded credentials
client := cocobase.NewClient(cocobase.Config{
    APIKey: "hardcoded-api-key",  // Don't do this
})
```

### Enable Storage in Production

Use persistent storage for better UX:

```go
// Good: Persistent storage
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Fatal(err)
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:  apiKey,
    Storage: store,
})

// Try to restore session
client.InitAuth(ctx)
```

## Error Handling

### Handle Specific Status Codes

```go
// Good: Specific handling
doc, err := client.GetDocument(ctx, "users", id)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        switch apiErr.StatusCode {
        case 404:
            return ErrUserNotFound
        case 403:
            return ErrPermissionDenied
        default:
            return fmt.Errorf("unexpected error: %w", err)
        }
    }
    return err
}

// Bad: Generic handling
if err != nil {
    log.Fatal(err)  // Too harsh for recoverable errors
}
```

### Wrap Errors with Context

```go
// Good: Contextual errors
doc, err := client.GetDocument(ctx, "users", userID)
if err != nil {
    return fmt.Errorf("failed to get user %s: %w", userID, err)
}

// Bad: Raw errors
if err != nil {
    return err  // Lost context
}
```

### Implement Retry Logic

```go
// Good: Retry transient errors
func getDocumentWithRetry(client *cocobase.Client, ctx context.Context,
    collection, id string) (*cocobase.Document, error) {

    maxRetries := 3
    for i := 0; i < maxRetries; i++ {
        doc, err := client.GetDocument(ctx, collection, id)
        if err == nil {
            return doc, nil
        }

        if apiErr, ok := err.(*cocobase.APIError); ok {
            if apiErr.StatusCode == 429 || apiErr.StatusCode >= 500 {
                time.Sleep(time.Duration(i+1) * time.Second)
                continue
            }
        }

        return nil, err
    }

    return nil, fmt.Errorf("max retries exceeded")
}
```

## Query Optimization

### Use Specific Queries

```go
// Good: Specific query
query := cocobase.NewQuery().
    Where("status", "active").
    Where("type", "premium").
    Limit(50)

docs, err := client.ListDocuments(ctx, "users", query)

// Bad: Fetching everything
docs, err := client.ListDocuments(ctx, "users", nil)
```

### Always Set Limits

```go
// Good: Limited results
query := cocobase.NewQuery().
    Where("status", "active").
    Limit(100)  // Prevent loading too much

// Bad: No limit
query := cocobase.NewQuery().
    Where("status", "active")  // Could return millions
```

### Use Pagination for Large Datasets

```go
// Good: Paginate results
func getAllUsers(client *cocobase.Client, ctx context.Context) ([]cocobase.Document, error) {
    var allDocs []cocobase.Document
    page := 1
    perPage := 100

    for {
        query := cocobase.NewQuery().
            Page(page, perPage).
            Active()

        docs, err := client.ListDocuments(ctx, "users", query)
        if err != nil {
            return nil, err
        }

        allDocs = append(allDocs, docs...)

        if len(docs) < perPage {
            break
        }

        page++
    }

    return allDocs, nil
}
```

### Order for Consistency

```go
// Good: Stable ordering
query := cocobase.NewQuery().
    Where("status", "active").
    OrderBy("id").  // Stable sort
    Limit(50)

// Bad: No ordering (results may vary)
query := cocobase.NewQuery().
    Where("status", "active").
    Limit(50)
```

### Use Helper Methods

```go
// Good: Use helpers
query := cocobase.NewQuery().
    Active().
    Recent().
    Limit(50)

// Less readable
query := cocobase.NewQuery().
    IsNull("deletedAt").
    OrderByDesc("created_at").
    Limit(50)
```

## Authentication

### Initialize Auth on Startup

```go
// Good: Try to restore session
func initClient() (*cocobase.Client, error) {
    store, _ := storage.NewFileStorage(".cocobase/auth.json")

    client := cocobase.NewClient(cocobase.Config{
        APIKey:  os.Getenv("COCOBASE_API_KEY"),
        Storage: store,
    })

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    err := client.InitAuth(ctx)
    if err != nil {
        // No existing session, that's okay
        log.Println("No existing session")
    }

    return client, nil
}
```

### Check Authentication Before Protected Operations

```go
// Good: Check first
func deleteUser(client *cocobase.Client, ctx context.Context, id string) error {
    if !client.IsAuthenticated() {
        return ErrNotAuthenticated
    }

    if !client.HasRole("admin") {
        return ErrPermissionDenied
    }

    return client.DeleteDocument(ctx, "users", id)
}
```

### Logout on Exit

```go
// Good: Clean logout
func main() {
    client := initClient()
    defer client.Logout()

    // Application logic
}
```

## Data Management

### Validate Data Before Sending

```go
// Good: Validate first
func createUser(client *cocobase.Client, name, email string, age int) error {
    if name == "" {
        return fmt.Errorf("name is required")
    }

    if !isValidEmail(email) {
        return fmt.Errorf("invalid email format")
    }

    if age < 0 || age > 150 {
        return fmt.Errorf("invalid age")
    }

    data := map[string]interface{}{
        "name":  name,
        "email": email,
        "age":   age,
    }

    _, err := client.CreateDocument(ctx, "users", data)
    return err
}
```

### Use Soft Deletes

```go
// Good: Soft delete
func softDelete(client *cocobase.Client, ctx context.Context, collection, id string) error {
    updates := map[string]interface{}{
        "deletedAt": time.Now().Format(time.RFC3339),
    }

    _, err := client.UpdateDocument(ctx, collection, id, updates)
    return err
}

// Query non-deleted documents
query := cocobase.NewQuery().Active()
```

### Include Timestamps

```go
// Good: Add timestamps
data := map[string]interface{}{
    "name":      "Alice",
    "email":     "alice@example.com",
    "createdAt": time.Now().Format(time.RFC3339),
}

doc, err := client.CreateDocument(ctx, "users", data)

// On update
updates := map[string]interface{}{
    "status":    "active",
    "updatedAt": time.Now().Format(time.RFC3339),
}
```

### Type-Safe Data Access

```go
// Good: Safe type assertions
doc, err := client.GetDocument(ctx, "users", id)
if err != nil {
    return err
}

name, ok := doc.Data["name"].(string)
if !ok {
    return fmt.Errorf("invalid name field")
}

age, ok := doc.Data["age"].(float64)
if !ok {
    return fmt.Errorf("invalid age field")
}

// Use name and age safely
```

## Real-time Updates

### Always Close Connections

```go
// Good: Defer close
conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
if err != nil {
    return err
}
defer conn.Close()
```

### Protect Event Handlers

```go
// Good: Panic protection
handler := func(event cocobase.Event) {
    defer func() {
        if r := recover(); r != nil {
            log.Printf("Panic in event handler: %v\n", r)
        }
    }()

    processEvent(event)
}
```

### Keep Handlers Fast

```go
// Good: Offload heavy work
handler := func(event cocobase.Event) {
    // Quick processing
    go heavyProcessing(event)  // Offload to goroutine
}

// Bad: Heavy processing in handler
handler := func(event cocobase.Event) {
    heavyProcessing(event)  // Blocks next event
}
```

### Implement Reconnection

```go
// Good: Handle disconnections
func watchWithReconnect(client *cocobase.Client, ctx context.Context,
    collection string, handler func(cocobase.Event)) {

    for {
        conn, err := client.WatchCollection(ctx, collection, handler, "")
        if err != nil {
            log.Printf("Connection failed: %v\n", err)
            time.Sleep(5 * time.Second)
            continue
        }

        // Monitor connection
        for !conn.IsClosed() {
            time.Sleep(1 * time.Second)
        }

        log.Println("Connection lost, reconnecting...")
        time.Sleep(2 * time.Second)
    }
}
```

## Performance

### Reuse HTTP Client

```go
// Good: Custom HTTP client with connection pooling
httpClient := &http.Client{
    Timeout: 30 * time.Second,
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        IdleConnTimeout:     90 * time.Second,
    },
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:     apiKey,
    HTTPClient: httpClient,
})
```

### Batch Operations

```go
// Good: Process in batches
func processBatch(client *cocobase.Client, ctx context.Context, ids []string) error {
    batchSize := 50

    for i := 0; i < len(ids); i += batchSize {
        end := i + batchSize
        if end > len(ids) {
            end = len(ids)
        }

        batch := ids[i:end]

        // Process batch
        for _, id := range batch {
            // Process each item
        }
    }

    return nil
}
```

### Use Appropriate Timeouts

```go
// Good: Different timeouts for different operations
func quickOperation(client *cocobase.Client) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    return client.GetDocument(ctx, "users", id)
}

func longOperation(client *cocobase.Client) error {
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    return client.ListDocuments(ctx, "users", complexQuery)
}
```

## Security

### Store Credentials Securely

```go
// Good: Use environment variables or secret management
apiKey := os.Getenv("COCOBASE_API_KEY")

// Bad: Hard-coded credentials
apiKey := "hardcoded-key"  // Don't do this
```

### Validate User Input

```go
// Good: Validate and sanitize
func createPost(client *cocobase.Client, title, content string) error {
    // Validate
    if len(title) > 200 {
        return fmt.Errorf("title too long")
    }

    if len(content) > 10000 {
        return fmt.Errorf("content too long")
    }

    // Sanitize (example)
    title = strings.TrimSpace(title)
    content = strings.TrimSpace(content)

    data := map[string]interface{}{
        "title":   title,
        "content": content,
    }

    _, err := client.CreateDocument(ctx, "posts", data)
    return err
}
```

### Use HTTPS in Production

```go
// Good: HTTPS for production
client := cocobase.NewClient(cocobase.Config{
    APIKey:  apiKey,
    BaseURL: "https://api.cocobase.io",  // HTTPS
})

// Bad: HTTP in production
// BaseURL: "http://api.cocobase.io",  // Insecure
```

### Restrict File Permissions

```go
// Good: Secure file storage
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Fatal(err)
}

// Set restrictive permissions
os.Chmod(".cocobase/auth.json", 0600)  // Owner read/write only
```

## Testing

### Use Mock Storage for Tests

```go
// Good: Mock storage for testing
func TestUserOperations(t *testing.T) {
    store := storage.NewMemoryStorage()

    client := cocobase.NewClient(cocobase.Config{
        APIKey:  "test-api-key",
        Storage: store,
    })

    // Run tests
}
```

### Test Error Cases

```go
// Good: Test error scenarios
func TestGetDocumentNotFound(t *testing.T) {
    client := setupTestClient()

    _, err := client.GetDocument(ctx, "users", "nonexistent-id")

    if err == nil {
        t.Fatal("expected error, got nil")
    }

    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode != 404 {
            t.Fatalf("expected 404, got %d", apiErr.StatusCode)
        }
    } else {
        t.Fatal("expected APIError")
    }
}
```

### Use Table-Driven Tests

```go
// Good: Table-driven tests
func TestQueryBuilder(t *testing.T) {
    tests := []struct {
        name     string
        query    *cocobase.QueryBuilder
        expected string
    }{
        {
            name:     "simple where",
            query:    cocobase.NewQuery().Where("status", "active"),
            expected: "status=active",
        },
        {
            name:     "with limit",
            query:    cocobase.NewQuery().Where("status", "active").Limit(10),
            expected: "status=active&limit=10",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := tt.query.Build()
            if result != tt.expected {
                t.Errorf("expected %q, got %q", tt.expected, result)
            }
        })
    }
}
```

---

**Previous**: [API Reference](./api-reference.md) | **Back to Home**: [Documentation](./README.md)
