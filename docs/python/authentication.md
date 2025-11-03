# CocoBase Authentication Guide

CocoBase provides a built-in authentication system that allows you to register users, handle login/logout, and manage user information. This guide covers all authentication methods and best practices.

## 🔐 Authentication Overview

CocoBase authentication system includes:

- **User registration** with email and password
- **Login/logout** functionality
- **User profile management**
- **Session token handling**
- **Authentication state tracking**

## 🔑 Authentication Flow

1. **Register** a new user or **login** existing user
2. **Receive access token** automatically stored in client
3. **Make authenticated requests** using the token
4. **Logout** to clear the session

## 👤 User Registration

### Basic Registration

```python
from cocobase_client import CocoBaseClient
from cocobase_client.exceptions import CocobaseError

client = CocoBaseClient(api_key="your_api_key")

# Register a new user
try:
    success = client.register(
        email="user@example.com",
        password="securepassword123"
    )

    if success:
        print("✅ User registered successfully!")
        print(f"Authenticated: {client.is_authenticated()}")
    else:
        print("❌ Registration failed")

except CocobaseError as e:
    print(f"Registration error: {e}")
```

### Registration with Additional Data

```python
# Register user with profile data
user_data = {
    "first_name": "John",
    "last_name": "Doe",
    "age": 30,
    "preferences": {
        "theme": "dark",
        "notifications": True
    },
    "role": "user"
}

try:
    success = client.register(
        email="john@example.com",
        password="securepassword123",
        data=user_data
    )

    if success:
        print("✅ User registered with profile data!")
        # Access token is automatically set
        user_info = client.get_user_info()
        print(f"Welcome, {user_info['data']['first_name']}!")

except CocobaseError as e:
    print(f"Registration error: {e}")
```

## 🔓 User Login

### Basic Login

```python
# Login existing user
try:
    success = client.login(
        email="user@example.com",
        password="securepassword123"
    )

    if success:
        print("✅ Login successful!")
        print(f"Token set: {client.app_client_token is not None}")
    else:
        print("❌ Login failed")

except CocobaseError as e:
    print(f"Login error: {e}")
```

### Login with Error Handling

```python
def safe_login(client, email, password):
    """Login with comprehensive error handling"""
    try:
        success = client.login(email, password)

        if success:
            print("✅ Login successful!")
            return True
        else:
            print("❌ Login failed - Invalid credentials")
            return False

    except CocobaseError as e:
        error_msg = str(e).lower()

        if "invalid" in error_msg or "unauthorized" in error_msg:
            print("❌ Invalid email or password")
        elif "rate limit" in error_msg:
            print("❌ Too many login attempts. Please try again later.")
        else:
            print(f"❌ Login error: {e}")

        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

# Usage
if safe_login(client, "user@example.com", "password"):
    print("Proceeding with authenticated session...")
```

## 🚪 User Logout

```python
# Logout user (clears the token)
client.logout()
print(f"Authenticated: {client.is_authenticated()}")  # False

# After logout, you'll need to login again for authenticated operations
```

## 👥 User Information Management

### Get User Information

```python
# Get current user's information (requires authentication)
try:
    if client.is_authenticated():
        user_info = client.get_user_info()

        print(f"User ID: {user_info['id']}")
        print(f"Email: {user_info['email']}")
        print(f"Created: {user_info['created_at']}")
        print(f"Profile Data: {user_info['data']}")
    else:
        print("❌ Not authenticated")

except CocobaseError as e:
    print(f"Error getting user info: {e}")
```

### Update User Information

```python
# Update user profile
try:
    if client.is_authenticated():
        # Update profile data
        updated_data = {
            "first_name": "John Updated",
            "last_name": "Doe",
            "age": 31,
            "preferences": {
                "theme": "light",
                "notifications": False
            }
        }

        result = client.update_user_info(
            email=None,  # Keep current email
            password=None,  # Keep current password
            data=updated_data
        )

        if result:
            print("✅ Profile updated successfully!")
            print(f"Updated data: {result['data']}")
        else:
            print("❌ Failed to update profile")

except CocobaseError as e:
    print(f"Error updating profile: {e}")
```

### Update Email and Password

```python
# Update email and password
try:
    if client.is_authenticated():
        result = client.update_user_info(
            email="newemail@example.com",
            password="newsecurepassword123",
            data={}  # Keep existing profile data
        )

        if result:
            print("✅ Email and password updated!")
        else:
            print("❌ Failed to update credentials")

except CocobaseError as e:
    print(f"Error updating credentials: {e}")
```

## 🔒 Authentication State Management

### Check Authentication Status

```python
# Check if user is authenticated
if client.is_authenticated():
    print("✅ User is authenticated")
    print(f"Token: {client.app_client_token[:20]}...")  # Show partial token
else:
    print("❌ User is not authenticated")
    print("Please login first")
```

### Manual Token Management

```python
# Set token manually (if you have a stored token)
client.set_app_client_token("your_stored_token")

# Check if token is set
if client.app_client_token:
    print("Token is set")
else:
    print("No token set")

# Clear token manually
client.app_client_token = None
```

### Session Management

```python
class SessionManager:
    def __init__(self, api_key):
        self.client = CocoBaseClient(api_key=api_key)
        self.current_user = None

    def login(self, email, password):
        """Login and cache user info"""
        try:
            success = self.client.login(email, password)

            if success:
                self.current_user = self.client.get_user_info()
                print(f"✅ Logged in as: {self.current_user['email']}")
                return True
            else:
                print("❌ Login failed")
                return False

        except CocobaseError as e:
            print(f"Login error: {e}")
            return False

    def logout(self):
        """Logout and clear cached data"""
        self.client.logout()
        self.current_user = None
        print("✅ Logged out successfully")

    def get_current_user(self):
        """Get current user info"""
        if self.client.is_authenticated():
            return self.current_user
        else:
            return None

    def require_authentication(self, func):
        """Decorator to require authentication"""
        def wrapper(*args, **kwargs):
            if not self.client.is_authenticated():
                print("❌ Authentication required")
                return None
            return func(*args, **kwargs)
        return wrapper

# Usage
session = SessionManager("your_api_key")

# Login
if session.login("user@example.com", "password"):
    user = session.get_current_user()
    print(f"Welcome, {user['email']}!")

    # Use authenticated client
    @session.require_authentication
    def create_user_document(data):
        return session.client.create_document("user_docs", data)

    # This will work because user is authenticated
    doc = create_user_document({"title": "My Document", "content": "Hello World"})
```

## 🛡️ Security Best Practices

### Password Validation

```python
import re

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"

    return True, "Password is valid"

# Usage
password = "MySecurePass123"
is_valid, message = validate_password(password)
print(f"Password valid: {is_valid} - {message}")
```

## 📋 Complete Authentication Example

```python
from cocobase_client import CocoBaseClient
from cocobase_client.exceptions import CocobaseError

class AuthenticatedApp:
    def __init__(self, api_key):
        self.client = CocoBaseClient(api_key=api_key)
        self.user = None

    def register_user(self, email, password, profile_data=None):
        """Register a new user"""
        try:
            success = self.client.register(email, password, profile_data)
            if success:
                self.user = self.client.get_user_info()
                print(f"✅ User registered: {self.user['email']}")
                return True
            return False
        except CocobaseError as e:
            print(f"❌ Registration failed: {e}")
            return False

    def login_user(self, email, password):
        """Login existing user"""
        try:
            success = self.client.login(email, password)
            if success:
                self.user = self.client.get_user_info()
                print(f"✅ User logged in: {self.user['email']}")
                return True
            return False
        except CocobaseError as e:
            print(f"❌ Login failed: {e}")
            return False

    def update_profile(self, **kwargs):
        """Update user profile"""
        if not self.client.is_authenticated():
            print("❌ Not authenticated")
            return False

        try:
            # Get current user data
            current_data = self.user.get('data', {})

            # Update with new data
            updated_data = {**current_data, **kwargs}

            result = self.client.update_user_info(
                email=None,
                password=None,
                data=updated_data
            )

            if result:
                self.user = result
                print("✅ Profile updated successfully")
                return True
            return False
        except CocobaseError as e:
            print(f"❌ Profile update failed: {e}")
            return False

    def logout_user(self):
        """Logout user"""
        self.client.logout()
        self.user = None
        print("✅ User logged out")

    def get_user_profile(self):
        """Get current user profile"""
        if not self.client.is_authenticated():
            print("❌ Not authenticated")
            return None
        return self.user

# Usage Example
app = AuthenticatedApp("your_api_key")

# Register new user
user_data = {
    "first_name": "John",
    "last_name": "Doe",
    "age": 30,
    "role": "user"
}

if app.register_user("john@example.com", "SecurePass123", user_data):
    print("Registration successful!")

    # Update profile
    app.update_profile(age=31, city="New York")

    # Get profile
    profile = app.get_user_profile()
    print(f"User profile: {profile}")

    # Logout
    app.logout_user()
```

## 🎯 API Reference

### Authentication Methods

| Method                                    | Description                 | Parameters                                             | Returns |
| ----------------------------------------- | --------------------------- | ------------------------------------------------------ | ------- |
| `register(email, password, data=None)`    | Register new user           | `email`: str, `password`: str, `data`: dict (optional) | `bool`  |
| `login(email, password)`                  | Login existing user         | `email`: str, `password`: str                          | `bool`  |
| `logout()`                                | Logout current user         | None                                                   | None    |
| `is_authenticated()`                      | Check authentication status | None                                                   | `bool`  |
| `set_app_client_token(token)`             | Set token manually          | `token`: str                                           | None    |
| `get_user_info()`                         | Get current user info       | None                                                   | `dict`  |
| `update_user_info(email, password, data)` | Update user info            | `email`: str, `password`: str, `data`: dict            | `dict`  |

### Error Handling

All authentication methods can raise `CocobaseError` exceptions:

```python
try:
    client.login("user@example.com", "password")
except CocobaseError as e:
    print(f"Authentication error: {e}")
```
