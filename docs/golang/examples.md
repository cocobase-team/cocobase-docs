---
sidebar_position: 12
title: Examples
---

# Examples

Practical code examples and common use cases for the Cocobase Go SDK.

## Table of Contents

- [Basic Examples](#basic-examples)
- [Authentication Examples](#authentication-examples)
- [Query Examples](#query-examples)
- [Real-time Examples](#real-time-examples)
- [Real-World Use Cases](#real-world-use-cases)

## Basic Examples

See the complete examples in the [`examples/`](../examples/) directory.

### CRUD Operations

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    client := cocobase.NewClient(cocobase.Config{
        APIKey: "your-api-key",
    })

    ctx := context.Background()

    // Create
    doc, err := client.CreateDocument(ctx, "users", map[string]interface{}{
        "name":  "John Doe",
        "email": "john@example.com",
        "age":   30,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Created: %s\n", doc.ID)

    // Read
    doc, err = client.GetDocument(ctx, "users", doc.ID)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Retrieved: %+v\n", doc.Data)

    // Update
    doc, err = client.UpdateDocument(ctx, "users", doc.ID, map[string]interface{}{
        "age": 31,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Updated: %+v\n", doc.Data)

    // List
    query := cocobase.NewQuery().
        Where("age", 30).
        Limit(10)

    docs, err := client.ListDocuments(ctx, "users", query)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Found %d users\n", len(docs))

    // Delete
    err = client.DeleteDocument(ctx, "users", doc.ID)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Deleted successfully")
}
```

## Authentication Examples

### Complete Auth Flow

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/lordace-coder/cocobase-go/cocobase"
    "github.com/lordace-coder/cocobase-go/storage"
)

func main() {
    // Setup client with storage
    store, err := storage.NewFileStorage(".cocobase/auth.json")
    if err != nil {
        log.Fatal(err)
    }

    client := cocobase.NewClient(cocobase.Config{
        APIKey:  "your-api-key",
        Storage: store,
    })

    ctx := context.Background()

    // Try to restore existing session
    err = client.InitAuth(ctx)
    if err != nil {
        fmt.Println("No existing session, registering...")

        // Register new user
        err = client.Register(ctx, "user@example.com", "password123", map[string]interface{}{
            "firstName": "John",
            "lastName":  "Doe",
        })
        if err != nil {
            log.Fatal(err)
        }

        fmt.Println("Registered successfully")
    } else {
        fmt.Println("Session restored")
    }

    // Get current user
    user, err := client.GetCurrentUser(ctx)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Welcome, %s!\n", user.Email)

    // Update user profile
    newData := map[string]interface{}{
        "phone": "+1234567890",
    }

    user, err = client.UpdateUser(ctx, newData, nil, nil)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Profile updated: %+v\n", user.Data)

    // Logout
    err = client.Logout()
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Logged out")
}
```

## Query Examples

### Advanced Queries

See [`examples/advanced/main.go`](../examples/advanced/main.go) for complete examples.

### E-Commerce Product Search

```go
// Find available products on sale, in price range
query := cocobase.NewQuery().
    Where("inStock", true).
    Where("onSale", true).
    Between("price", 10, 100).
    Active().
    OrderBy("price").
    Limit(50)

products, err := client.ListDocuments(ctx, "products", query)
```

### User Management

```go
// Find active adult users from specific countries
query := cocobase.NewQuery().
    Where("status", "active").
    GreaterThanOrEqual("age", 18).
    OrGroup("location").
        Where("country", "US").
        Where("country", "CA").
        Where("country", "UK").
    Done().
    Recent().
    Limit(100)

users, err := client.ListDocuments(ctx, "users", query)
```

### Task Management

```go
// Find my incomplete high-priority or overdue tasks
query := cocobase.NewQuery().
    Where("assignedTo", userID).
    NotIn("status", "completed", "cancelled").
    Or().
        Equals("priority", "high").
        Where("isOverdue", true).
    Done().
    OrderByDesc("priority").
    Limit(50)

tasks, err := client.ListDocuments(ctx, "tasks", query)
```

### Content Search

```go
// Search for "golang" in title, content, or tags
query := cocobase.NewQuery().
    Search("golang", "title", "content", "tags").
    Active().
    Recent().
    Limit(20)

posts, err := client.ListDocuments(ctx, "posts", query)
```

## Real-time Examples

### Live Dashboard

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    client := cocobase.NewClient(cocobase.Config{
        APIKey: "your-api-key",
    })

    ctx := context.Background()

    // Watch orders collection
    conn, err := client.WatchCollection(ctx, "orders", func(event cocobase.Event) {
        switch event.Event {
        case "create":
            fmt.Printf("🆕 New order: %s\n", event.Data.ID)
            if total, ok := event.Data.Data["total"].(float64); ok {
                fmt.Printf("   Total: $%.2f\n", total)
            }

        case "update":
            fmt.Printf("📝 Order updated: %s\n", event.Data.ID)
            if status, ok := event.Data.Data["status"].(string); ok {
                fmt.Printf("   Status: %s\n", status)
            }

        case "delete":
            fmt.Printf("🗑️  Order deleted: %s\n", event.Data.ID)
        }
    }, "orders-dashboard")

    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()

    fmt.Println("Dashboard is live. Watching for orders...")

    // Keep running
    select {}
}
```

### Chat Application

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    client := cocobase.NewClient(cocobase.Config{
        APIKey: "your-api-key",
    })

    ctx := context.Background()

    // Watch messages
    conn, err := client.WatchCollection(ctx, "messages", func(event cocobase.Event) {
        if event.Event == "create" {
            username, _ := event.Data.Data["username"].(string)
            message, _ := event.Data.Data["message"].(string)

            fmt.Printf("[%s] %s: %s\n",
                event.Data.CreatedAt.Format("15:04:05"),
                username,
                message,
            )
        }
    }, "chat")

    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()

    fmt.Println("Chat room joined. Type messages:")

    // Send a message every 5 seconds (demo)
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        _, err := client.CreateDocument(ctx, "messages", map[string]interface{}{
            "username": "Go User",
            "message":  "Hello from Go!",
        })
        if err != nil {
            log.Printf("Error sending message: %v\n", err)
        }
    }
}
```

## Real-World Use Cases

### Blog Application

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

type BlogApp struct {
    client *cocobase.Client
    ctx    context.Context
}

func NewBlogApp(apiKey string) *BlogApp {
    return &BlogApp{
        client: cocobase.NewClient(cocobase.Config{
            APIKey: apiKey,
        }),
        ctx: context.Background(),
    }
}

func (app *BlogApp) CreatePost(title, content, authorID string, tags []string) (*cocobase.Document, error) {
    data := map[string]interface{}{
        "title":     title,
        "content":   content,
        "authorId":  authorID,
        "tags":      tags,
        "published": false,
        "views":     0,
        "createdAt": time.Now().Format(time.RFC3339),
    }

    return app.client.CreateDocument(app.ctx, "posts", data)
}

func (app *BlogApp) PublishPost(postID string) error {
    updates := map[string]interface{}{
        "published":   true,
        "publishedAt": time.Now().Format(time.RFC3339),
    }

    _, err := app.client.UpdateDocument(app.ctx, "posts", postID, updates)
    return err
}

func (app *BlogApp) GetRecentPosts(limit int) ([]cocobase.Document, error) {
    query := cocobase.NewQuery().
        Where("published", true).
        Active().
        Recent().
        Limit(limit)

    return app.client.ListDocuments(app.ctx, "posts", query)
}

func (app *BlogApp) SearchPosts(searchTerm string) ([]cocobase.Document, error) {
    query := cocobase.NewQuery().
        Where("published", true).
        Search(searchTerm, "title", "content", "tags").
        Active().
        Recent().
        Limit(50)

    return app.client.ListDocuments(app.ctx, "posts", query)
}

func (app *BlogApp) IncrementViews(postID string) error {
    // Get current views
    doc, err := app.client.GetDocument(app.ctx, "posts", postID)
    if err != nil {
        return err
    }

    views, _ := doc.Data["views"].(float64)

    // Increment
    updates := map[string]interface{}{
        "views": views + 1,
    }

    _, err = app.client.UpdateDocument(app.ctx, "posts", postID, updates)
    return err
}

func main() {
    app := NewBlogApp("your-api-key")

    // Create a post
    post, err := app.CreatePost(
        "Getting Started with Cocobase",
        "In this post, we'll explore...",
        "author-123",
        []string{"tutorial", "golang", "backend"},
    )
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Created post: %s\n", post.ID)

    // Publish it
    err = app.PublishPost(post.ID)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Post published")

    // Get recent posts
    posts, err := app.GetRecentPosts(10)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Found %d recent posts\n", len(posts))

    // Search posts
    results, err := app.SearchPosts("golang")
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Search found %d posts\n", len(results))
}
```

### Task Manager

```go
package main

import (
    "context"
    "time"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

type TaskManager struct {
    client *cocobase.Client
    ctx    context.Context
}

func NewTaskManager(apiKey string) *TaskManager {
    return &TaskManager{
        client: cocobase.NewClient(cocobase.Config{
            APIKey: apiKey,
        }),
        ctx: context.Background(),
    }
}

func (tm *TaskManager) CreateTask(title, assignee, priority string, dueDate time.Time) (*cocobase.Document, error) {
    data := map[string]interface{}{
        "title":      title,
        "assignedTo": assignee,
        "priority":   priority,
        "status":     "todo",
        "dueDate":    dueDate.Format(time.RFC3339),
        "createdAt":  time.Now().Format(time.RFC3339),
    }

    return tm.client.CreateDocument(tm.ctx, "tasks", data)
}

func (tm *TaskManager) GetMyTasks(userID string) ([]cocobase.Document, error) {
    query := cocobase.NewQuery().
        Where("assignedTo", userID).
        NotIn("status", "completed", "cancelled").
        Active().
        OrderByDesc("priority").
        Recent()

    return tm.client.ListDocuments(tm.ctx, "tasks", query)
}

func (tm *TaskManager) GetHighPriorityTasks() ([]cocobase.Document, error) {
    query := cocobase.NewQuery().
        Equals("priority", "high").
        NotEquals("status", "completed").
        Active().
        Recent()

    return tm.client.ListDocuments(tm.ctx, "tasks", query)
}

func (tm *TaskManager) CompleteTask(taskID string) error {
    updates := map[string]interface{}{
        "status":      "completed",
        "completedAt": time.Now().Format(time.RFC3339),
    }

    _, err := tm.client.UpdateDocument(tm.ctx, "tasks", taskID, updates)
    return err
}

func (tm *TaskManager) WatchTasks(callback func(cocobase.Event)) (*cocobase.Connection, error) {
    return tm.client.WatchCollection(tm.ctx, "tasks", callback, "task-watcher")
}
```

### Inventory Management

```go
package main

import (
    "context"
    "fmt"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

type InventoryManager struct {
    client *cocobase.Client
    ctx    context.Context
}

func NewInventoryManager(apiKey string) *InventoryManager {
    return &InventoryManager{
        client: cocobase.NewClient(cocobase.Config{
            APIKey: apiKey,
        }),
        ctx: context.Background(),
    }
}

func (im *InventoryManager) AddProduct(name string, sku string, quantity int, price float64) (*cocobase.Document, error) {
    data := map[string]interface{}{
        "name":     name,
        "sku":      sku,
        "quantity": quantity,
        "price":    price,
        "active":   true,
    }

    return im.client.CreateDocument(im.ctx, "inventory", data)
}

func (im *InventoryManager) UpdateStock(productID string, quantity int) error {
    updates := map[string]interface{}{
        "quantity": quantity,
    }

    _, err := im.client.UpdateDocument(im.ctx, "inventory", productID, updates)
    return err
}

func (im *InventoryManager) GetLowStockItems(threshold int) ([]cocobase.Document, error) {
    query := cocobase.NewQuery().
        Where("active", true).
        LessThanOrEqual("quantity", threshold).
        OrderBy("quantity")

    return im.client.ListDocuments(im.ctx, "inventory", query)
}

func (im *InventoryManager) SearchProducts(searchTerm string) ([]cocobase.Document, error) {
    query := cocobase.NewQuery().
        Where("active", true).
        Search(searchTerm, "name", "sku", "description").
        Limit(50)

    return im.client.ListDocuments(im.ctx, "inventory", query)
}

func (im *InventoryManager) GetProductsBySKUs(skus []string) ([]cocobase.Document, error) {
    query := cocobase.NewQuery().
        In("sku", toInterfaces(skus)...).
        Where("active", true)

    return im.client.ListDocuments(im.ctx, "inventory", query)
}

func toInterfaces(strs []string) []interface{} {
    result := make([]interface{}, len(strs))
    for i, s := range strs {
        result[i] = s
    }
    return result
}
```

## More Examples

For complete, runnable examples, see:

- [`examples/basic/main.go`](../examples/basic/main.go) - Basic CRUD operations
- [`examples/advanced/main.go`](../examples/advanced/main.go) - Advanced querying
- [`examples/auth/main.go`](../examples/auth/main.go) - Authentication flows
- [`examples/realtime/main.go`](../examples/realtime/main.go) - Real-time updates

---

**Previous**: [API Reference](./api-reference.md) | **Back to Home**: [Documentation](./README.md)
