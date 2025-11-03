---
sidebar_position: 5
title: Authentication
---

# Authentication

Complete guide to user authentication and management with the Cocobase Go SDK.

## Table of Contents

- [Overview](#overview)
- [Registration](#registration)
- [Login](#login)
- [Logout](#logout)
- [User Information](#user-information)
- [Update User](#update-user)
- [Authentication State](#authentication-state)
- [Role-Based Access](#role-based-access)
- [Token Persistence](#token-persistence)
- [Complete Examples](#complete-examples)

## Overview

Cocobase provides a complete authentication system with:

- Email/password authentication
- Automatic token management
- Optional token persistence
- Role-based access control
- User profile management

## Registration

### Basic Registration

```go
err := client.Register(ctx, "user@example.com", "securePassword123", nil)
if err != nil {
    log.Fatal(err)
}

fmt.Println("User registered successfully")
```

### Registration with Additional Data

```go
userData := map[string]interface{}{
    "firstName": "Alice",
    "lastName":  "Smith",
    "phone":     "+1234567890",
    "country":   "US",
}

err := client.Register(ctx, "alice@example.com", "password123", userData)
if err != nil {
    log.Fatal(err)
}
```

### Handling Registration Errors

```go
err := client.Register(ctx, email, password, data)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        switch apiErr.StatusCode {
        case 409:
            fmt.Println("Email already exists")
        case 400:
            fmt.Println("Invalid email or password")
        default:
            fmt.Printf("Registration failed: %s\n", apiErr.Suggestion)
        }
    } else {
        log.Fatal(err)
    }
}
```

## Login

### Basic Login

```go
err := client.Login(ctx, "user@example.com", "securePassword123")
if err != nil {
    log.Fatal(err)
}

fmt.Println("Logged in successfully")
```

### Login with Error Handling

```go
err := client.Login(ctx, email, password)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        switch apiErr.StatusCode {
        case 401:
            fmt.Println("Invalid credentials")
        case 403:
            fmt.Println("Account is locked or banned")
        default:
            fmt.Printf("Login failed: %s\n", apiErr.Suggestion)
        }
    } else {
        log.Fatal(err)
    }
}
```

### Auto-Login on Registration

The `Register` method automatically logs the user in after successful registration. You don't need to call `Login` separately:

```go
// Register automatically logs the user in
err := client.Register(ctx, "user@example.com", "password", nil)
if err != nil {
    log.Fatal(err)
}

// You can immediately access the user
user, err := client.GetCurrentUser(ctx)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Welcome, %s!\n", user.Email)
```

## Logout

### Basic Logout

```go
err := client.Logout()
if err != nil {
    log.Fatal(err)
}

fmt.Println("Logged out successfully")
```

Logout:

- Clears the authentication token
- Clears cached user data
- Removes stored token (if using storage)

### Safe Logout

```go
// Logout is safe to call even if not logged in
err := client.Logout()
if err != nil {
    log.Printf("Warning: Logout error: %v\n", err)
}
```

## User Information

### Get Current User

```go
user, err := client.GetCurrentUser(ctx)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("User ID: %s\n", user.ID)
fmt.Printf("Email: %s\n", user.Email)
fmt.Printf("Roles: %v\n", user.Roles)
fmt.Printf("Data: %+v\n", user.Data)
```

### User Struct

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

### Accessing User Data

```go
user, err := client.GetCurrentUser(ctx)
if err != nil {
    log.Fatal(err)
}

// Access built-in fields
fmt.Printf("Email: %s\n", user.Email)

// Access custom data
if firstName, ok := user.Data["firstName"].(string); ok {
    fmt.Printf("First Name: %s\n", firstName)
}

if age, ok := user.Data["age"].(float64); ok {
    fmt.Printf("Age: %.0f\n", age)
}
```

## Update User

### Update User Data

```go
newData := map[string]interface{}{
    "phone":   "+1234567890",
    "country": "US",
}

user, err := client.UpdateUser(ctx, newData, nil, nil)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Updated user: %+v\n", user.Data)
```

### Update Email

```go
newEmail := "newemail@example.com"

user, err := client.UpdateUser(ctx, nil, &newEmail, nil)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("New email: %s\n", user.Email)
```

### Update Password

```go
newPassword := "newSecurePassword456"

user, err := client.UpdateUser(ctx, nil, nil, &newPassword)
if err != nil {
    log.Fatal(err)
}

fmt.Println("Password updated successfully")
```

### Update Multiple Fields

```go
newData := map[string]interface{}{
    "phone": "+1234567890",
    "bio":   "Software developer",
}

newEmail := "newemail@example.com"
newPassword := "newPassword123"

user, err := client.UpdateUser(ctx, newData, &newEmail, &newPassword)
if err != nil {
    log.Fatal(err)
}

fmt.Println("All fields updated successfully")
```

### Data Merging

When updating user data, new fields are merged with existing ones:

```go
// Initial data: {"firstName": "Alice", "age": 28}

newData := map[string]interface{}{
    "age":   29,  // Updates existing field
    "city":  "NYC",  // Adds new field
}

user, err := client.UpdateUser(ctx, newData, nil, nil)
// Result: {"firstName": "Alice", "age": 29, "city": "NYC"}
```

## Authentication State

### Check if Authenticated

```go
if client.IsAuthenticated() {
    fmt.Println("User is logged in")
} else {
    fmt.Println("User is not logged in")
}
```

### Get Current Token

```go
token := client.GetToken()
if token != "" {
    fmt.Printf("Token: %s\n", token)
}
```

### Manual Token Management

```go
// Set a token manually (not recommended for normal use)
err := client.SetToken("your-jwt-token")
if err != nil {
    log.Fatal(err)
}
```

## Role-Based Access

### Check User Roles

```go
if client.HasRole("admin") {
    fmt.Println("User is an admin")
}

if client.HasRole("moderator") {
    fmt.Println("User is a moderator")
}
```

### Role-Based Logic

```go
user, err := client.GetCurrentUser(ctx)
if err != nil {
    log.Fatal(err)
}

// Check multiple roles
isStaff := false
for _, role := range user.Roles {
    if role == "admin" || role == "moderator" || role == "support" {
        isStaff = true
        break
    }
}

if isStaff {
    fmt.Println("User is a staff member")
}
```

### Protected Operations

```go
func deleteUser(client *cocobase.Client, ctx context.Context, userID string) error {
    // Check if user has permission
    if !client.HasRole("admin") {
        return fmt.Errorf("permission denied: admin role required")
    }

    return client.DeleteDocument(ctx, "users", userID)
}
```

## Token Persistence

### Using Memory Storage

```go
import "github.com/lordace-coder/cocobase-go/storage"

// Tokens persist in memory (until app restarts)
store := storage.NewMemoryStorage()

client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: store,
})
```

### Using File Storage

```go
import "github.com/lordace-coder/cocobase-go/storage"

// Tokens persist to file
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Fatal(err)
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: store,
})
```

### Initialize Auth from Storage

```go
// Create client with storage
store, _ := storage.NewFileStorage(".cocobase/auth.json")
client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: store,
})

// Load existing auth state
err := client.InitAuth(ctx)
if err != nil {
    log.Println("No existing auth state")
} else {
    fmt.Println("Restored authentication")
}
```

### Complete Persistence Flow

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
    ctx := context.Background()

    // Setup client with file storage
    store, err := storage.NewFileStorage(".cocobase/auth.json")
    if err != nil {
        log.Fatal(err)
    }

    client := cocobase.NewClient(cocobase.Config{
        APIKey:  "your-api-key",
        Storage: store,
    })

    // Try to restore existing session
    err = client.InitAuth(ctx)
    if err != nil {
        // No existing session, need to login
        err = client.Login(ctx, "user@example.com", "password")
        if err != nil {
            log.Fatal(err)
        }
        fmt.Println("Logged in")
    } else {
        fmt.Println("Restored previous session")
    }

    // Now authenticated, can make requests
    user, err := client.GetCurrentUser(ctx)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Welcome back, %s!\n", user.Email)
}
```

## Complete Examples

### Registration Flow

```go
func registerUser(client *cocobase.Client) error {
    ctx := context.Background()

    // Get user input (in real app, from form)
    email := "alice@example.com"
    password := "securePassword123"

    userData := map[string]interface{}{
        "firstName": "Alice",
        "lastName":  "Smith",
        "country":   "US",
    }

    // Register
    err := client.Register(ctx, email, password, userData)
    if err != nil {
        return fmt.Errorf("registration failed: %w", err)
    }

    // Get user info (automatically logged in)
    user, err := client.GetCurrentUser(ctx)
    if err != nil {
        return fmt.Errorf("failed to get user: %w", err)
    }

    fmt.Printf("Welcome, %s!\n", user.Email)
    return nil
}
```

### Login Flow

```go
func loginUser(client *cocobase.Client) error {
    ctx := context.Background()

    // Get credentials
    email := "user@example.com"
    password := "password123"

    // Attempt login
    err := client.Login(ctx, email, password)
    if err != nil {
        if apiErr, ok := err.(*cocobase.APIError); ok {
            switch apiErr.StatusCode {
            case 401:
                return fmt.Errorf("invalid email or password")
            case 403:
                return fmt.Errorf("account is locked")
            default:
                return fmt.Errorf("login failed: %s", apiErr.Suggestion)
            }
        }
        return err
    }

    // Get user info
    user, err := client.GetCurrentUser(ctx)
    if err != nil {
        return fmt.Errorf("failed to get user: %w", err)
    }

    fmt.Printf("Welcome back, %s!\n", user.Email)
    return nil
}
```

### Profile Update Flow

```go
func updateProfile(client *cocobase.Client) error {
    ctx := context.Background()

    // Check if authenticated
    if !client.IsAuthenticated() {
        return fmt.Errorf("not authenticated")
    }

    // Update user data
    newData := map[string]interface{}{
        "phone":   "+1234567890",
        "bio":     "Software developer",
        "website": "https://example.com",
    }

    user, err := client.UpdateUser(ctx, newData, nil, nil)
    if err != nil {
        return fmt.Errorf("update failed: %w", err)
    }

    fmt.Printf("Profile updated: %+v\n", user.Data)
    return nil
}
```

### Protected Resource Access

```go
func accessProtectedResource(client *cocobase.Client) error {
    ctx := context.Background()

    // Check authentication
    if !client.IsAuthenticated() {
        return fmt.Errorf("authentication required")
    }

    // Check role
    if !client.HasRole("admin") {
        return fmt.Errorf("admin access required")
    }

    // Access protected resource
    docs, err := client.ListDocuments(ctx, "admin_logs", nil)
    if err != nil {
        return err
    }

    fmt.Printf("Found %d admin logs\n", len(docs))
    return nil
}
```

### Session Management

```go
func manageSession(client *cocobase.Client) {
    ctx := context.Background()

    // Try to restore session
    err := client.InitAuth(ctx)
    if err == nil {
        fmt.Println("Session restored")
        return
    }

    // No session, show login
    fmt.Println("Please log in")

    // After login...
    err = client.Login(ctx, "user@example.com", "password")
    if err != nil {
        log.Fatal(err)
    }

    // Session is now active
    fmt.Println("Logged in successfully")
}
```

## Best Practices

### 1. Always Use Context

```go
// Good: Use context for cancellation/timeout
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

err := client.Login(ctx, email, password)
```

### 2. Use Storage for Persistence

```go
// Good: Enable token persistence
store, _ := storage.NewFileStorage(".cocobase/auth.json")
client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: store,
})
```

### 3. Check Authentication Before Protected Operations

```go
// Good: Check auth state
if !client.IsAuthenticated() {
    return fmt.Errorf("authentication required")
}

// Proceed with operation...
```

### 4. Handle Errors Gracefully

```go
// Good: Provide user-friendly error messages
err := client.Login(ctx, email, password)
if err != nil {
    if apiErr, ok := err.(*cocobase.APIError); ok {
        switch apiErr.StatusCode {
        case 401:
            showError("Invalid email or password")
        case 429:
            showError("Too many login attempts. Please try again later.")
        }
    }
}
```

### 5. Logout on Exit

```go
// Good: Clean up on exit
defer client.Logout()
```

---

**Previous**: [Query Builder](./query-builder.md) | **Next**: [Real-time Updates](./realtime.md) →
