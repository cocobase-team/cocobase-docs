
---
sidebar_position: 4
title: "Auth Collections API"
---

# Auth Collections API

Manage authenticated users in your application. Auth Collections provide user signup, login, profile management, and user querying.

**Base URL:** `https://api.cocobase.buzz/api/auth-collections`

**Authentication:**

- API Key (`x-api-key`) for admin operations
- User Token (`Authorization: Bearer`) for user operations

---

## Table of Contents

1. [User Signup](#user-signup)
2. [User Login](#user-login)
3. [Get Current User](#get-current-user)
4. [Update User Profile](#update-user-profile)
5. [List All Users (Admin)](#list-all-users-admin)
6. [Query Users](#query-users)
7. [Relationships](#relationships)
8. [File Uploads](#file-uploads)

---

## User Signup

Register a new user account.

### Endpoint

```http
POST /api/auth-collections/signup
```

### Authentication

Requires `x-api-key` header

### Basic Signup

```bash
curl -X POST "https://api.cocobase.buzz/api/auth-collections/signup" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### Signup with Profile Data

```bash
curl -X POST "https://api.cocobase.buzz/api/auth-collections/signup" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "name": "John Doe",
    "age": 30,
    "city": "San Francisco"
  }'
```

### Signup with File Upload (Profile Picture)

```bash
curl -X POST "https://api.cocobase.buzz/api/auth-collections/signup" \
  -H "x-api-key: your-api-key" \
  -F 'data={"email":"user@example.com","password":"securepass123","name":"John Doe"}' \
  -F "profile_picture=@avatar.jpg"
```

### JavaScript Example

```javascript
// Basic signup
const response = await fetch(
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
      name: "John Doe",
      city: "San Francisco",
    }),
  }
);

const { access_token, user } = await response.json();

// Save token for future requests
localStorage.setItem("token", access_token);

// Signup with profile picture
const formData = new FormData();
formData.append(
  "data",
  JSON.stringify({
    email: "user@example.com",
    password: "securepass123",
    name: "John Doe",
  })
);
formData.append("profile_picture", profileImageFile);

const response = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/signup",
  {
    method: "POST",
    headers: {
      "x-api-key": "your-api-key",
    },
    body: formData,
  }
);
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "data": {
      "name": "John Doe",
      "age": 30,
      "city": "San Francisco",
      "profile_picture": "https://storage.cocobase.buzz/files/avatar_xyz789.jpg"
    },
    "created_at": "2025-11-04T10:00:00Z"
  }
}
```

### Validation Rules

- **Email**: Must be valid email format, unique per project
- **Password**: Minimum 8 characters (configure in project settings)
- **Additional fields**: Any JSON-serializable data

---

## User Login

Authenticate an existing user.

### Endpoint

```http
POST /api/auth-collections/login
```

### Authentication

Requires `x-api-key` header

### Request

```bash
curl -X POST "https://api.cocobase.buzz/api/auth-collections/login" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### JavaScript Example

```javascript
const response = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/login",
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

const { access_token, user } = await response.json();
localStorage.setItem("token", access_token);
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "data": {
      "name": "John Doe",
      "age": 30,
      "city": "San Francisco"
    },
    "created_at": "2025-11-04T10:00:00Z"
  }
}
```

### Error Responses

#### 401 Invalid Credentials

```json
{
  "detail": "Invalid email or password"
}
```

#### 404 User Not Found

```json
{
  "detail": "User not found"
}
```

---

## Get Current User

Get the authenticated user's profile.

### Endpoint

```http
GET /api/auth-collections/user
```

### Authentication

Requires `Authorization: Bearer <token>` header

### Request

```bash
curl -X GET "https://api.cocobase.buzz/api/auth-collections/user" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript Example

```javascript
const token = localStorage.getItem("token");

const response = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/user",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const user = await response.json();
```

### Response

```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "data": {
    "name": "John Doe",
    "age": 30,
    "city": "San Francisco",
    "profile_picture": "https://storage.cocobase.buzz/files/avatar_xyz789.jpg"
  },
  "created_at": "2025-11-04T10:00:00Z",
  "updated_at": "2025-11-04T10:00:00Z"
}
```

---

## Update User Profile

Update the authenticated user's profile data.

### Endpoint

```http
PUT /api/auth-collections/user
```

### Authentication

Requires `Authorization: Bearer <token>` header

### Update Profile Data (JSON)

```bash
curl -X PUT "https://api.cocobase.buzz/api/auth-collections/user" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "age": 31,
    "bio": "Software developer"
  }'
```

### Update with File Upload

```bash
curl -X PUT "https://api.cocobase.buzz/api/auth-collections/user" \
  -H "Authorization: Bearer your-token" \
  -F 'data={"name":"John Smith","bio":"Software developer"}' \
  -F "profile_picture=@new_avatar.jpg"
```

### JavaScript Example

```javascript
const token = localStorage.getItem("token");

// Update profile data
const response = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/user",
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "John Smith",
      bio: "Software developer",
    }),
  }
);

// Update profile picture
const formData = new FormData();
formData.append("data", JSON.stringify({ name: "John Smith" }));
formData.append("profile_picture", newAvatarFile);

const response = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/user",
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }
);
```

### Response

```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "data": {
    "name": "John Smith",
    "age": 31,
    "bio": "Software developer",
    "profile_picture": "https://storage.cocobase.buzz/files/avatar_new_123.jpg"
  },
  "created_at": "2025-11-04T10:00:00Z",
  "updated_at": "2025-11-04T15:30:00Z"
}
```

### Protected Fields

- **Email**: Cannot be changed via this endpoint (contact support)
- **Password**: Use password reset endpoint (coming soon)
- **ID**: Immutable

---

## List All Users (Admin)

Get all users in your project. Admin endpoint using API key.

### Endpoint

```http
GET /api/auth-collections/users
```

### Authentication

Requires `x-api-key` header

### Basic Query

```bash
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users" \
  -H "x-api-key: your-api-key"
```

### With Pagination

```bash
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?limit=20&offset=0" \
  -H "x-api-key: your-api-key"
```

### Response

```json
{
  "users": [
    {
      "id": "user_abc123",
      "email": "user@example.com",
      "data": {
        "name": "John Doe",
        "city": "San Francisco"
      },
      "created_at": "2025-11-04T10:00:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

## Query Users

Advanced user querying with filters, sorting, and relationships.

### Filter by Profile Data

```bash
# Users in San Francisco
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?city_eq=San Francisco" \
  -H "x-api-key: your-api-key"

# Users aged 25-35
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?age_gte=25&age_lte=35" \
  -H "x-api-key: your-api-key"

# Users with name containing "John"
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?name_contains=John" \
  -H "x-api-key: your-api-key"
```

### Filter by Email

```bash
# Specific email
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?email_eq=user@example.com" \
  -H "x-api-key: your-api-key"

# Email domain
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?email_contains=@example.com" \
  -H "x-api-key: your-api-key"
```

### Sort Users

```bash
# Sort by created_at (newest first)
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?sort_by=created_at&sort_order=desc" \
  -H "x-api-key: your-api-key"

# Sort by name
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?sort_by=name&sort_order=asc" \
  -H "x-api-key: your-api-key"
```

### Query Parameters

| Operator     | Description               | Example                  |
| ------------ | ------------------------- | ------------------------ |
| `_eq`        | Equal to                  | `?city_eq=San Francisco` |
| `_ne`        | Not equal to              | `?status_ne=inactive`    |
| `_gt`        | Greater than              | `?age_gt=25`             |
| `_gte`       | Greater than or equal     | `?age_gte=18`            |
| `_lt`        | Less than                 | `?age_lt=65`             |
| `_lte`       | Less than or equal        | `?age_lte=65`            |
| `_contains`  | Contains substring        | `?name_contains=John`    |
| `_icontains` | Case-insensitive contains | `?email_icontains=GMAIL` |
| `_in`        | Value in list             | `?city_in=NYC,LA,SF`     |
| `_isnull`    | Is null/not null          | `?bio_isnull=false`      |

---

## Relationships

Create relationships between users (referrals, follows, etc.).

### Create User with Relationship

```bash
# User referred by another user
curl -X POST "https://api.cocobase.buzz/api/auth-collections/signup" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123",
    "name": "Jane Doe",
    "referred_by_id": "user_abc123"
  }'
```

### Query with Relationships

```bash
# Get users and populate their referrer
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?populate=referred_by" \
  -H "x-api-key: your-api-key"
```

### Response with Populated Relationship

```json
{
  "users": [
    {
      "id": "user_def456",
      "email": "newuser@example.com",
      "data": {
        "name": "Jane Doe",
        "referred_by_id": "user_abc123",
        "referred_by": {
          "id": "user_abc123",
          "email": "referrer@example.com",
          "data": {
            "name": "John Doe"
          }
        }
      }
    }
  ]
}
```

### Filter by Relationship

```bash
# Users referred by specific user
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?referred_by_id_eq=user_abc123&populate=referred_by" \
  -H "x-api-key: your-api-key"

# Users referred by someone with specific email
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?referred_by.email_eq=referrer@example.com&populate=referred_by" \
  -H "x-api-key: your-api-key"

# Users who were referred (not null)
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?referred_by_id_isnull=false" \
  -H "x-api-key: your-api-key"

# Users who were NOT referred (null)
curl -X GET "https://api.cocobase.buzz/api/auth-collections/users?referred_by_id_isnull=true" \
  -H "x-api-key: your-api-key"
```

### Common Relationship Patterns

#### Referral System

```javascript
// Get all users referred by a specific user
const response = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/users?" +
    "referred_by_id_eq=user_abc123&" +
    "populate=referred_by",
  {
    headers: { "x-api-key": "your-api-key" },
  }
);

// Count referrals
const { total } = await response.json();
console.log(`User has ${total} referrals`);
```

#### Follow System

```javascript
// User follows another user (store in profile data)
await fetch("https://api.cocobase.buzz/api/auth-collections/user", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    following: ["user_abc123", "user_def456"],
  }),
});

// Query users I'm following
const response = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/users?" +
    "id_in=user_abc123,user_def456",
  {
    headers: { "x-api-key": "your-api-key" },
  }
);
```

---

## File Uploads

Upload profile pictures, documents, and other files to user profiles.

### Supported File Types

- **Images**: jpg, jpeg, png, gif, webp, svg
- **Documents**: pdf, doc, docx
- **Max Size**: 50MB per file

### Upload Profile Picture

```bash
curl -X POST "https://api.cocobase.buzz/api/auth-collections/signup" \
  -H "x-api-key: your-api-key" \
  -F 'data={"email":"user@example.com","password":"pass123","name":"John"}' \
  -F "profile_picture=@avatar.jpg"
```

### Upload Multiple Files

```bash
curl -X PUT "https://api.cocobase.buzz/api/auth-collections/user" \
  -H "Authorization: Bearer your-token" \
  -F 'data={"name":"John Doe"}' \
  -F "profile_picture=@avatar.jpg" \
  -F "cover_photo=@cover.jpg" \
  -F "resume=@resume.pdf"
```

### JavaScript Example

```javascript
const formData = new FormData();
formData.append(
  "data",
  JSON.stringify({
    name: "John Doe",
    bio: "Developer",
  })
);
formData.append("profile_picture", profileImageFile);
formData.append("cover_photo", coverImageFile);
formData.append("resume", resumeFile);

const response = await fetch(
  "https://api.cocobase.buzz/api/auth-collections/user",
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }
);
```

### Response with File URLs

```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "data": {
    "name": "John Doe",
    "bio": "Developer",
    "profile_picture": "https://storage.cocobase.buzz/files/avatar_abc123.jpg",
    "cover_photo": "https://storage.cocobase.buzz/files/cover_def456.jpg",
    "resume": "https://storage.cocobase.buzz/files/resume_ghi789.pdf"
  }
}
```

### Replace Files

```bash
# Old profile picture is automatically deleted
curl -X PUT "https://api.cocobase.buzz/api/auth-collections/user" \
  -H "Authorization: Bearer your-token" \
  -F "profile_picture=@new_avatar.jpg"
```

---

## Complete Examples

### User Registration Flow

```javascript
// 1. User signs up
async function signup(email, password, userData) {
  const response = await fetch(
    "https://api.cocobase.buzz/api/auth-collections/signup",
    {
      method: "POST",
      headers: {
        "x-api-key": "your-api-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        ...userData,
      }),
    }
  );

  const { access_token, user } = await response.json();
  localStorage.setItem("token", access_token);
  return user;
}

// 2. User logs in
async function login(email, password) {
  const response = await fetch(
    "https://api.cocobase.buzz/api/auth-collections/login",
    {
      method: "POST",
      headers: {
        "x-api-key": "your-api-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const { access_token, user } = await response.json();
  localStorage.setItem("token", access_token);
  return user;
}

// 3. Get current user
async function getCurrentUser() {
  const token = localStorage.getItem("token");
  const response = await fetch(
    "https://api.cocobase.buzz/api/auth-collections/user",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
}

// 4. Update profile
async function updateProfile(data) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    "https://api.cocobase.buzz/api/auth-collections/user",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}
```

### Admin User Management

```javascript
// List all users
async function listUsers(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `https://api.cocobase.buzz/api/auth-collections/users?${params}`,
    {
      headers: { "x-api-key": "your-api-key" },
    }
  );
  return response.json();
}

// Get users in a specific city
const sfUsers = await listUsers({ city_eq: "San Francisco" });

// Get recent signups
const recentUsers = await listUsers({
  sort_by: "created_at",
  sort_order: "desc",
  limit: 10,
});

// Get users with referrals
const referredUsers = await listUsers({
  referred_by_id_isnull: false,
  populate: "referred_by",
});
```

### Referral System

```javascript
// Sign up with referral code
async function signupWithReferral(email, password, referrerId) {
  const response = await fetch(
    "https://api.cocobase.buzz/api/auth-collections/signup",
    {
      method: "POST",
      headers: {
        "x-api-key": "your-api-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        referred_by_id: referrerId,
      }),
    }
  );
  return response.json();
}

// Get user's referrals
async function getUserReferrals(userId) {
  const response = await fetch(
    `https://api.cocobase.buzz/api/auth-collections/users?` +
      `referred_by_id_eq=${userId}&` +
      `populate=referred_by`,
    {
      headers: { "x-api-key": "your-api-key" },
    }
  );

  const { users, total } = await response.json();
  return { referrals: users, count: total };
}

// Get top referrers
async function getTopReferrers() {
  // This would require aggregation - coming soon
  // For now, fetch all users and count in application
}
```

---

## Performance Tips

1. **Skip count on pagination**: Add `&count=false` for faster queries
2. **Limit populated relationships**: Only populate what you need
3. **Use specific filters**: More specific queries are faster
4. **Cache user data**: Users change infrequently
5. **Optimize relationship queries**: Use `populate` strategically

### Performance Comparison

```bash
# Slow (counts all users)
curl "https://api.cocobase.buzz/api/auth-collections/users?offset=1000"

# Fast (skips count)
curl "https://api.cocobase.buzz/api/auth-collections/users?offset=1000&count=false"

# Very slow (populates all relationships)
curl "https://api.cocobase.buzz/api/auth-collections/users?populate=*"

# Fast (populates only needed)
curl "https://api.cocobase.buzz/api/auth-collections/users?populate=referred_by"
```

---

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Email already registered"
}
```

### 401 Unauthorized

```json
{
  "detail": "Invalid token or token expired"
}
```

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error.email"
    }
  ]
}
```

---

## Security Best Practices

### Password Security

- Minimum 8 characters (configurable)
- Passwords are hashed with bcrypt
- Never returned in API responses

### Token Security

- Tokens expire after 30 days
- Store tokens securely (httpOnly cookies recommended)
- Never expose tokens in URLs

### Rate Limiting

- **Signup**: 10 requests/hour per IP
- **Login**: 20 requests/hour per IP
- **Other**: 1,000 requests/hour per API key

---

## Coming Soon

- ✅ Email verification
- ✅ Password reset
- ✅ OAuth (Google, GitHub)
- ✅ Two-factor authentication
- ✅ Session management
- ✅ Token refresh
- ✅ User roles and permissions
