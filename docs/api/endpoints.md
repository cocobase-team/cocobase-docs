---
sidebar_position: 3
title: API Endpoints
---

# API Endpoints

Complete reference for COCOBASE REST API endpoints.

## Base URL

```
https://api.cocobase.buzz
```

## Authentication

All API requests require an API key in the headers:

```http
X-API-Key: your-api-key-here
```

## Collections

### List Collections

Get all collections in your project.

**Request:**

```http
GET /collections
```

**Response:**

```json
{
  "collections": ["users", "posts", "categories"]
}
```

### Create Collection

Create a new collection.

**Request:**

```http
POST /collections
Content-Type: application/json

{
  "name": "products",
  "schema": {
    "name": "string",
    "price": "number",
    "inStock": "boolean"
  }
}
```

## Documents

### Create Document

Create a new document in a collection.

**Request:**

```http
POST /collections/{collection}/documents
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

**Response:**

```json
{
  "id": "doc-123",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "created_at": "2025-11-03T10:00:00Z"
}
```

### Get Document

Retrieve a single document by ID.

**Request:**

```http
GET /collections/{collection}/documents/{id}
```

**Response:**

```json
{
  "id": "doc-123",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "created_at": "2025-11-03T10:00:00Z"
}
```

### Update Document

Update an existing document.

**Request:**

```http
PATCH /collections/{collection}/documents/{id}
Content-Type: application/json

{
  "age": 31,
  "city": "New York"
}
```

**Response:**

```json
{
  "id": "doc-123",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 31,
  "city": "New York",
  "updated_at": "2025-11-03T11:00:00Z"
}
```

### Delete Document

Delete a document.

**Request:**

```http
DELETE /collections/{collection}/documents/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### List Documents

Query documents with filtering, sorting, and pagination.

**Request:**

```http
GET /collections/{collection}/documents?status=active&age_gte=18&sort=created_at&order=desc&limit=50&offset=0
```

**Query Parameters:**

- **Filters**: Field filters with operators (e.g., `age_gte=18`, `status=active`)
- **sort**: Field to sort by (e.g., `created_at`)
- **order**: Sort order (`asc` or `desc`)
- **limit**: Maximum number of results (default: 50, max: 1000)
- **offset**: Number of results to skip for pagination
- **populate**: Comma-separated list of relationships to populate (e.g., `author,category`)
- **select**: Comma-separated list of fields to include (e.g., `id,name,email`)

**Response:**

```json
{
  "data": [
    {
      "id": "doc-123",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

## Query Operators

Use these operators as suffixes to field names:

- `_eq` or no suffix: Equals
- `_ne`: Not equals
- `_gt`: Greater than
- `_gte`: Greater than or equal
- `_lt`: Less than
- `_lte`: Less than or equal
- `_contains`: Contains substring (case-insensitive)
- `_startswith`: Starts with
- `_endswith`: Ends with
- `_in`: In list (comma-separated)
- `_notin`: Not in list
- `_isnull`: Is null (true/false)

### Examples

```http
# Greater than or equal
GET /collections/users/documents?age_gte=18

# Contains
GET /collections/posts/documents?title_contains=javascript

# In list
GET /collections/products/documents?status_in=active,pending

# Multiple fields OR
GET /collections/users/documents?name__or__email_contains=john

# OR conditions
GET /collections/users/documents?[or]age_gte=18&[or]role=admin
```

## Relationships

### Populate Related Documents

Use the `populate` parameter to fetch related documents:

```http
GET /collections/posts/documents?populate=author,category
```

### Filter by Relationship

Filter documents based on related document fields:

```http
GET /collections/posts/documents?author.role=admin&populate=author
```

## Rate Limits

- **Free tier**: 1000 requests per hour
- **Pro tier**: 10,000 requests per hour
- **Enterprise**: Custom limits

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699012345
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Next Steps

- [Error Handling](./error-handling) - Learn about error handling
- [JavaScript SDK](../javascript/introduction) - Use the JavaScript SDK
- [Python SDK](../python/introduction) - Use the Python SDK
