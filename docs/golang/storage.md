---
sidebar_position: 9
title: Storage
---

# Storage

Token persistence and storage options for the Cocobase Go SDK.

## Table of Contents

- [Overview](#overview)
- [Storage Interface](#storage-interface)
- [Memory Storage](#memory-storage)
- [File Storage](#file-storage)
- [Custom Storage](#custom-storage)
- [Best Practices](#best-practices)

## Overview

Storage provides a way to persist authentication tokens and user data across application restarts. This is essential for maintaining user sessions.

### Why Use Storage?

Without storage:

- Users must log in every time the application starts
- Authentication tokens are lost on restart

With storage:

- Tokens persist across restarts
- Automatic session restoration
- Better user experience

## Storage Interface

All storage implementations must satisfy this interface:

```go
type Storage interface {
    Get(key string) (string, error)
    Set(key string, value string) error
    Delete(key string) error
}
```

### Standard Keys

The SDK uses these keys:

- `cocobase-token`: Authentication token
- `cocobase-user`: Cached user data (JSON)

## Memory Storage

In-memory storage that persists only while the application is running.

### When to Use

- Development and testing
- Short-lived applications
- When disk persistence isn't needed
- Temporary sessions

### Creating Memory Storage

```go
import "github.com/lordace-coder/cocobase-go/storage"

store := storage.NewMemoryStorage()

client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: store,
})
```

### Complete Example

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
    // Create memory storage
    store := storage.NewMemoryStorage()

    // Create client
    client := cocobase.NewClient(cocobase.Config{
        APIKey:  "your-api-key",
        Storage: store,
    })

    ctx := context.Background()

    // Login (token will be stored in memory)
    err := client.Login(ctx, "user@example.com", "password")
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Logged in successfully")

    // Token persists in memory until app exits
    if client.IsAuthenticated() {
        fmt.Println("Still authenticated")
    }
}
```

### Limitations

- Data lost when application exits
- Not shared between process instances
- No cross-session persistence

## File Storage

Persistent storage that saves data to a JSON file on disk.

### When to Use

- Production applications
- Desktop applications
- CLI tools
- When session persistence is required
- Offline-capable applications

### Creating File Storage

```go
import "github.com/lordace-coder/cocobase-go/storage"

// Create file storage
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Fatal(err)
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: store,
})
```

### File Structure

The storage file is a JSON object:

```json
{
  "cocobase-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "cocobase-user": "{\"id\":\"123\",\"email\":\"user@example.com\"...}"
}
```

### Complete Example

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

    // Create file storage
    store, err := storage.NewFileStorage(".cocobase/auth.json")
    if err != nil {
        log.Fatal(err)
    }

    // Create client
    client := cocobase.NewClient(cocobase.Config{
        APIKey:  "your-api-key",
        Storage: store,
    })

    // Try to restore existing session
    err = client.InitAuth(ctx)
    if err != nil {
        // No existing session, need to login
        fmt.Println("No existing session, please login")

        err = client.Login(ctx, "user@example.com", "password")
        if err != nil {
            log.Fatal(err)
        }

        fmt.Println("Logged in and session saved")
    } else {
        fmt.Println("Session restored from file")
    }

    // Get current user
    user, err := client.GetCurrentUser(ctx)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Welcome, %s!\n", user.Email)
}
```

### Session Restoration

```go
func restoreOrLogin(client *cocobase.Client, ctx context.Context) error {
    // Try to restore existing session
    err := client.InitAuth(ctx)
    if err == nil {
        // Session restored
        user, err := client.GetCurrentUser(ctx)
        if err == nil {
            fmt.Printf("Welcome back, %s!\n", user.Email)
            return nil
        }
    }

    // No valid session, need to login
    fmt.Println("Please log in:")

    // Get credentials (from user input, config, etc.)
    email := getEmail()
    password := getPassword()

    err = client.Login(ctx, email, password)
    if err != nil {
        return fmt.Errorf("login failed: %w", err)
    }

    fmt.Println("Logged in successfully")
    return nil
}
```

### File Location

Choose appropriate locations based on OS:

```go
import (
    "os"
    "path/filepath"
)

func getStoragePath() string {
    homeDir, _ := os.UserHomeDir()

    // Linux/Mac: ~/.cocobase/auth.json
    // Windows: C:\Users\username\.cocobase\auth.json
    return filepath.Join(homeDir, ".cocobase", "auth.json")
}

store, err := storage.NewFileStorage(getStoragePath())
```

### Handling File Errors

```go
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Printf("Failed to create file storage: %v\n", err)

    // Fallback to memory storage
    store = storage.NewMemoryStorage()
    log.Println("Using memory storage as fallback")
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: store,
})
```

## Custom Storage

Implement your own storage backend for specialized needs.

### Implementing the Interface

```go
type CustomStorage struct {
    // Your fields
}

func (s *CustomStorage) Get(key string) (string, error) {
    // Your implementation
    return "", nil
}

func (s *CustomStorage) Set(key string, value string) error {
    // Your implementation
    return nil
}

func (s *CustomStorage) Delete(key string) error {
    // Your implementation
    return nil
}
```

### Redis Storage Example

```go
package main

import (
    "context"
    "fmt"

    "github.com/go-redis/redis/v8"
)

type RedisStorage struct {
    client *redis.Client
    prefix string
}

func NewRedisStorage(addr, prefix string) *RedisStorage {
    return &RedisStorage{
        client: redis.NewClient(&redis.Options{
            Addr: addr,
        }),
        prefix: prefix,
    }
}

func (s *RedisStorage) Get(key string) (string, error) {
    val, err := s.client.Get(context.Background(), s.prefix+key).Result()
    if err == redis.Nil {
        return "", fmt.Errorf("key not found: %s", key)
    }
    return val, err
}

func (s *RedisStorage) Set(key string, value string) error {
    return s.client.Set(context.Background(), s.prefix+key, value, 0).Err()
}

func (s *RedisStorage) Delete(key string) error {
    return s.client.Del(context.Background(), s.prefix+key).Err()
}

// Usage
func main() {
    store := NewRedisStorage("localhost:6379", "cocobase:")

    client := cocobase.NewClient(cocobase.Config{
        APIKey:  "your-api-key",
        Storage: store,
    })
}
```

### Database Storage Example

```go
package main

import (
    "database/sql"
    "fmt"

    _ "github.com/lib/pq"
)

type DBStorage struct {
    db     *sql.DB
    userID string
}

func NewDBStorage(connStr, userID string) (*DBStorage, error) {
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, err
    }

    // Create table if not exists
    _, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS storage (
            user_id TEXT,
            key TEXT,
            value TEXT,
            PRIMARY KEY (user_id, key)
        )
    `)
    if err != nil {
        return nil, err
    }

    return &DBStorage{
        db:     db,
        userID: userID,
    }, nil
}

func (s *DBStorage) Get(key string) (string, error) {
    var value string
    err := s.db.QueryRow(
        "SELECT value FROM storage WHERE user_id = $1 AND key = $2",
        s.userID, key,
    ).Scan(&value)

    if err == sql.ErrNoRows {
        return "", fmt.Errorf("key not found: %s", key)
    }

    return value, err
}

func (s *DBStorage) Set(key string, value string) error {
    _, err := s.db.Exec(`
        INSERT INTO storage (user_id, key, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, key)
        DO UPDATE SET value = $3
    `, s.userID, key, value)

    return err
}

func (s *DBStorage) Delete(key string) error {
    _, err := s.db.Exec(
        "DELETE FROM storage WHERE user_id = $1 AND key = $2",
        s.userID, key,
    )
    return err
}

// Usage
func main() {
    store, err := NewDBStorage("postgres://...", "user-123")
    if err != nil {
        log.Fatal(err)
    }

    client := cocobase.NewClient(cocobase.Config{
        APIKey:  "your-api-key",
        Storage: store,
    })
}
```

### Encrypted Storage Example

```go
package main

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
    "io"

    "github.com/lordace-coder/cocobase-go/storage"
)

type EncryptedStorage struct {
    inner  storage.Storage
    cipher cipher.AEAD
}

func NewEncryptedStorage(inner storage.Storage, key []byte) (*EncryptedStorage, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }

    aesgcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    return &EncryptedStorage{
        inner:  inner,
        cipher: aesgcm,
    }, nil
}

func (s *EncryptedStorage) Get(key string) (string, error) {
    encrypted, err := s.inner.Get(key)
    if err != nil {
        return "", err
    }

    data, err := base64.StdEncoding.DecodeString(encrypted)
    if err != nil {
        return "", err
    }

    nonceSize := s.cipher.NonceSize()
    nonce, ciphertext := data[:nonceSize], data[nonceSize:]

    plaintext, err := s.cipher.Open(nil, nonce, ciphertext, nil)
    if err != nil {
        return "", err
    }

    return string(plaintext), nil
}

func (s *EncryptedStorage) Set(key string, value string) error {
    nonce := make([]byte, s.cipher.NonceSize())
    if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
        return err
    }

    ciphertext := s.cipher.Seal(nonce, nonce, []byte(value), nil)
    encrypted := base64.StdEncoding.EncodeToString(ciphertext)

    return s.inner.Set(key, encrypted)
}

func (s *EncryptedStorage) Delete(key string) error {
    return s.inner.Delete(key)
}

// Usage
func main() {
    // Create base storage
    fileStore, _ := storage.NewFileStorage(".cocobase/auth.json")

    // Wrap with encryption
    key := []byte("32-byte-encryption-key-here!!!!!")
    encryptedStore, err := NewEncryptedStorage(fileStore, key)
    if err != nil {
        log.Fatal(err)
    }

    client := cocobase.NewClient(cocobase.Config{
        APIKey:  "your-api-key",
        Storage: encryptedStore,
    })
}
```

## Best Practices

### 1. Use File Storage in Production

```go
// Good: Persistent storage for production
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Fatal(err)
}
```

### 2. Implement Error Handling

```go
// Good: Handle storage errors gracefully
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Printf("File storage failed: %v\n", err)
    store = storage.NewMemoryStorage()  // Fallback
}
```

### 3. Use Appropriate Locations

```go
// Good: Use OS-appropriate paths
import (
    "os"
    "path/filepath"
)

func getStoragePath() string {
    homeDir, _ := os.UserHomeDir()
    return filepath.Join(homeDir, ".cocobase", "auth.json")
}
```

### 4. Secure Storage Files

```go
// Good: Set appropriate file permissions
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Fatal(err)
}

// On Unix systems, restrict access
os.Chmod(".cocobase/auth.json", 0600)  // Owner read/write only
```

### 5. Initialize Auth on Startup

```go
// Good: Try to restore session on startup
err := client.InitAuth(ctx)
if err != nil {
    // No existing session, prompt for login
    promptForLogin()
}
```

### 6. Clear Storage on Logout

```go
// Good: Logout clears storage automatically
err := client.Logout()
if err != nil {
    log.Printf("Logout error: %v\n", err)
}
// Storage is now empty
```

### 7. Use Environment-Specific Storage

```go
// Good: Different storage for different environments
func getStorage() cocobase.Storage {
    if os.Getenv("ENV") == "production" {
        store, _ := storage.NewFileStorage("/var/lib/app/auth.json")
        return store
    }
    return storage.NewMemoryStorage()
}
```

### 8. Implement Cleanup

```go
// Good: Clean up resources
store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Fatal(err)
}

// If your storage needs cleanup
defer func() {
    if closer, ok := store.(io.Closer); ok {
        closer.Close()
    }
}()
```

---

**Previous**: [Real-time Updates](./realtime.md) | **Next**: [Error Handling](./error-handling.md) →
