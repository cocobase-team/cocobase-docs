# Client Setup Guide

The `CocoBaseClient` class is the main entry point for interacting with the CocoBase API. This guide covers initialization, configuration, and basic usage.

## 🔧 Installation

Install the CocoBase Python SDK:

```bash
pip install cocobase
```

## 🚀 Basic Initialization

### Simple Setup

```python
from cocobase_client import CocoBaseClient

# Initialize with API key only
client = CocoBaseClient(api_key="your_api_key_here")
```

### With App Client Token

```python
# Initialize with API key and optional app client token
client = CocoBaseClient(
    api_key="your_api_key_here",
    token="optional_app_client_token"
)
```

## 📋 Constructor Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_key` | `str` | ✅ Yes | Your CocoBase API key |
| `token` | `str \| None` | ❌ No | Optional app client token for authenticated requests |

## 🔐 API Key Management

### Getting Your API Key

1. Log into your CocoBase dashboard
2. Navigate to Settings → API Keys
3. Copy your API key
4. Keep it secure and never expose it in client-side code

### Environment Variables (Recommended)

```python
import os
from cocobase_client import CocoBaseClient

# Using environment variables for security
client = CocoBaseClient(
    api_key=os.getenv("COCOBASE_API_KEY")
)
```

### Configuration File

```python
# config.py
COCOBASE_API_KEY = "your_api_key_here"

# main.py
from config import COCOBASE_API_KEY
from cocobase_client import CocoBaseClient

client = CocoBaseClient(api_key=COCOBASE_API_KEY)
```

## 🔄 Client Token Management

The client token is used for user authentication and can be set in multiple ways:

### During Initialization

```python
client = CocoBaseClient(
    api_key="your_api_key",
    token="user_session_token"
)
```

### Using the Setter Method

```python
client = CocoBaseClient(api_key="your_api_key")
client.set_app_client_token("user_session_token")
```

### After Authentication

```python
# Token is automatically set after successful login
client = CocoBaseClient(api_key="your_api_key")
success = client.login("user@example.com", "password")
# client.app_client_token is now set
```

## 🔍 Checking Authentication Status

```python
# Check if the client has a valid token
if client.is_authenticated():
    print("Client is authenticated")
    user_info = client.get_user_info()
else:
    print("Client is not authenticated")
```

## 🌐 Custom Headers and Configuration

The client handles headers automatically, but you can understand the internal structure:

```python
# The client automatically adds these headers:
# - "x-api-key": Your API key
# - "Authorization": Bearer token (when authenticated)
# - "Content-Type": application/json (for POST/PATCH requests)
```

## 📝 Example: Complete Setup

Here's a complete example showing different initialization patterns:

```python
import os
from cocobase_client import CocoBaseClient

class DatabaseManager:
    def __init__(self):
        # Initialize client with environment variable
        self.client = CocoBaseClient(
            api_key=os.getenv("COCOBASE_API_KEY")
        )
        
    def authenticate_user(self, email: str, password: str):
        """Authenticate a user and set the client token"""
        try:
            success = self.client.login(email, password)
            if success:
                print("User authenticated successfully")
                return True
            else:
                print("Authentication failed")
                return False
        except Exception as e:
            print(f"Authentication error: {e}")
            return False
    
    def get_authenticated_client(self):
        """Get the authenticated client"""
        if self.client.is_authenticated():
            return self.client
        else:
            raise Exception("Client is not authenticated")

# Usage
db_manager = DatabaseManager()
db_manager.authenticate_user("user@example.com", "password")
client = db_manager.get_authenticated_client()
```

## ⚠️ Important Notes

### Security Best Practices

1. **Never hardcode API keys** in your source code
2. **Use environment variables** or secure configuration files
3. **Rotate API keys regularly** in production
4. **Use different API keys** for different environments (dev, staging, prod)

### Error Handling

```python
from cocobase_client import CocoBaseClient
from cocobase_client.exceptions import CocobaseError

try:
    client = CocoBaseClient(api_key="invalid_key")
    # Any API call will raise an exception with invalid key
    collections = client.list_collections()
except CocobaseError as e:
    print(f"CocoBase API error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## 🔄 Client Instance Management

### Singleton Pattern

```python
class CocoBaseManager:
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CocoBaseManager, cls).__new__(cls)
        return cls._instance
    
    def get_client(self):
        if self._client is None:
            self._client = CocoBaseClient(
                api_key=os.getenv("COCOBASE_API_KEY")
            )
        return self._client

# Usage
manager = CocoBaseManager()
client = manager.get_client()
```

## 📊 Client State Properties

| Property | Type | Description |
|----------|------|-------------|
| `api_key` | `str` | Your CocoBase API key |
| `app_client_token` | `str \| None` | Current user session token |

## 🔧 Advanced Configuration

### Custom Base URL (If Available)

```python
# The client uses a predefined base URL from config
# Check cocobase_client.config for current settings
from cocobase_client.config import BASEURL
print(f"API Base URL: {BASEURL}")
```

---

**Next Steps:**
- [Collections Guide](collections) - Learn to manage collections
- [Authentication Guide](authentication) - Detailed authentication methods
