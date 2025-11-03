---
sidebar_position: 1
title: Introduction
---

# Cocobase Go SDK

Welcome to the comprehensive documentation for the **Cocobase Go Client SDK**. This powerful SDK enables you to interact seamlessly with the Cocobase Backend as a Service (BaaS) platform using Go.

## 🌟 Key Features

- ✅ **Full CRUD Operations** - Create, read, update, and delete documents
- ✅ **Advanced Query Builder** - Intuitive, fluent API with 12+ operators
- ✅ **Boolean Logic** - Complex AND/OR conditions with named groups
- ✅ **Authentication** - Complete user management and role-based access control
- ✅ **Real-time Updates** - WebSocket-based live data synchronization
- ✅ **Pluggable Storage** - Flexible token persistence options (memory, file, custom)
- ✅ **Thread-Safe** - Safe for concurrent use in multi-goroutine applications
- ✅ **Context Support** - Proper cancellation and timeout handling
- ✅ **Type-Safe** - Strong typing with Go structs
- ✅ **Error Handling** - Comprehensive error types with suggestions

## 📚 Documentation Overview

This documentation is organized into several sections to help you get the most out of the Cocobase Go SDK:

### For Beginners

- **[Installation](./installation.md)** - Get the SDK installed and ready
- **[Getting Started](./getting-started.md)** - Your first Cocobase application
- **[Authentication](./authentication.md)** - User registration and login
- **[Document Operations](./document-operations.md)** - Basic CRUD operations

### For Intermediate Users

- **[Client Configuration](./client-configuration.md)** - Advanced client setup
- **[Query Builder](./query-builder.md)** - Powerful data filtering and sorting
- **[Storage](./storage.md)** - Token persistence strategies
- **[Error Handling](./error-handling.md)** - Handling errors gracefully

### For Advanced Users

- **[Real-time Updates](./realtime.md)** - WebSocket subscriptions
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Examples](./examples.md)** - Real-world code examples
- **[Best Practices](./best-practices.md)** - Optimization and patterns

## 🚀 Quick Start

Here's a taste of what you can do with the Cocobase Go SDK:

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

    ctx := context.Background()

    // Create a document
    doc, err := client.CreateDocument(ctx, "users", map[string]interface{}{
        "name":  "Alice",
        "email": "alice@example.com",
        "age":   28,
    })
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Created user: %s\n", doc.ID)

    // Query with filters
    query := cocobase.NewQuery().
        Where("status", "active").
        GreaterThanOrEqual("age", 18).
        Limit(50)

    users, err := client.ListDocuments(ctx, "users", query)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Found %d active users\n", len(users))
}
```

## 💡 Why Choose Cocobase Go SDK?

### Simple Yet Powerful

The SDK is designed to be easy to use for beginners while providing advanced features for experienced developers:

```go
// Simple query
query := cocobase.NewQuery().Where("status", "active")

// Complex query with boolean logic
query := cocobase.NewQuery().
    Where("status", "active").
    Or().
        GreaterThan("age", 18).
        Where("isVerified", true).
    Done()
```

### Type-Safe and Idiomatic Go

Built with Go best practices in mind:

- Context support for cancellation and timeouts
- Proper error handling with detailed error types
- Thread-safe for concurrent use
- Fluent API design
- Strong typing with structs

### Production-Ready

- Comprehensive error handling
- Retry logic support
- Token persistence
- Connection management
- Logging capabilities

## 📦 What's Included

The SDK provides everything you need to build applications with Cocobase:

- **Client Package** - Core client with all methods
- **Storage Package** - Memory and file storage implementations
- **Types** - Document, AppUser, Event, and more
- **Query Builder** - Fluent query construction
- **WebSocket Support** - Real-time subscriptions

## 🎯 Common Use Cases

The Cocobase Go SDK is perfect for:

- **Web Applications** - Backend services and APIs
- **CLI Tools** - Command-line applications
- **Microservices** - Distributed systems
- **IoT Applications** - Device data management
- **Mobile Backends** - Supporting mobile apps
- **Real-time Apps** - Chat, notifications, live dashboards

## 📖 Prerequisites

Before using the Cocobase Go SDK, you should have:

- Go 1.21 or higher installed
- Basic understanding of Go programming
- A Cocobase API key ([get one here](https://cocobase.io))
- Familiarity with REST APIs (helpful but not required)

## 🔗 Resources

- **[GitHub Repository](https://github.com/lordace-coder/cocobase-go)** - Source code and issues
- **[Cocobase Platform](https://cocobase.io)** - Main website
- **[API Documentation](./api-reference.md)** - Complete API reference
- **[Examples](./examples.md)** - Real-world code examples

## 🤝 Community and Support

- **GitHub Issues** - Report bugs or request features
- **Documentation** - This comprehensive guide
- **Examples** - Learn from working code

## 📝 License

The Cocobase Go SDK is released under the MIT License. See the [LICENSE](https://github.com/lordace-coder/cocobase-go/blob/main/LICENSE) file for details.

---

**Ready to get started?** → [Install the SDK](./installation.md)
