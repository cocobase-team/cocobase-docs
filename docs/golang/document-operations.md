---
sidebar_position: 6
title: Document Operations
---

# Document Operations

Complete guide to CRUD (Create, Read, Update, Delete) operations with Cocobase.

## Table of Contents

- [Document Model](#document-model)
- [Create Documents](#create-documents)
- [Read Documents](#read-documents)
- [Update Documents](#update-documents)
- [Delete Documents](#delete-documents)
- [List Documents](#list-documents)
- [Best Practices](#best-practices)

## Document Model

### Document Structure

```go
type Document struct {
    ID         string                 `json:"id"`
    Collection string                 `json:"collection"`
    Data       map[string]interface{} `json:"data"`
    CreatedAt  time.Time              `json:"created_at"`
    UpdatedAt  time.Time              `json:"updated_at"`
}
```

### Accessing Document Fields

```go
doc, _ := client.GetDocument(ctx, "users", "doc-id")

// Built-in fields
fmt.Printf("ID: %s\n", doc.ID)
fmt.Printf("Collection: %s\n", doc.Collection)
fmt.Printf("Created: %v\n", doc.CreatedAt)
fmt.Printf("Updated: %v\n", doc.UpdatedAt)

// Custom data
name := doc.Data["name"].(string)
age := doc.Data["age"].(float64)
isActive := doc.Data["active"].(bool)
```

## Create Documents

### Basic Creation

```go
data := map[string]interface{}{
    "name":   "Alice Smith",
    "email":  "alice@example.com",
    "age":    28,
    "active": true,
}

doc, err := client.CreateDocument(ctx, "users", data)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Created document with ID: %s\n", doc.ID)
```

### Creating with Different Data Types

```go
data := map[string]interface{}{
    // String
    "name": "John Doe",

    // Numbers
    "age":    30,
    "height": 5.9,

    // Boolean
    "active": true,

    // Arrays
    "tags": []string{"developer", "golang", "backend"},

    // Nested objects
    "address": map[string]interface{}{
        "street": "123 Main St",
        "city":   "New York",
        "zip":    "10001",
    },

    // Timestamps
    "registeredAt": time.Now().Format(time.RFC3339),
}

doc, err := client.CreateDocument(ctx, "users", data)
```

### Error Handling

```go
doc, err := client.CreateDocument(ctx, "users", data)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        switch apiErr.StatusCode {
        case 400:
            fmt.Println("Invalid data format")
        case 401:
            fmt.Println("Not authenticated")
        case 403:
            fmt.Println("Permission denied")
        default:
            fmt.Printf("Error: %s\n", apiErr.Suggestion)
        }
    } else {
        log.Fatal(err)
    }
}
```

## Read Documents

### Get Single Document

```go
doc, err := client.GetDocument(ctx, "users", "document-id")
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 404 {
            fmt.Println("Document not found")
            return
        }
    }
    log.Fatal(err)
}

fmt.Printf("Name: %s\n", doc.Data["name"])
```

### Type Assertions

```go
doc, err := client.GetDocument(ctx, "users", "document-id")
if err != nil {
    log.Fatal(err)
}

// String
if name, ok := doc.Data["name"].(string); ok {
    fmt.Printf("Name: %s\n", name)
}

// Number
if age, ok := doc.Data["age"].(float64); ok {
    fmt.Printf("Age: %.0f\n", age)
}

// Boolean
if active, ok := doc.Data["active"].(bool); ok {
    fmt.Printf("Active: %v\n", active)
}

// Array
if tags, ok := doc.Data["tags"].([]interface{}); ok {
    for _, tag := range tags {
        fmt.Printf("Tag: %s\n", tag)
    }
}

// Nested object
if address, ok := doc.Data["address"].(map[string]interface{}); ok {
    if city, ok := address["city"].(string); ok {
        fmt.Printf("City: %s\n", city)
    }
}
```

### Safe Type Access Helper

```go
func getString(data map[string]interface{}, key string) (string, bool) {
    if val, ok := data[key].(string); ok {
        return val, true
    }
    return "", false
}

func getFloat(data map[string]interface{}, key string) (float64, bool) {
    if val, ok := data[key].(float64); ok {
        return val, true
    }
    return 0, false
}

// Usage
doc, _ := client.GetDocument(ctx, "users", "doc-id")

if name, ok := getString(doc.Data, "name"); ok {
    fmt.Printf("Name: %s\n", name)
}

if age, ok := getFloat(doc.Data, "age"); ok {
    fmt.Printf("Age: %.0f\n", age)
}
```

## Update Documents

### Basic Update

```go
updates := map[string]interface{}{
    "age":    29,
    "status": "active",
}

doc, err := client.UpdateDocument(ctx, "users", "document-id", updates)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Updated document: %+v\n", doc.Data)
```

### Partial Update

Updates are merged with existing data:

```go
// Original document:
// {"name": "Alice", "age": 28, "city": "NYC"}

updates := map[string]interface{}{
    "age": 29,  // Updates existing field
}

doc, err := client.UpdateDocument(ctx, "users", "doc-id", updates)
// Result: {"name": "Alice", "age": 29, "city": "NYC"}
```

### Adding New Fields

```go
// Add new fields to existing document
updates := map[string]interface{}{
    "phone":   "+1234567890",
    "website": "https://example.com",
}

doc, err := client.UpdateDocument(ctx, "users", "doc-id", updates)
```

### Updating Nested Fields

```go
// Update nested object
updates := map[string]interface{}{
    "address": map[string]interface{}{
        "city":  "Los Angeles",
        "state": "CA",
    },
}

doc, err := client.UpdateDocument(ctx, "users", "doc-id", updates)
```

### Updating Arrays

```go
// Replace array
updates := map[string]interface{}{
    "tags": []string{"golang", "backend", "microservices"},
}

doc, err := client.UpdateDocument(ctx, "users", "doc-id", updates)
```

### Conditional Update

```go
// Get current document
doc, err := client.GetDocument(ctx, "users", "doc-id")
if err != nil {
    log.Fatal(err)
}

// Check condition
if status, ok := doc.Data["status"].(string); ok && status == "active" {
    // Update only if active
    updates := map[string]interface{}{
        "lastModified": time.Now().Format(time.RFC3339),
    }

    doc, err = client.UpdateDocument(ctx, "users", doc.ID, updates)
    if err != nil {
        log.Fatal(err)
    }
}
```

## Delete Documents

### Basic Deletion

```go
err := client.DeleteDocument(ctx, "users", "document-id")
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 404 {
            fmt.Println("Document not found")
            return
        }
    }
    log.Fatal(err)
}

fmt.Println("Document deleted successfully")
```

### Soft Delete (Recommended)

Instead of permanently deleting, mark documents as deleted:

```go
// Soft delete by setting deletedAt field
updates := map[string]interface{}{
    "deletedAt": time.Now().Format(time.RFC3339),
}

doc, err := client.UpdateDocument(ctx, "users", "doc-id", updates)
if err != nil {
    log.Fatal(err)
}

fmt.Println("Document marked as deleted")
```

Query active (non-deleted) documents:

```go
query := cocobase.NewQuery().
    IsNull("deletedAt").  // Only non-deleted
    Limit(100)

docs, err := client.ListDocuments(ctx, "users", query)
```

Or use the helper:

```go
query := cocobase.NewQuery().
    Active().  // Shortcut for IsNull("deletedAt")
    Limit(100)

docs, err := client.ListDocuments(ctx, "users", query)
```

### Conditional Deletion

```go
// Get document first
doc, err := client.GetDocument(ctx, "users", "doc-id")
if err != nil {
    log.Fatal(err)
}

// Check if can be deleted
if status, ok := doc.Data["status"].(string); ok {
    if status != "protected" {
        err = client.DeleteDocument(ctx, "users", doc.ID)
        if err != nil {
            log.Fatal(err)
        }
        fmt.Println("Document deleted")
    } else {
        fmt.Println("Cannot delete protected document")
    }
}
```

## List Documents

### List All Documents

```go
docs, err := client.ListDocuments(ctx, "users", nil)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Found %d documents\n", len(docs))

for _, doc := range docs {
    fmt.Printf("ID: %s, Name: %s\n", doc.ID, doc.Data["name"])
}
```

### List with Query

```go
query := cocobase.NewQuery().
    Where("status", "active").
    GreaterThanOrEqual("age", 18).
    Limit(50)

docs, err := client.ListDocuments(ctx, "users", query)
if err != nil {
    log.Fatal(err)
}
```

See the [Query Builder Guide](./query-builder.md) for advanced querying.

### List with Raw Query String

```go
// If you already have a query string
docs, err := client.QueryDocuments(ctx, "users", "status=active&age_gte=18&limit=50")
if err != nil {
    log.Fatal(err)
}
```

### Pagination

```go
// Get page 2 with 20 items per page
query := cocobase.NewQuery().
    Where("status", "active").
    Page(2, 20).
    Recent()

docs, err := client.ListDocuments(ctx, "users", query)
```

### Iterate All Documents

```go
func getAllDocuments(client *cocobase.Client, ctx context.Context, collection string) ([]cocobase.Document, error) {
    var allDocs []cocobase.Document
    page := 1
    perPage := 100

    for {
        query := cocobase.NewQuery().
            Page(page, perPage).
            OrderBy("id")  // Stable sort

        docs, err := client.ListDocuments(ctx, collection, query)
        if err != nil {
            return nil, err
        }

        allDocs = append(allDocs, docs...)

        // Stop if we got fewer than requested
        if len(docs) < perPage {
            break
        }

        page++
    }

    return allDocs, nil
}
```

## Best Practices

### 1. Use Context for All Operations

```go
// Good: Use context with timeout
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

doc, err := client.CreateDocument(ctx, "users", data)
```

### 2. Handle Errors Appropriately

```go
// Good: Check specific error types
doc, err := client.GetDocument(ctx, "users", id)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        if apiErr.StatusCode == 404 {
            // Handle not found
            return nil
        }
    }
    return err
}
```

### 3. Validate Data Before Creating

```go
// Good: Validate before sending
func createUser(client *cocobase.Client, name, email string, age int) error {
    if name == "" {
        return fmt.Errorf("name is required")
    }
    if !isValidEmail(email) {
        return fmt.Errorf("invalid email")
    }
    if age < 0 {
        return fmt.Errorf("age must be positive")
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

### 4. Use Type Assertions Safely

```go
// Good: Check type before using
if name, ok := doc.Data["name"].(string); ok {
    fmt.Printf("Name: %s\n", name)
} else {
    fmt.Println("Name field is not a string or doesn't exist")
}
```

### 5. Prefer Soft Deletes

```go
// Good: Use soft deletes for important data
updates := map[string]interface{}{
    "deletedAt": time.Now().Format(time.RFC3339),
}

doc, err := client.UpdateDocument(ctx, "users", id, updates)

// Bad: Permanent deletion
// err := client.DeleteDocument(ctx, "users", id)
```

### 6. Use Pagination for Large Datasets

```go
// Good: Use pagination
query := cocobase.NewQuery().
    Where("status", "active").
    Limit(100)

docs, err := client.ListDocuments(ctx, "users", query)

// Bad: Get all documents without limit
// docs, err := client.ListDocuments(ctx, "users", nil)
```

### 7. Set Reasonable Timeouts

```go
// Good: Set timeout based on operation
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

doc, err := client.CreateDocument(ctx, "users", data)
```

### 8. Use Transactions for Related Operations

```go
// When updating related documents, consider doing it atomically
func transferOwnership(client *cocobase.Client, ctx context.Context, fromID, toID, itemID string) error {
    // Get item
    item, err := client.GetDocument(ctx, "items", itemID)
    if err != nil {
        return err
    }

    // Verify current owner
    if item.Data["owner"] != fromID {
        return fmt.Errorf("not the owner")
    }

    // Update item
    updates := map[string]interface{}{
        "owner":         toID,
        "transferredAt": time.Now().Format(time.RFC3339),
    }

    _, err = client.UpdateDocument(ctx, "items", itemID, updates)
    return err
}
```

### 9. Batch Operations

```go
// Process documents in batches
func processBatch(client *cocobase.Client, ctx context.Context) error {
    query := cocobase.NewQuery().
        Where("status", "pending").
        Limit(100)

    docs, err := client.ListDocuments(ctx, "tasks", query)
    if err != nil {
        return err
    }

    for _, doc := range docs {
        // Process each document
        updates := map[string]interface{}{
            "status":      "processing",
            "processedAt": time.Now().Format(time.RFC3339),
        }

        _, err := client.UpdateDocument(ctx, "tasks", doc.ID, updates)
        if err != nil {
            log.Printf("Failed to update %s: %v\n", doc.ID, err)
            continue
        }
    }

    return nil
}
```

### 10. Add Timestamps

```go
// Good: Always include timestamps
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

doc, err = client.UpdateDocument(ctx, "users", doc.ID, updates)
```

---

**Previous**: [Getting Started](./getting-started.md) | **Next**: [Query Builder](./query-builder.md) →
