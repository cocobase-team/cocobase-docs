
---
sidebar_position: 2
title: "Authentication"
---

# Authentication

All API requests require authentication using either an API key or user token.

**Base URL:** `https://api.cocobase.buzz`

---

## API Key Authentication

Use your project's API key for server-side requests.

### Header Format

```http
x-api-key: your-project-api-key
```

### Example

```bash
curl -X GET "https://api.cocobase.buzz/api/collections" \
  -H "x-api-key: pk_1234567890abcdef"
```

### Getting Your API Key

1. Log in to [cocobase.buzz](https://cocobase.buzz)
2. Go to your project settings
3. Copy your API key

⚠️ **Security Warning**: Never expose your API key in client-side code!

---

## User Token Authentication

For authenticated user requests (after login/signup).

### Header Format

```http
Authorization: Bearer user-jwt-token
```

### Example

```bash
curl -X GET "https://api.cocobase.buzz/api/auth-collections/user" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Getting a Token

#### 1. User Signup

```bash
curl -X POST "https://api.cocobase.buzz/api/auth-collections/signup" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "data": {},
    "created_at": "2025-11-04T10:00:00Z"
  }
}
```

#### 2. User Login

```bash
curl -X POST "https://api.cocobase.buzz/api/auth-collections/login" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

---

## Authentication Flow

### Client-Side (Browser/Mobile)

```javascript
// 1. User signs up
const signupRes = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/signup",
  {
    method: "POST",
    headers: {
      "x-api-key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "user@example.com",
      password: "securepass123",
    }),
  }
);

const { access_token, user } = await signupRes.json();

// 2. Store token (localStorage, secure storage, etc.)
localStorage.setItem("token", access_token);

// 3. Use token for authenticated requests
const userRes = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/user",
  {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }
);
```

### Server-Side (Node.js, Python, etc.)

```javascript
// Use API key for admin operations
const collections = await fetch("https://api.cocobase.buzz/api/collections", {
  headers: {
    "x-api-key": process.env.COCOBASE_API_KEY,
  },
});
```

---

## Token Lifecycle

### Token Expiration

- **Access Tokens**: Valid for 30 days
- **Refresh Tokens**: Coming soon

### Token Refresh

Token refresh endpoint coming soon. For now, users need to re-login after 30 days.

### Token Revocation

Logout endpoint coming soon. For now, simply delete the token from storage.

---

## Permission Levels

### API Key (Admin Access)

- ✅ Create/delete collections
- ✅ Manage all documents
- ✅ List all users
- ✅ Admin operations

### User Token (User Access)

- ✅ Read public documents
- ✅ Create/update own documents (if permitted)
- ✅ Read/update own profile
- ❌ Cannot access other users' data
- ❌ Cannot create collections

---

## Security Best Practices

### ✅ DO:

- Store API keys in environment variables
- Use HTTPS for all requests
- Implement token refresh
- Set short token expiration times
- Validate tokens on every request

### ❌ DON'T:

- Expose API keys in client-side code
- Store tokens in localStorage (use httpOnly cookies for web)
- Share API keys across projects
- Commit API keys to version control
- Use API keys for user authentication

---

## Error Responses

### 401 Unauthorized

```json
{
  "detail": "Invalid API key"
}
```

### 403 Forbidden

```json
{
  "detail": "Insufficient permissions"
}
```

### Missing Authentication

```json
{
  "detail": "Authentication required"
}
```

---

## CORS Configuration

Configure allowed origins in your project settings:

```javascript
// Allowed origins
["https://yourapp.com", "http://localhost:3000"];
```

---

## Testing Authentication

### Test API Key

```bash
curl -X GET "https://api.cocobase.buzz/api/collections" \
  -H "x-api-key: your-api-key" \
  -w "\nStatus: %{http_code}\n"
```

**Success:** Status 200  
**Failure:** Status 401

### Test User Token

```bash
curl -X GET "https://api.cocobase.buzz/api/auth-collections/user" \
  -H "Authorization: Bearer your-token" \
  -w "\nStatus: %{http_code}\n"
```

**Success:** Status 200  
**Failure:** Status 401
