---
sidebar_position: 10
title: Error Handling
---

# Error Handling

Comprehensive guide to handling errors in the Cocobase Go SDK.

## Table of Contents

- [Error Types](#error-types)
- [API Errors](#api-errors)
- [Common Error Codes](#common-error-codes)
- [Error Handling Patterns](#error-handling-patterns)
- [Best Practices](#best-practices)

## Error Types

The SDK uses two main error types:

1. **API Errors** - Errors from the Cocobase API
2. **Standard Errors** - Network, context, and other Go errors

## API Errors

### APIError Structure

```go
type APIError struct {
    StatusCode int
    Method     string
    URL        string
    Body       string
    Suggestion string
}
```

### Accessing API Errors

```go
doc, err := client.GetDocument(ctx, "users", "invalid-id")
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        fmt.Printf("Status Code: %d\n", apiErr.StatusCode)
        fmt.Printf("Method: %s\n", apiErr.Method)
        fmt.Printf("URL: %s\n", apiErr.URL)
        fmt.Printf("Response Body: %s\n", apiErr.Body)
        fmt.Printf("Suggestion: %s\n", apiErr.Suggestion)
    } else {
        fmt.Printf("Other error: %v\n", err)
    }
}
```

### Error Messages

```go
err := client.Login(ctx, "invalid@email.com", "wrong-password")
if err != nil {
    // Full error message includes all details
    fmt.Println(err.Error())
    // Output:
    // API request failed: POST https://api.cocobase.io/auth-collections/login (status: 401)
    // Body: {"error": "Invalid credentials"}
    // Suggestion: Check if your API key is valid and properly set
}
```

## Common Error Codes

### 400 Bad Request

**Meaning**: Invalid request format or data

**Common Causes**:

- Missing required fields
- Invalid data types
- Malformed request body

```go
doc, err := client.CreateDocument(ctx, "users", data)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 400 {
            fmt.Println("Invalid request data")
            fmt.Println("Suggestion:", apiErr.Suggestion)
            // Check your data format and required fields
        }
    }
}
```

### 401 Unauthorized

**Meaning**: Authentication required or invalid

**Common Causes**:

- Invalid API key
- Missing API key
- Expired authentication token
- Invalid credentials

```go
err := client.Login(ctx, email, password)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 401 {
            fmt.Println("Authentication failed")
            // Possible reasons:
            // - Wrong email or password
            // - Invalid API key
        }
    }
}
```

### 403 Forbidden

**Meaning**: Not authorized to perform this action

**Common Causes**:

- Insufficient permissions
- Role-based access restriction
- Account locked or banned

```go
err := client.DeleteDocument(ctx, "users", docID)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 403 {
            fmt.Println("Permission denied")
            // Check if user has required role/permissions
        }
    }
}
```

### 404 Not Found

**Meaning**: Resource doesn't exist

**Common Causes**:

- Invalid document ID
- Document deleted
- Wrong collection name
- Invalid API endpoint

```go
doc, err := client.GetDocument(ctx, "users", docID)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 404 {
            fmt.Println("Document not found")
            // Document doesn't exist or was deleted
        }
    }
}
```

### 405 Method Not Allowed

**Meaning**: HTTP method not supported for this endpoint

**Common Causes**:

- Using wrong HTTP method
- Endpoint doesn't support the operation

```go
// This should rarely happen with the SDK
if apiErr, ok := err.(*cocobase.APIError); ok {
    if apiErr.StatusCode == 405 {
        fmt.Printf("Method %s not allowed\n", apiErr.Method)
    }
}
```

### 429 Too Many Requests

**Meaning**: Rate limit exceeded

**Common Causes**:

- Too many requests in short time
- API rate limit reached

```go
docs, err := client.ListDocuments(ctx, "users", nil)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 429 {
            fmt.Println("Rate limit exceeded")
            fmt.Println("Waiting before retry...")
            time.Sleep(5 * time.Second)
            // Retry the request
        }
    }
}
```

### 500 Internal Server Error

**Meaning**: Server-side error

**Common Causes**:

- Server bug
- Database error
- Temporary server issue

```go
doc, err := client.CreateDocument(ctx, "users", data)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 500 {
            fmt.Println("Server error")
            // Retry or report to support
        }
    }
}
```

## Error Handling Patterns

### Basic Error Checking

```go
doc, err := client.GetDocument(ctx, "users", docID)
if err != nil {
    log.Fatal(err)
}
```

### Typed Error Handling

```go
doc, err := client.GetDocument(ctx, "users", docID)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        // Handle API errors
        handleAPIError(apiErr)
    } else {
        // Handle other errors
        handleOtherError(err)
    }
}
```

### Status Code Switching

```go
func handleAPIError(err error) {
    apiErr, ok := err.(*cocobase.APIError)
    if !ok {
        return
    }

    switch apiErr.StatusCode {
    case 400:
        fmt.Println("Bad request - check your data")
    case 401:
        fmt.Println("Unauthorized - check credentials")
    case 403:
        fmt.Println("Forbidden - insufficient permissions")
    case 404:
        fmt.Println("Not found - resource doesn't exist")
    case 429:
        fmt.Println("Rate limited - slow down requests")
    case 500:
        fmt.Println("Server error - try again later")
    default:
        fmt.Printf("Error %d: %s\n", apiErr.StatusCode, apiErr.Suggestion)
    }
}
```

### Retry Logic

```go
func getDocumentWithRetry(client *cocobase.Client, ctx context.Context,
    collection, id string, maxRetries int) (*cocobase.Document, error) {

    var lastErr error

    for i := 0; i < maxRetries; i++ {
        doc, err := client.GetDocument(ctx, collection, id)
        if err == nil {
            return doc, nil
        }

        lastErr = err

        // Check if error is retryable
        if apiErr, ok := err.(*cocobase.APIError); ok {
            switch apiErr.StatusCode {
            case 429, 500, 502, 503, 504:
                // Retryable errors
                backoff := time.Duration(i+1) * time.Second
                fmt.Printf("Retry %d/%d after %v\n", i+1, maxRetries, backoff)
                time.Sleep(backoff)
                continue
            default:
                // Non-retryable error
                return nil, err
            }
        }

        // Non-API error, also retry
        time.Sleep(time.Second)
    }

    return nil, fmt.Errorf("max retries exceeded: %w", lastErr)
}
```

### Exponential Backoff

```go
func exponentialBackoff(attempt int) time.Duration {
    return time.Duration(1<<uint(attempt)) * time.Second
}

func requestWithBackoff(client *cocobase.Client, ctx context.Context) error {
    maxAttempts := 5

    for attempt := 0; attempt < maxAttempts; attempt++ {
        err := client.Login(ctx, email, password)
        if err == nil {
            return nil
        }

        if apiErr, ok := err.(*cocobase.APIError); ok {
            if apiErr.StatusCode == 429 || apiErr.StatusCode >= 500 {
                if attempt < maxAttempts-1 {
                    backoff := exponentialBackoff(attempt)
                    fmt.Printf("Waiting %v before retry...\n", backoff)
                    time.Sleep(backoff)
                    continue
                }
            }
        }

        return err
    }

    return fmt.Errorf("max attempts reached")
}
```

### Context Errors

```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

doc, err := client.GetDocument(ctx, "users", docID)
if err != nil {
    if err == context.DeadlineExceeded {
        fmt.Println("Request timed out")
    } else if err == context.Canceled {
        fmt.Println("Request was cancelled")
    } else {
        fmt.Printf("Other error: %v\n", err)
    }
}
```

### Wrapped Errors

```go
func getUserByEmail(client *cocobase.Client, ctx context.Context, email string) (*cocobase.Document, error) {
    query := cocobase.NewQuery().Where("email", email)

    docs, err := client.ListDocuments(ctx, "users", query)
    if err != nil {
        return nil, fmt.Errorf("failed to search users: %w", err)
    }

    if len(docs) == 0 {
        return nil, fmt.Errorf("user not found: %s", email)
    }

    return &docs[0], nil
}

// Usage
doc, err := getUserByEmail(client, ctx, "user@example.com")
if err != nil {
    // Error includes context
    fmt.Println(err.Error())
    // Output: "failed to search users: API request failed..."
}
```

### Custom Error Types

```go
type NotFoundError struct {
    Resource string
    ID       string
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s not found: %s", e.Resource, e.ID)
}

func getDocumentSafe(client *cocobase.Client, ctx context.Context,
    collection, id string) (*cocobase.Document, error) {

    doc, err := client.GetDocument(ctx, collection, id)
    if err != nil {
        if apiErr, ok := err.(*cocobase.APIError); ok {
            if apiErr.StatusCode == 404 {
                return nil, &NotFoundError{
                    Resource: collection,
                    ID:       id,
                }
            }
        }
        return nil, err
    }

    return doc, nil
}

// Usage
doc, err := getDocumentSafe(client, ctx, "users", id)
if err != nil {
    if _, ok := err.(*NotFoundError); ok {
        fmt.Println("Document doesn't exist")
    } else {
        fmt.Printf("Other error: %v\n", err)
    }
}
```

### Graceful Degradation

```go
func getUser(client *cocobase.Client, ctx context.Context, id string) *cocobase.Document {
    doc, err := client.GetDocument(ctx, "users", id)
    if err != nil {
        log.Printf("Error fetching user: %v\n", err)

        // Return default/cached user
        return &cocobase.Document{
            ID: id,
            Data: map[string]interface{}{
                "name": "Unknown User",
            },
        }
    }

    return doc
}
```

## Best Practices

### 1. Always Check Errors

```go
// Good: Always check errors
doc, err := client.GetDocument(ctx, "users", id)
if err != nil {
    return err
}

// Bad: Ignoring errors
doc, _ := client.GetDocument(ctx, "users", id)
```

### 2. Provide Context in Errors

```go
// Good: Add context
doc, err := client.GetDocument(ctx, "users", id)
if err != nil {
    return fmt.Errorf("failed to get user %s: %w", id, err)
}

// Bad: Raw error
if err != nil {
    return err
}
```

### 3. Handle Specific Error Codes

```go
// Good: Handle specific codes
if apiErr, ok := err.(*cocobase.APIError); ok {
    switch apiErr.StatusCode {
    case 404:
        // Handle not found
    case 401:
        // Handle unauthorized
    }
}

// Bad: Generic handling
if err != nil {
    log.Fatal(err)
}
```

### 4. Use Retry Logic for Transient Errors

```go
// Good: Retry on transient errors
if apiErr, ok := err.(*cocobase.APIError); ok {
    if apiErr.StatusCode == 429 || apiErr.StatusCode >= 500 {
        // Retry with backoff
    }
}
```

### 5. Log Errors Appropriately

```go
// Good: Log with context
if err != nil {
    log.Printf("Failed to create document in collection %s: %v\n", collection, err)
}

// Bad: No context
if err != nil {
    log.Println(err)
}
```

### 6. Don't Panic on Expected Errors

```go
// Good: Return error
func getUser(id string) (*cocobase.Document, error) {
    doc, err := client.GetDocument(ctx, "users", id)
    if err != nil {
        return nil, err
    }
    return doc, nil
}

// Bad: Panic on error
func getUser(id string) *cocobase.Document {
    doc, err := client.GetDocument(ctx, "users", id)
    if err != nil {
        panic(err)  // Don't do this
    }
    return doc
}
```

### 7. Use Context for Timeouts

```go
// Good: Set timeout
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

doc, err := client.GetDocument(ctx, "users", id)

// Bad: No timeout
doc, err := client.GetDocument(context.Background(), "users", id)
```

### 8. Validate Before API Calls

```go
// Good: Validate first
if email == "" || !isValidEmail(email) {
    return fmt.Errorf("invalid email")
}

err := client.Login(ctx, email, password)

// Bad: Let API validation catch it
err := client.Login(ctx, "", "")  // Will fail with 400
```

---

**Previous**: [Storage](./storage.md) | **Next**: [API Reference](./api-reference.md) →
