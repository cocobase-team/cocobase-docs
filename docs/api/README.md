# CocoBase API Documentation

Welcome to the CocoBase API documentation! CocoBase is a powerful Backend-as-a-Service (BaaS) platform that provides instant APIs for your applications.

**Base URL:** `https://api.cocobase.buzz`

---

## Quick Links

- 🔐 [**Authentication**](./authentication.md) - API keys and user tokens
- 📦 [**Collections API**](./collections.md) - Manage custom data collections
- 👤 [**Auth Collections API**](./auth-collections.md) - User authentication and management

---

## Getting Started

### 1. Create a Project

Sign up at [cocobase.buzz](https://cocobase.buzz) and create a new project. You'll receive:

- **Project ID**: Your unique project identifier
- **API Key**: Used for server-side requests

### 2. Make Your First Request

```bash
curl -X GET "https://api.cocobase.buzz/api/collections" \
  -H "x-api-key: your-api-key"
```

### 3. Create a Collection

```bash
curl -X POST "https://api.cocobase.buzz/api/collections" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "posts",
    "schema": {
      "title": {"type": "string", "required": true},
      "content": {"type": "string"},
      "published": {"type": "boolean", "default": false}
    }
  }'
```

### 4. Add Documents

```bash
curl -X POST "https://api.cocobase.buzz/api/collections/posts/documents" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "title": "My First Post",
      "content": "Hello World!",
      "published": true
    }
  }'
```

## Core Concepts

### Collections

Custom data containers (like database tables). Define your own schema and store any JSON data.

### Documents

Individual records within a collection (like database rows).

### Auth Collections

Built-in user authentication system with JWT tokens, user management, and permissions.

### Relationships

Link documents together (e.g., posts → author, comments → user).

### Real-time

WebSocket support for live data updates (coming soon).

## Features

✅ **Instant REST API** - No backend code needed  
✅ **Custom Collections** - Define your own data structures  
✅ **User Authentication** - Built-in auth with JWT  
✅ **File Uploads** - Upload and store files  
✅ **Advanced Queries** - Filters, sorting, pagination  
✅ **Relationships** - Link data across collections  
✅ **Permissions** - Role-based access control  
✅ **Real-time** - WebSocket subscriptions

## Rate Limits

- **Free Tier**: 1,000 requests/day
- **Pro Tier**: 100,000 requests/day
- **Enterprise**: Custom limits

## Support

- **Email**: support@cocobase.buzz
- **Discord**: [Join our community](https://discord.gg/cocobase)
- **GitHub**: [github.com/cocobase](https://github.com/cocobase)

## SDKs

- **JavaScript/TypeScript**: `npm install @cocobase/sdk`
- **Python**: `pip install cocobase`
- **Go**: Coming soon
- **Flutter/Dart**: Coming soon
