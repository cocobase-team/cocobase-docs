---
sidebar_position: 3
title: Getting Started
---

# Getting Started

This guide will help you get up and running with the Cocobase Go SDK quickly.

## Prerequisites

- Go 1.21 or higher
- A Cocobase API key (get one from [cocobase.io](https://cocobase.io))

## Installation

Install the Cocobase Go SDK using `go get`:

```bash
go get github.com/lordace-coder/cocobase-go
```

This will download the SDK and its dependencies.

## Basic Configuration

### Creating a Client

The most basic way to create a client:

```go
package main

import (
    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    client := cocobase.NewClient(cocobase.Config{
        APIKey: "your-api-key-here",
    })
}
```

### Configuration Options

The `Config` struct supports several options:

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey:     "your-api-key",          // Required: Your API key
    BaseURL:    "https://api.cocobase.io", // Optional: Custom base URL
    HTTPClient: &http.Client{            // Optional: Custom HTTP client
        Timeout: 30 * time.Second,
    },
    Storage:    storage.NewMemoryStorage(), // Optional: Token storage
})
```

**Default Values:**

- `BaseURL`: `http://localhost:3000`
- `HTTPClient`: Standard client with 30-second timeout
- `Storage`: `nil` (no persistence)

## Your First Request

### Creating a Document

Let's create your first document:

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    // Initialize client
    client := cocobase.NewClient(cocobase.Config{
        APIKey: "your-api-key",
    })

    // Create context
    ctx := context.Background()

    // Create a document
    doc, err := client.CreateDocument(ctx, "users", map[string]interface{}{
        "name":  "Alice Smith",
        "email": "alice@example.com",
        "age":   28,
        "role":  "developer",
    })

    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Created document with ID: %s\n", doc.ID)
    fmt.Printf("Data: %+v\n", doc.Data)
}
```

### Reading a Document

Retrieve a document by ID:

```go
doc, err := client.GetDocument(ctx, "users", "document-id-here")
if err != nil {
    log.Fatal(err)
}

fmt.Printf("User: %s\n", doc.Data["name"])
```

### Updating a Document

Update an existing document:

```go
updated, err := client.UpdateDocument(ctx, "users", "document-id", map[string]interface{}{
    "age":    29,
    "status": "active",
})
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Updated document: %+v\n", updated.Data)
```

### Deleting a Document

Delete a document:

```go
err := client.DeleteDocument(ctx, "users", "document-id")
if err != nil {
    log.Fatal(err)
}

fmt.Println("Document deleted successfully")
```

## Quick Start Example

Here's a complete example demonstrating basic CRUD operations:

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    // 1. Initialize client
    client := cocobase.NewClient(cocobase.Config{
        APIKey: "your-api-key",
    })

    ctx := context.Background()

    // 2. Create a document
    doc, err := client.CreateDocument(ctx, "tasks", map[string]interface{}{
        "title":       "Learn Cocobase",
        "description": "Complete the getting started guide",
        "completed":   false,
        "priority":    "high",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("✓ Created task: %s\n", doc.ID)

    // 3. Read the document
    retrieved, err := client.GetDocument(ctx, "tasks", doc.ID)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("✓ Retrieved: %s\n", retrieved.Data["title"])

    // 4. Update the document
    updated, err := client.UpdateDocument(ctx, "tasks", doc.ID, map[string]interface{}{
        "completed": true,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("✓ Updated completed: %v\n", updated.Data["completed"])

    // 5. List documents with a query
    query := cocobase.NewQuery().
        Where("completed", true).
        Limit(10)

    tasks, err := client.ListDocuments(ctx, "tasks", query)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("✓ Found %d completed tasks\n", len(tasks))

    // 6. Delete the document
    err = client.DeleteDocument(ctx, "tasks", doc.ID)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("✓ Deleted task")
}
```

## Using Context

The SDK supports Go's `context.Context` for cancellation and timeouts:

### Timeout Example

```go
// Create context with 5-second timeout
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

// This request will be cancelled if it takes longer than 5 seconds
docs, err := client.ListDocuments(ctx, "users", nil)
if err != nil {
    if err == context.DeadlineExceeded {
        log.Println("Request timed out")
    } else {
        log.Fatal(err)
    }
}
```

### Cancellation Example

```go
// Create cancellable context
ctx, cancel := context.WithCancel(context.Background())

// Cancel after some condition
go func() {
    time.Sleep(2 * time.Second)
    cancel()
}()

// This request can be cancelled
docs, err := client.ListDocuments(ctx, "users", nil)
if err != nil {
    if err == context.Canceled {
        log.Println("Request was cancelled")
    } else {
        log.Fatal(err)
    }
}
```

## Environment Variables

You can store your API key in an environment variable:

```go
import "os"

client := cocobase.NewClient(cocobase.Config{
    APIKey: os.Getenv("COCOBASE_API_KEY"),
})
```

Set the environment variable:

```bash
export COCOBASE_API_KEY="your-api-key"
```

## Using .env Files

For development, use a `.env` file:

```bash
# .env
COCOBASE_API_KEY=your-api-key
COCOBASE_BASE_URL=https://api.cocobase.io
```

Load it with a package like `godotenv`:

```bash
go get github.com/joho/godotenv
```

```go
package main

import (
    "log"
    "os"

    "github.com/joho/godotenv"
    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    // Load .env file
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    // Create client
    client := cocobase.NewClient(cocobase.Config{
        APIKey:  os.Getenv("COCOBASE_API_KEY"),
        BaseURL: os.Getenv("COCOBASE_BASE_URL"),
    })
}
```

## Error Handling

Basic error handling:

```go
doc, err := client.GetDocument(ctx, "users", "invalid-id")
if err != nil {
    // Check if it's an API error
    if apiErr, ok := err.(*cocobase.APIError); ok {
        fmt.Printf("API Error: %d\n", apiErr.StatusCode)
        fmt.Printf("Suggestion: %s\n", apiErr.Suggestion)
    } else {
        fmt.Printf("Error: %v\n", err)
    }
}
```

See [Error Handling](./error-handling.md) for comprehensive error handling strategies.

## Next Steps

Now that you have the basics:

1. **Learn about queries**: [Query Builder Guide](./query-builder.md)
2. **Add authentication**: [Authentication Guide](./authentication.md)
3. **Real-time updates**: [Real-time Guide](./realtime.md)
4. **Explore examples**: Check the [examples directory](../examples/)

## Common Issues

### Cannot connect to server

Make sure your `BaseURL` is correct:

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    BaseURL: "https://api.cocobase.io", // Correct URL
})
```

### 401 Unauthorized

Check that your API key is valid and properly set:

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey: "your-actual-api-key", // Not "your-api-key"
})
```

### Import errors

Make sure you've installed the package:

```bash
go get github.com/lordace-coder/cocobase-go
go mod tidy
```

---

**Previous**: [Documentation Home](./README.md) | **Next**: [Client Configuration](./client-configuration.md) →
