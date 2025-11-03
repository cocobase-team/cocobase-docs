---
sidebar_position: 11
title: API Reference
---

# API Reference

Complete API reference for the Cocobase Go SDK.

## Table of Contents

- [Client](#client)
- [Configuration](#configuration)
- [Document Operations](#document-operations)
- [Query Builder](#query-builder)
- [Authentication](#authentication)
- [Real-time](#real-time)
- [Types](#types)

## Client

### NewClient

Creates a new Cocobase client instance.

```go
func NewClient(config Config) *Client
```

**Parameters:**

- `config` (Config): Client configuration

**Returns:**

- `*Client`: New client instance

**Example:**

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey: "your-api-key",
})
```

### Configuration Methods

#### SetToken

Manually set the authentication token.

```go
func (c *Client) SetToken(token string) error
```

**Parameters:**

- `token` (string): JWT authentication token

**Returns:**

- `error`: Error if storage fails

**Example:**

```go
err := client.SetToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
```

#### GetToken

Get the current authentication token.

```go
func (c *Client) GetToken() string
```

**Returns:**

- `string`: Current authentication token

**Example:**

```go
token := client.GetToken()
```

#### IsAuthenticated

Check if client is authenticated.

```go
func (c *Client) IsAuthenticated() bool
```

**Returns:**

- `bool`: `true` if authenticated, `false` otherwise

**Example:**

```go
if client.IsAuthenticated() {
    // User is logged in
}
```

#### HasRole

Check if current user has a specific role.

```go
func (c *Client) HasRole(role string) bool
```

**Parameters:**

- `role` (string): Role name to check

**Returns:**

- `bool`: `true` if user has role, `false` otherwise

**Example:**

```go
if client.HasRole("admin") {
    // User is an admin
}
```

## Configuration

### Config

Client configuration structure.

```go
type Config struct {
    APIKey     string        // Required: API key
    BaseURL    string        // Optional: Base URL (default: http://localhost:3000)
    HTTPClient *http.Client  // Optional: Custom HTTP client
    Storage    Storage       // Optional: Token storage
}
```

**Example:**

```go
config := cocobase.Config{
    APIKey:  "your-api-key",
    BaseURL: "https://api.cocobase.io",
    HTTPClient: &http.Client{
        Timeout: 30 * time.Second,
    },
    Storage: storage.NewMemoryStorage(),
}
```

### Storage Interface

```go
type Storage interface {
    Get(key string) (string, error)
    Set(key string, value string) error
    Delete(key string) error
}
```

## Document Operations

### CreateDocument

Create a new document in a collection.

```go
func (c *Client) CreateDocument(ctx context.Context, collection string, data map[string]interface{}) (*Document, error)
```

**Parameters:**

- `ctx` (context.Context): Request context
- `collection` (string): Collection name
- `data` (map[string]interface{}): Document data

**Returns:**

- `*Document`: Created document
- `error`: Error if operation fails

**Example:**

```go
doc, err := client.CreateDocument(ctx, "users", map[string]interface{}{
    "name":  "Alice",
    "email": "alice@example.com",
})
```

### GetDocument

Retrieve a document by ID.

```go
func (c *Client) GetDocument(ctx context.Context, collection, docID string) (*Document, error)
```

**Parameters:**

- `ctx` (context.Context): Request context
- `collection` (string): Collection name
- `docID` (string): Document ID

**Returns:**

- `*Document`: Retrieved document
- `error`: Error if operation fails (404 if not found)

**Example:**

```go
doc, err := client.GetDocument(ctx, "users", "doc-id-123")
```

### UpdateDocument

Update an existing document.

```go
func (c *Client) UpdateDocument(ctx context.Context, collection, docID string, data map[string]interface{}) (*Document, error)
```

**Parameters:**

- `ctx` (context.Context): Request context
- `collection` (string): Collection name
- `docID` (string): Document ID
- `data` (map[string]interface{}): Updated data (merged with existing)

**Returns:**

- `*Document`: Updated document
- `error`: Error if operation fails

**Example:**

```go
doc, err := client.UpdateDocument(ctx, "users", "doc-id-123", map[string]interface{}{
    "age": 30,
})
```

### DeleteDocument

Delete a document.

```go
func (c *Client) DeleteDocument(ctx context.Context, collection, docID string) error
```

**Parameters:**

- `ctx` (context.Context): Request context
- `collection` (string): Collection name
- `docID` (string): Document ID

**Returns:**

- `error`: Error if operation fails

**Example:**

```go
err := client.DeleteDocument(ctx, "users", "doc-id-123")
```

### ListDocuments

List documents with optional query.

```go
func (c *Client) ListDocuments(ctx context.Context, collection string, query *QueryBuilder) ([]Document, error)
```

**Parameters:**

- `ctx` (context.Context): Request context
- `collection` (string): Collection name
- `query` (\*QueryBuilder): Optional query (nil for all documents)

**Returns:**

- `[]Document`: Array of documents
- `error`: Error if operation fails

**Example:**

```go
query := cocobase.NewQuery().
    Where("status", "active").
    Limit(50)

docs, err := client.ListDocuments(ctx, "users", query)
```

### QueryDocuments

List documents with raw query string.

```go
func (c *Client) QueryDocuments(ctx context.Context, collection, rawQuery string) ([]Document, error)
```

**Parameters:**

- `ctx` (context.Context): Request context
- `collection` (string): Collection name
- `rawQuery` (string): URL-encoded query string

**Returns:**

- `[]Document`: Array of documents
- `error`: Error if operation fails

**Example:**

```go
docs, err := client.QueryDocuments(ctx, "users", "status=active&age_gte=18")
```

## Query Builder

### NewQuery

Create a new query builder.

```go
func NewQuery() *QueryBuilder
```

**Returns:**

- `*QueryBuilder`: New query builder instance

**Example:**

```go
query := cocobase.NewQuery()
```

### Comparison Operators

```go
func (qb *QueryBuilder) Where(field string, value interface{}) *QueryBuilder
func (qb *QueryBuilder) Equals(field string, value interface{}) *QueryBuilder
func (qb *QueryBuilder) NotEquals(field string, value interface{}) *QueryBuilder
func (qb *QueryBuilder) GreaterThan(field string, value interface{}) *QueryBuilder
func (qb *QueryBuilder) GreaterThanOrEqual(field string, value interface{}) *QueryBuilder
func (qb *QueryBuilder) LessThan(field string, value interface{}) *QueryBuilder
func (qb *QueryBuilder) LessThanOrEqual(field string, value interface{}) *QueryBuilder
func (qb *QueryBuilder) Between(field string, min, max interface{}) *QueryBuilder
```

### String Operators

```go
func (qb *QueryBuilder) Contains(field, substring string) *QueryBuilder
func (qb *QueryBuilder) StartsWith(field, prefix string) *QueryBuilder
func (qb *QueryBuilder) EndsWith(field, suffix string) *QueryBuilder
func (qb *QueryBuilder) Search(searchTerm string, fields ...string) *QueryBuilder
```

### List Operators

```go
func (qb *QueryBuilder) In(field string, values ...interface{}) *QueryBuilder
func (qb *QueryBuilder) NotIn(field string, values ...interface{}) *QueryBuilder
```

### Null Checks

```go
func (qb *QueryBuilder) IsNull(field string) *QueryBuilder
func (qb *QueryBuilder) IsNotNull(field string) *QueryBuilder
```

### Boolean Logic

```go
func (qb *QueryBuilder) Or() *OrBuilder
func (qb *QueryBuilder) OrGroup(groupName string) *OrBuilder
```

### Pagination

```go
func (qb *QueryBuilder) Limit(limit int) *QueryBuilder
func (qb *QueryBuilder) Offset(offset int) *QueryBuilder
func (qb *QueryBuilder) Page(page, perPage int) *QueryBuilder
```

### Sorting

```go
func (qb *QueryBuilder) OrderBy(field string) *QueryBuilder
func (qb *QueryBuilder) OrderByAsc(field string) *QueryBuilder
func (qb *QueryBuilder) OrderByDesc(field string) *QueryBuilder
func (qb *QueryBuilder) Asc() *QueryBuilder
func (qb *QueryBuilder) Desc() *QueryBuilder
```

### Helper Methods

```go
func (qb *QueryBuilder) Active() *QueryBuilder
func (qb *QueryBuilder) Deleted() *QueryBuilder
func (qb *QueryBuilder) Recent() *QueryBuilder
func (qb *QueryBuilder) Oldest() *QueryBuilder
```

### Build

```go
func (qb *QueryBuilder) Build() string
```

**Returns:**

- `string`: URL-encoded query string

**Example:**

```go
query := cocobase.NewQuery().
    Where("status", "active").
    Limit(10)

queryString := query.Build()
// Output: "status=active&limit=10"
```

## Authentication

### Register

Register a new user.

```go
func (c *Client) Register(ctx context.Context, email, password string, data map[string]interface{}) error
```

**Parameters:**

- `ctx` (context.Context): Request context
- `email` (string): User email
- `password` (string): User password
- `data` (map[string]interface{}): Optional additional user data

**Returns:**

- `error`: Error if registration fails

**Example:**

```go
err := client.Register(ctx, "user@example.com", "password123", map[string]interface{}{
    "firstName": "Alice",
    "lastName":  "Smith",
})
```

### Login

Authenticate a user.

```go
func (c *Client) Login(ctx context.Context, email, password string) error
```

**Parameters:**

- `ctx` (context.Context): Request context
- `email` (string): User email
- `password` (string): User password

**Returns:**

- `error`: Error if login fails

**Example:**

```go
err := client.Login(ctx, "user@example.com", "password123")
```

### Logout

Logout current user.

```go
func (c *Client) Logout() error
```

**Returns:**

- `error`: Error if logout fails

**Example:**

```go
err := client.Logout()
```

### InitAuth

Initialize authentication from stored token.

```go
func (c *Client) InitAuth(ctx context.Context) error
```

**Parameters:**

- `ctx` (context.Context): Request context

**Returns:**

- `error`: Error if initialization fails

**Example:**

```go
err := client.InitAuth(ctx)
if err != nil {
    // No existing session
}
```

### GetCurrentUser

Get current authenticated user.

```go
func (c *Client) GetCurrentUser(ctx context.Context) (*AppUser, error)
```

**Parameters:**

- `ctx` (context.Context): Request context

**Returns:**

- `*AppUser`: Current user
- `error`: Error if not authenticated or request fails

**Example:**

```go
user, err := client.GetCurrentUser(ctx)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("User: %s\n", user.Email)
```

### UpdateUser

Update current user.

```go
func (c *Client) UpdateUser(ctx context.Context, data map[string]interface{}, email, password *string) (*AppUser, error)
```

**Parameters:**

- `ctx` (context.Context): Request context
- `data` (map[string]interface{}): Updated user data (optional, can be nil)
- `email` (\*string): New email (optional, can be nil)
- `password` (\*string): New password (optional, can be nil)

**Returns:**

- `*AppUser`: Updated user
- `error`: Error if update fails

**Example:**

```go
newEmail := "newemail@example.com"
user, err := client.UpdateUser(ctx, map[string]interface{}{
    "phone": "+1234567890",
}, &newEmail, nil)
```

## Real-time

### WatchCollection

Watch a collection for real-time updates.

```go
func (c *Client) WatchCollection(ctx context.Context, collection string, callback func(Event), name string) (*Connection, error)
```

**Parameters:**

- `ctx` (context.Context): Request context
- `collection` (string): Collection name to watch
- `callback` (func(Event)): Event handler function
- `name` (string): Connection name (empty for auto-generated)

**Returns:**

- `*Connection`: WebSocket connection
- `error`: Error if connection fails

**Example:**

```go
conn, err := client.WatchCollection(ctx, "users", func(event cocobase.Event) {
    fmt.Printf("Event: %s\n", event.Event)
}, "users-watcher")
if err != nil {
    log.Fatal(err)
}
defer conn.Close()
```

### Connection Methods

#### Close

Close the WebSocket connection.

```go
func (conn *Connection) Close() error
```

**Returns:**

- `error`: Error if closing fails

**Example:**

```go
err := conn.Close()
```

#### IsClosed

Check if connection is closed.

```go
func (conn *Connection) IsClosed() bool
```

**Returns:**

- `bool`: `true` if closed, `false` otherwise

**Example:**

```go
if conn.IsClosed() {
    fmt.Println("Connection is closed")
}
```

## Types

### Document

```go
type Document struct {
    ID         string                 `json:"id"`
    Collection string                 `json:"collection"`
    Data       map[string]interface{} `json:"data"`
    CreatedAt  time.Time              `json:"created_at"`
    UpdatedAt  time.Time              `json:"updated_at"`
}
```

### AppUser

```go
type AppUser struct {
    ID        string                 `json:"id"`
    Email     string                 `json:"email"`
    Roles     []string               `json:"roles"`
    Data      map[string]interface{} `json:"data"`
    CreatedAt time.Time              `json:"created_at"`
    UpdatedAt time.Time              `json:"updated_at"`
}
```

### Event

```go
type Event struct {
    Event string   `json:"event"`  // "create", "update", or "delete"
    Data  Document `json:"data"`
}
```

### APIError

```go
type APIError struct {
    StatusCode int
    Method     string
    URL        string
    Body       string
    Suggestion string
}

func (e *APIError) Error() string
```

### Connection

```go
type Connection struct {
    // Internal fields (not exported)
}
```

## Constants

```go
const (
    DefaultBaseURL      = "http://localhost:3000"
    DefaultTimeout      = 30 * time.Second
    ContentTypeJSON     = "application/json"
    HeaderAPIKey        = "x-api-key"
    HeaderAuthorization = "Authorization"
)
```

---

**Previous**: [Error Handling](./error-handling.md) | **Next**: [Best Practices](./best-practices.md) →
