---
sidebar_position: 4
title: Client Configuration
---

# Client Configuration

Detailed guide to configuring the Cocobase client.

## Table of Contents

- [Basic Configuration](#basic-configuration)
- [Configuration Options](#configuration-options)
- [Custom HTTP Client](#custom-http-client)
- [Base URL Configuration](#base-url-configuration)
- [Storage Configuration](#storage-configuration)
- [Environment-Based Configuration](#environment-based-configuration)
- [Advanced Configurations](#advanced-configurations)

## Basic Configuration

### Minimal Configuration

The simplest way to create a client:

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey: "your-api-key",
})
```

This uses default values for all other options.

### Full Configuration

```go
import (
    "net/http"
    "time"

    "github.com/lordace-coder/cocobase-go/cocobase"
    "github.com/lordace-coder/cocobase-go/storage"
)

client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    BaseURL: "https://api.cocobase.io",
    HTTPClient: &http.Client{
        Timeout: 30 * time.Second,
    },
    Storage: storage.NewMemoryStorage(),
})
```

## Configuration Options

### Config Structure

```go
type Config struct {
    APIKey     string        // Required: Your API key
    BaseURL    string        // Optional: API base URL
    HTTPClient *http.Client  // Optional: Custom HTTP client
    Storage    Storage       // Optional: Token storage
}
```

### Default Values

If not specified, these defaults are used:

```go
const (
    DefaultBaseURL = "http://localhost:3000"
    DefaultTimeout = 30 * time.Second
)
```

## Custom HTTP Client

### Basic Custom Client

```go
httpClient := &http.Client{
    Timeout: 60 * time.Second,
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:     "your-api-key",
    HTTPClient: httpClient,
})
```

### With Custom Transport

```go
httpClient := &http.Client{
    Timeout: 30 * time.Second,
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        IdleConnTimeout:     90 * time.Second,
        TLSHandshakeTimeout: 10 * time.Second,
    },
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:     "your-api-key",
    HTTPClient: httpClient,
})
```

### With Proxy

```go
proxyURL, _ := url.Parse("http://proxy.example.com:8080")

httpClient := &http.Client{
    Transport: &http.Transport{
        Proxy: http.ProxyURL(proxyURL),
    },
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:     "your-api-key",
    HTTPClient: httpClient,
})
```

### With TLS Configuration

```go
import "crypto/tls"

tlsConfig := &tls.Config{
    MinVersion: tls.VersionTLS12,
}

httpClient := &http.Client{
    Transport: &http.Transport{
        TLSClientConfig: tlsConfig,
    },
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:     "your-api-key",
    HTTPClient: httpClient,
})
```

### With Logging

```go
type LoggingTransport struct {
    Transport http.RoundTripper
}

func (t *LoggingTransport) RoundTrip(req *http.Request) (*http.Response, error) {
    log.Printf("Request: %s %s", req.Method, req.URL)

    resp, err := t.Transport.RoundTrip(req)

    if err != nil {
        log.Printf("Error: %v", err)
    } else {
        log.Printf("Response: %d", resp.StatusCode)
    }

    return resp, err
}

httpClient := &http.Client{
    Transport: &LoggingTransport{
        Transport: http.DefaultTransport,
    },
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:     "your-api-key",
    HTTPClient: httpClient,
})
```

## Base URL Configuration

### Development

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey:  "dev-api-key",
    BaseURL: "http://localhost:3000",
})
```

### Production

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey:  "prod-api-key",
    BaseURL: "https://api.cocobase.io",
})
```

### Custom Domain

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    BaseURL: "https://api.yourdomain.com",
})
```

## Storage Configuration

### No Storage (Default)

```go
client := cocobase.NewClient(cocobase.Config{
    APIKey: "your-api-key",
    // Storage: nil (default)
})
```

Tokens are not persisted and lost on restart.

### Memory Storage

```go
import "github.com/lordace-coder/cocobase-go/storage"

client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: storage.NewMemoryStorage(),
})
```

Tokens persist in memory until application exits.

### File Storage

```go
import "github.com/lordace-coder/cocobase-go/storage"

store, err := storage.NewFileStorage(".cocobase/auth.json")
if err != nil {
    log.Fatal(err)
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:  "your-api-key",
    Storage: store,
})
```

Tokens persist to disk across application restarts.

### Custom Storage

See [Storage Guide](./storage.md#custom-storage) for implementing custom storage.

## Environment-Based Configuration

### Using Environment Variables

```go
import "os"

client := cocobase.NewClient(cocobase.Config{
    APIKey:  os.Getenv("COCOBASE_API_KEY"),
    BaseURL: os.Getenv("COCOBASE_BASE_URL"),
})
```

### With .env Files

```go
import (
    "os"

    "github.com/joho/godotenv"
)

func init() {
    godotenv.Load()
}

func main() {
    client := cocobase.NewClient(cocobase.Config{
        APIKey:  os.Getenv("COCOBASE_API_KEY"),
        BaseURL: os.Getenv("COCOBASE_BASE_URL"),
    })
}
```

`.env` file:

```
COCOBASE_API_KEY=your-api-key
COCOBASE_BASE_URL=https://api.cocobase.io
```

### Environment-Specific Configuration

```go
func getConfig() cocobase.Config {
    env := os.Getenv("ENV")

    switch env {
    case "production":
        return cocobase.Config{
            APIKey:  os.Getenv("PROD_API_KEY"),
            BaseURL: "https://api.cocobase.io",
        }
    case "staging":
        return cocobase.Config{
            APIKey:  os.Getenv("STAGING_API_KEY"),
            BaseURL: "https://staging-api.cocobase.io",
        }
    default:
        return cocobase.Config{
            APIKey:  os.Getenv("DEV_API_KEY"),
            BaseURL: "http://localhost:3000",
        }
    }
}

client := cocobase.NewClient(getConfig())
```

## Advanced Configurations

### Singleton Pattern

```go
package main

import (
    "sync"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

var (
    client *cocobase.Client
    once   sync.Once
)

func GetClient() *cocobase.Client {
    once.Do(func() {
        client = cocobase.NewClient(cocobase.Config{
            APIKey: os.Getenv("COCOBASE_API_KEY"),
        })
    })

    return client
}

// Usage
func main() {
    client := GetClient()
    // Use client
}
```

### Configuration from File

```go
import (
    "encoding/json"
    "os"
)

type AppConfig struct {
    CocobaseAPIKey string `json:"cocobase_api_key"`
    CocobaseURL    string `json:"cocobase_url"`
}

func loadConfig(path string) (*AppConfig, error) {
    file, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    var config AppConfig
    if err := json.NewDecoder(file).Decode(&config); err != nil {
        return nil, err
    }

    return &config, nil
}

func main() {
    config, err := loadConfig("config.json")
    if err != nil {
        log.Fatal(err)
    }

    client := cocobase.NewClient(cocobase.Config{
        APIKey:  config.CocobaseAPIKey,
        BaseURL: config.CocobaseURL,
    })
}
```

### Multi-Tenant Configuration

```go
type TenantClient struct {
    clients map[string]*cocobase.Client
    mu      sync.RWMutex
}

func NewTenantClient() *TenantClient {
    return &TenantClient{
        clients: make(map[string]*cocobase.Client),
    }
}

func (tc *TenantClient) GetClient(tenantID string) *cocobase.Client {
    tc.mu.RLock()
    client, exists := tc.clients[tenantID]
    tc.mu.RUnlock()

    if exists {
        return client
    }

    tc.mu.Lock()
    defer tc.mu.Unlock()

    // Double-check after acquiring write lock
    if client, exists := tc.clients[tenantID]; exists {
        return client
    }

    // Create new client for tenant
    apiKey := getTenantAPIKey(tenantID)
    client = cocobase.NewClient(cocobase.Config{
        APIKey: apiKey,
    })

    tc.clients[tenantID] = client
    return client
}

// Usage
tenantClient := NewTenantClient()
client1 := tenantClient.GetClient("tenant-1")
client2 := tenantClient.GetClient("tenant-2")
```

### With Retry Transport

```go
type RetryTransport struct {
    Transport  http.RoundTripper
    MaxRetries int
}

func (t *RetryTransport) RoundTrip(req *http.Request) (*http.Response, error) {
    var resp *http.Response
    var err error

    for i := 0; i <= t.MaxRetries; i++ {
        resp, err = t.Transport.RoundTrip(req)

        if err == nil && resp.StatusCode < 500 {
            return resp, nil
        }

        if i < t.MaxRetries {
            time.Sleep(time.Duration(i+1) * time.Second)
        }
    }

    return resp, err
}

httpClient := &http.Client{
    Transport: &RetryTransport{
        Transport:  http.DefaultTransport,
        MaxRetries: 3,
    },
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:     "your-api-key",
    HTTPClient: httpClient,
})
```

### With Metrics Collection

```go
type MetricsTransport struct {
    Transport http.RoundTripper
    Metrics   *Metrics
}

type Metrics struct {
    RequestCount  int64
    ErrorCount    int64
    TotalDuration time.Duration
    mu            sync.Mutex
}

func (t *MetricsTransport) RoundTrip(req *http.Request) (*http.Response, error) {
    start := time.Now()

    resp, err := t.Transport.RoundTrip(req)

    duration := time.Since(start)

    t.Metrics.mu.Lock()
    t.Metrics.RequestCount++
    t.Metrics.TotalDuration += duration
    if err != nil || (resp != nil && resp.StatusCode >= 400) {
        t.Metrics.ErrorCount++
    }
    t.Metrics.mu.Unlock()

    return resp, err
}

metrics := &Metrics{}

httpClient := &http.Client{
    Transport: &MetricsTransport{
        Transport: http.DefaultTransport,
        Metrics:   metrics,
    },
}

client := cocobase.NewClient(cocobase.Config{
    APIKey:     "your-api-key",
    HTTPClient: httpClient,
})

// Check metrics
fmt.Printf("Requests: %d, Errors: %d, Avg Duration: %v\n",
    metrics.RequestCount,
    metrics.ErrorCount,
    metrics.TotalDuration/time.Duration(metrics.RequestCount))
```

## Configuration Validation

```go
func validateConfig(config cocobase.Config) error {
    if config.APIKey == "" {
        return fmt.Errorf("API key is required")
    }

    if config.BaseURL != "" {
        if _, err := url.Parse(config.BaseURL); err != nil {
            return fmt.Errorf("invalid base URL: %w", err)
        }
    }

    return nil
}

// Usage
config := cocobase.Config{
    APIKey:  os.Getenv("COCOBASE_API_KEY"),
    BaseURL: os.Getenv("COCOBASE_BASE_URL"),
}

if err := validateConfig(config); err != nil {
    log.Fatal(err)
}

client := cocobase.NewClient(config)
```

## Best Practices

### 1. Store API Keys Securely

```go
// Good: Environment variables
apiKey := os.Getenv("COCOBASE_API_KEY")

// Bad: Hard-coded
apiKey := "hardcoded-key"
```

### 2. Use Appropriate Timeouts

```go
// Good: Custom timeout based on needs
httpClient := &http.Client{
    Timeout: 30 * time.Second,
}
```

### 3. Enable Storage in Production

```go
// Good: Persistent storage
store, _ := storage.NewFileStorage(".cocobase/auth.json")

client := cocobase.NewClient(cocobase.Config{
    APIKey:  apiKey,
    Storage: store,
})
```

### 4. Reuse Client Instances

```go
// Good: Single instance
var client = cocobase.NewClient(config)

// Bad: Creating new clients
func doSomething() {
    client := cocobase.NewClient(config)  // Don't do this
}
```

### 5. Use HTTPS in Production

```go
// Good: HTTPS
BaseURL: "https://api.cocobase.io"

// Bad: HTTP in production
// BaseURL: "http://api.cocobase.io"
```

---

**Previous**: [Getting Started](./getting-started.md) | **Next**: [Document Operations](./document-operations.md) →
