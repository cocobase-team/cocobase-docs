---
sidebar_position: 8
title: Real-time Updates
---

# Real-time Updates

WebSocket-based real-time data synchronization with Cocobase.

## Table of Contents

- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Connection Management](#connection-management)
- [Event Handling](#event-handling)
- [Error Handling](#error-handling)
- [Advanced Patterns](#advanced-patterns)
- [Best Practices](#best-practices)

## Overview

Cocobase supports real-time updates via WebSocket connections. When documents in a collection change, your application receives instant notifications.

### Features

- **Live Updates**: Receive notifications when documents are created, updated, or deleted
- **Event-Driven**: React to changes with callback functions
- **Multiple Connections**: Watch multiple collections simultaneously
- **Named Connections**: Track connections with custom names
- **Automatic Reconnection**: Built-in connection management

### Event Types

- `create`: New document created
- `update`: Document updated
- `delete`: Document deleted

## Basic Usage

### Watch a Collection

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

    // Start watching collection
    conn, err := client.WatchCollection(ctx, "users", func(event cocobase.Event) {
        fmt.Printf("Event: %s\n", event.Event)
        fmt.Printf("Document ID: %s\n", event.Data.ID)
        fmt.Printf("Data: %+v\n", event.Data.Data)
    }, "users-watcher")

    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()

    // Keep application running
    select {}
}
```

### Event Structure

```go
type Event struct {
    Event string   `json:"event"`  // "create", "update", or "delete"
    Data  Document `json:"data"`   // The affected document
}
```

### Document in Event

```go
conn, err := client.WatchCollection(ctx, "users", func(event cocobase.Event) {
    // Access event type
    fmt.Printf("Event Type: %s\n", event.Event)

    // Access document fields
    fmt.Printf("Document ID: %s\n", event.Data.ID)
    fmt.Printf("Collection: %s\n", event.Data.Collection)
    fmt.Printf("Created: %v\n", event.Data.CreatedAt)
    fmt.Printf("Updated: %v\n", event.Data.UpdatedAt)

    // Access document data
    if name, ok := event.Data.Data["name"].(string); ok {
        fmt.Printf("Name: %s\n", name)
    }
}, "")
```

## Connection Management

### Creating Named Connections

```go
// Named connection for tracking
conn, err := client.WatchCollection(ctx, "users", handler, "users-watcher")

// Anonymous connection (auto-generated name)
conn, err := client.WatchCollection(ctx, "orders", handler, "")
```

### Closing Connections

```go
conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
if err != nil {
    log.Fatal(err)
}

// Close when done
defer conn.Close()

// Or close explicitly
err = conn.Close()
if err != nil {
    log.Printf("Error closing connection: %v\n", err)
}
```

### Check Connection Status

```go
conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
if err != nil {
    log.Fatal(err)
}

// Check if connection is closed
if conn.IsClosed() {
    fmt.Println("Connection is closed")
} else {
    fmt.Println("Connection is active")
}
```

### Multiple Connections

```go
// Watch multiple collections
usersConn, err := client.WatchCollection(ctx, "users", userHandler, "users")
if err != nil {
    log.Fatal(err)
}
defer usersConn.Close()

ordersConn, err := client.WatchCollection(ctx, "orders", orderHandler, "orders")
if err != nil {
    log.Fatal(err)
}
defer ordersConn.Close()

productsConn, err := client.WatchCollection(ctx, "products", productHandler, "products")
if err != nil {
    log.Fatal(err)
}
defer productsConn.Close()

// Keep running
select {}
```

## Event Handling

### Handling Different Event Types

```go
handler := func(event cocobase.Event) {
    switch event.Event {
    case "create":
        handleCreate(event.Data)
    case "update":
        handleUpdate(event.Data)
    case "delete":
        handleDelete(event.Data)
    default:
        fmt.Printf("Unknown event: %s\n", event.Event)
    }
}

conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
```

### Type-Specific Handlers

```go
func handleCreate(doc cocobase.Document) {
    fmt.Printf("New document created: %s\n", doc.ID)

    if name, ok := doc.Data["name"].(string); ok {
        fmt.Printf("Welcome, %s!\n", name)
    }
}

func handleUpdate(doc cocobase.Document) {
    fmt.Printf("Document updated: %s\n", doc.ID)

    // Check what changed
    if status, ok := doc.Data["status"].(string); ok {
        fmt.Printf("New status: %s\n", status)
    }
}

func handleDelete(doc cocobase.Document) {
    fmt.Printf("Document deleted: %s\n", doc.ID)
}
```

### Filtering Events

```go
handler := func(event cocobase.Event) {
    // Only handle events for specific documents
    status, ok := event.Data.Data["status"].(string)
    if !ok || status != "active" {
        return
    }

    // Process active documents only
    fmt.Printf("Active document %s: %s\n", event.Event, event.Data.ID)
}

conn, err := client.WatchCollection(ctx, "users", handler, "active-users")
```

### UI Updates

```go
handler := func(event cocobase.Event) {
    switch event.Event {
    case "create":
        // Add to UI list
        addToList(event.Data)

    case "update":
        // Update UI element
        updateInList(event.Data)

    case "delete":
        // Remove from UI
        removeFromList(event.Data.ID)
    }
}

conn, err := client.WatchCollection(ctx, "tasks", handler, "tasks-ui")
```

## Error Handling

### Connection Errors

```go
conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
if err != nil {
    // Check error type
    fmt.Printf("Failed to establish connection: %v\n", err)

    // Try alternative approach
    // ...
}
```

### Event Processing Errors

```go
handler := func(event cocobase.Event) {
    defer func() {
        if r := recover(); r != nil {
            fmt.Printf("Panic in event handler: %v\n", r)
        }
    }()

    // Process event
    processEvent(event)
}

conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
```

### Connection Loss

```go
handler := func(event cocobase.Event) {
    fmt.Printf("Event: %s\n", event.Event)
}

conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
if err != nil {
    log.Fatal(err)
}

// Monitor connection status
go func() {
    for {
        time.Sleep(5 * time.Second)

        if conn.IsClosed() {
            fmt.Println("Connection lost, attempting to reconnect...")

            // Reconnect
            newConn, err := client.WatchCollection(ctx, "users", handler, "watcher")
            if err != nil {
                fmt.Printf("Reconnection failed: %v\n", err)
                continue
            }

            conn = newConn
            fmt.Println("Reconnected successfully")
        }
    }
}()
```

## Advanced Patterns

### Debounced Updates

```go
type Debouncer struct {
    timer    *time.Timer
    duration time.Duration
    mu       sync.Mutex
}

func NewDebouncer(d time.Duration) *Debouncer {
    return &Debouncer{duration: d}
}

func (d *Debouncer) Debounce(fn func()) {
    d.mu.Lock()
    defer d.mu.Unlock()

    if d.timer != nil {
        d.timer.Stop()
    }

    d.timer = time.AfterFunc(d.duration, fn)
}

// Usage
debouncer := NewDebouncer(500 * time.Millisecond)

handler := func(event cocobase.Event) {
    debouncer.Debounce(func() {
        // This will only run if no new events come for 500ms
        updateUI()
    })
}

conn, err := client.WatchCollection(ctx, "users", handler, "debounced")
```

### Event Buffering

```go
type EventBuffer struct {
    events []cocobase.Event
    mu     sync.Mutex
}

func (b *EventBuffer) Add(event cocobase.Event) {
    b.mu.Lock()
    defer b.mu.Unlock()
    b.events = append(b.events, event)
}

func (b *EventBuffer) Flush() []cocobase.Event {
    b.mu.Lock()
    defer b.mu.Unlock()
    events := b.events
    b.events = nil
    return events
}

// Usage
buffer := &EventBuffer{}

handler := func(event cocobase.Event) {
    buffer.Add(event)
}

// Flush buffer periodically
go func() {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        events := buffer.Flush()
        if len(events) > 0 {
            processBatch(events)
        }
    }
}()

conn, err := client.WatchCollection(ctx, "users", handler, "buffered")
```

### State Synchronization

```go
type Store struct {
    data map[string]cocobase.Document
    mu   sync.RWMutex
}

func NewStore() *Store {
    return &Store{
        data: make(map[string]cocobase.Document),
    }
}

func (s *Store) handler(event cocobase.Event) {
    s.mu.Lock()
    defer s.mu.Unlock()

    switch event.Event {
    case "create", "update":
        s.data[event.Data.ID] = event.Data

    case "delete":
        delete(s.data, event.Data.ID)
    }

    fmt.Printf("Store now has %d documents\n", len(s.data))
}

func (s *Store) Get(id string) (cocobase.Document, bool) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    doc, ok := s.data[id]
    return doc, ok
}

// Usage
store := NewStore()

conn, err := client.WatchCollection(ctx, "users", store.handler, "store")
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

// Access synchronized data
doc, exists := store.Get("user-123")
if exists {
    fmt.Printf("User: %+v\n", doc.Data)
}
```

### Notification System

```go
type Notifier struct {
    subscribers []chan cocobase.Event
    mu          sync.RWMutex
}

func NewNotifier() *Notifier {
    return &Notifier{
        subscribers: make([]chan cocobase.Event, 0),
    }
}

func (n *Notifier) Subscribe() chan cocobase.Event {
    n.mu.Lock()
    defer n.mu.Unlock()

    ch := make(chan cocobase.Event, 10)
    n.subscribers = append(n.subscribers, ch)
    return ch
}

func (n *Notifier) handler(event cocobase.Event) {
    n.mu.RLock()
    defer n.mu.RUnlock()

    for _, ch := range n.subscribers {
        select {
        case ch <- event:
        default:
            // Channel full, skip
        }
    }
}

// Usage
notifier := NewNotifier()

conn, err := client.WatchCollection(ctx, "users", notifier.handler, "notifier")
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

// Subscribe in different parts of your app
ch1 := notifier.Subscribe()
ch2 := notifier.Subscribe()

go func() {
    for event := range ch1 {
        fmt.Printf("Subscriber 1: %s\n", event.Event)
    }
}()

go func() {
    for event := range ch2 {
        fmt.Printf("Subscriber 2: %s\n", event.Event)
    }
}()
```

## Best Practices

### 1. Always Close Connections

```go
// Good: Use defer to ensure cleanup
conn, err := client.WatchCollection(ctx, "users", handler, "watcher")
if err != nil {
    log.Fatal(err)
}
defer conn.Close()
```

### 2. Handle Errors in Callbacks

```go
// Good: Protect against panics
handler := func(event cocobase.Event) {
    defer func() {
        if r := recover(); r != nil {
            log.Printf("Error in handler: %v\n", r)
        }
    }()

    processEvent(event)
}
```

### 3. Use Named Connections

```go
// Good: Use descriptive names
conn, err := client.WatchCollection(ctx, "users", handler, "dashboard-users")
```

### 4. Implement Reconnection Logic

```go
// Good: Handle connection loss
func watchWithReconnect(client *cocobase.Client, ctx context.Context,
    collection string, handler func(cocobase.Event)) {

    for {
        conn, err := client.WatchCollection(ctx, collection, handler, "")
        if err != nil {
            log.Printf("Connection failed: %v\n", err)
            time.Sleep(5 * time.Second)
            continue
        }

        // Wait for connection to close
        for !conn.IsClosed() {
            time.Sleep(1 * time.Second)
        }

        log.Println("Connection lost, reconnecting...")
        time.Sleep(2 * time.Second)
    }
}
```

### 5. Filter Events When Possible

```go
// Good: Filter early to reduce processing
handler := func(event cocobase.Event) {
    // Only process updates
    if event.Event != "update" {
        return
    }

    processUpdate(event.Data)
}
```

### 6. Use Buffering for High-Frequency Updates

```go
// Good: Buffer events for batch processing
buffer := make([]cocobase.Event, 0, 100)
var mu sync.Mutex

handler := func(event cocobase.Event) {
    mu.Lock()
    buffer = append(buffer, event)
    mu.Unlock()
}

// Process buffer periodically
go func() {
    ticker := time.NewTicker(1 * time.Second)
    for range ticker.C {
        mu.Lock()
        if len(buffer) > 0 {
            processBatch(buffer)
            buffer = buffer[:0]
        }
        mu.Unlock()
    }
}()
```

### 7. Keep Handlers Fast

```go
// Good: Offload heavy processing
handler := func(event cocobase.Event) {
    // Quick processing only
    go heavyProcessing(event)  // Offload to goroutine
}

// Bad: Heavy processing in handler
// handler := func(event cocobase.Event) {
//     heavyProcessing(event)  // Blocks next event
// }
```

---

**Previous**: [Authentication](./authentication.md) | **Next**: [Storage](./storage.md) →
