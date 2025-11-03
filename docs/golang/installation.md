---
sidebar_position: 2
title: Installation
---

# Installation

Get the Cocobase Go SDK installed and ready to use in your project.

## Prerequisites

Before installing the Cocobase Go SDK, ensure you have:

- **Go 1.21 or higher** - [Download Go](https://go.dev/dl/)
- **A Cocobase API key** - [Get your API key](https://cocobase.io)
- **Git** (for go get to work)

## Install via go get

The easiest way to install the Cocobase Go SDK is using `go get`:

```bash
go get github.com/lordace-coder/cocobase-go
```

This command will:

- Download the SDK
- Install all dependencies
- Make it available in your project

## Verify Installation

Create a simple test file to verify the installation:

```go
// main.go
package main

import (
    "fmt"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    client := cocobase.NewClient(cocobase.Config{
        APIKey: "your-api-key",
    })

    if client != nil {
        fmt.Println("Cocobase SDK installed successfully!")
    }
}
```

Run it:

```bash
go run main.go
```

You should see: `Cocobase SDK installed successfully!`

## Project Setup

### Initialize a New Project

If you're starting a new project:

```bash
# Create project directory
mkdir my-cocobase-app
cd my-cocobase-app

# Initialize Go module
go mod init my-cocobase-app

# Install Cocobase SDK
go get github.com/lordace-coder/cocobase-go
```

### Add to Existing Project

If you have an existing Go project:

```bash
# Navigate to your project
cd /path/to/your/project

# Install Cocobase SDK
go get github.com/lordace-coder/cocobase-go

# Update dependencies
go mod tidy
```

## Import the SDK

Import the SDK in your Go files:

```go
import (
    "github.com/lordace-coder/cocobase-go/cocobase"
)
```

For storage functionality:

```go
import (
    "github.com/lordace-coder/cocobase-go/cocobase"
    "github.com/lordace-coder/cocobase-go/storage"
)
```

## Quick Test

Create a simple test to ensure everything works:

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/lordace-coder/cocobase-go/cocobase"
)

func main() {
    // Replace with your actual API key
    client := cocobase.NewClient(cocobase.Config{
        APIKey: "your-api-key-here",
    })

    ctx := context.Background()

    // Try to list documents
    docs, err := client.ListDocuments(ctx, "users", nil)
    if err != nil {
        log.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Success! Found %d documents\n", len(docs))
}
```

## Update the SDK

To update to the latest version:

```bash
go get -u github.com/lordace-coder/cocobase-go
go mod tidy
```

## Specific Version

To install a specific version:

```bash
go get github.com/lordace-coder/cocobase-go@v1.2.3
```

## Dependencies

The SDK has minimal dependencies. All required packages are automatically installed:

- Standard library packages (net/http, context, etc.)
- WebSocket support (golang.org/x/net/websocket)

## Troubleshooting

### "cannot find package"

If you see this error:

```
cannot find package "github.com/lordace-coder/cocobase-go/cocobase"
```

**Solution:**

```bash
go mod tidy
go get github.com/lordace-coder/cocobase-go
```

### "Go version too old"

If you see:

```
note: module requires Go 1.21
```

**Solution:** Update your Go installation to 1.21 or higher.

### "connection refused" or network errors

If `go get` fails with network errors:

**Solution:**

```bash
# Set Go proxy (if behind a firewall)
export GOPROXY=https://proxy.golang.org,direct

# Try again
go get github.com/lordace-coder/cocobase-go
```

### Module not found

If the module is not found:

**Solution:**

```bash
# Clear module cache
go clean -modcache

# Try again
go get github.com/lordace-coder/cocobase-go
```

## Environment Setup

### API Key Configuration

**Option 1: Environment Variable (Recommended)**

```bash
# Linux/Mac
export COCOBASE_API_KEY="your-api-key"

# Windows (PowerShell)
$env:COCOBASE_API_KEY="your-api-key"

# Windows (CMD)
set COCOBASE_API_KEY=your-api-key
```

Then in your code:

```go
import "os"

client := cocobase.NewClient(cocobase.Config{
    APIKey: os.Getenv("COCOBASE_API_KEY"),
})
```

**Option 2: .env File**

Install godotenv:

```bash
go get github.com/joho/godotenv
```

Create `.env`:

```
COCOBASE_API_KEY=your-api-key
COCOBASE_BASE_URL=https://api.cocobase.io
```

Load in your code:

```go
import (
    "os"

    "github.com/joho/godotenv"
    "github.com/lordace-coder/cocobase-go/cocobase"
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

## IDE Setup

### VS Code

Install the Go extension:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Go"
4. Install the official Go extension

### GoLand

GoLand has built-in Go support. Just:

1. Open your project
2. GoLand will automatically detect go.mod
3. Run/Debug configurations work out of the box

### Vim/Neovim

Install vim-go:

```vim
Plug 'fatih/vim-go', { 'do': ':GoUpdateBinaries' }
```

## Next Steps

Now that you have the SDK installed:

1. **[Getting Started](./getting-started.md)** - Create your first application
2. **[Authentication](./authentication.md)** - Set up user authentication
3. **[Document Operations](./document-operations.md)** - Learn CRUD operations

---

**Previous**: [Introduction](./introduction.md) | **Next**: [Getting Started](./getting-started.md) →
