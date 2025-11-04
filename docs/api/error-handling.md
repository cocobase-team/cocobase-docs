---
sidebar_position: 6
title: Error Handling
---

# Error Handling

Learn how to handle errors when using the COCOBASE API.

## Error Response Format

All API errors return a consistent JSON structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "field_name",
      "additionalInfo": "..."
    }
  }
}
```

## HTTP Status Codes

### 400 - Bad Request

Invalid request data or parameters.

**Example:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "not-an-email"
    }
  }
}
```

### 401 - Unauthorized

Missing or invalid API key.

**Example:**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

### 403 - Forbidden

Insufficient permissions for the requested operation.

**Example:**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to delete this resource"
  }
}
```

### 404 - Not Found

Resource doesn't exist.

**Example:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Document not found",
    "details": {
      "collection": "users",
      "id": "non-existent-id"
    }
  }
}
```

### 429 - Too Many Requests

Rate limit exceeded.

**Example:**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 1000,
      "reset": 1699012345
    }
  }
}
```

### 500 - Internal Server Error

Unexpected server error.

**Example:**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Error Codes

### Authentication Errors

- `UNAUTHORIZED` - Missing or invalid API key
- `FORBIDDEN` - Insufficient permissions
- `TOKEN_EXPIRED` - Authentication token has expired

### Validation Errors

- `VALIDATION_ERROR` - Invalid input data
- `MISSING_FIELD` - Required field is missing
- `INVALID_FORMAT` - Field format is invalid
- `DUPLICATE_KEY` - Unique constraint violation

### Resource Errors

- `NOT_FOUND` - Resource doesn't exist
- `ALREADY_EXISTS` - Resource already exists
- `COLLECTION_NOT_FOUND` - Collection doesn't exist

### Query Errors

- `INVALID_QUERY` - Invalid query syntax
- `INVALID_OPERATOR` - Unsupported query operator
- `INVALID_SORT_FIELD` - Invalid field for sorting

### Rate Limiting

- `RATE_LIMIT_EXCEEDED` - Too many requests

## JavaScript SDK Error Handling

```typescript
import { buildFilterQuery } from "coco_base_js";

try {
  const query = buildFilterQuery({
    filters: { status: "active" },
    limit: 50,
  });

  const response = await fetch(
    `${baseUrl}/collections/users/documents?${query}`,
    {
      headers: {
        "X-API-Key": apiKey,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    switch (response.status) {
      case 400:
        console.error("Validation error:", error.error.message);
        break;
      case 401:
        console.error("Unauthorized:", error.error.message);
        // Redirect to login
        break;
      case 404:
        console.error("Not found:", error.error.message);
        break;
      case 429:
        console.error("Rate limit exceeded");
        // Implement retry with backoff
        break;
      default:
        console.error("Error:", error.error.message);
    }

    throw new Error(error.error.message);
  }

  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error("Request failed:", error);
}
```

## Python SDK Error Handling

```python
from cocobase import Cocobase, CocobaseError

db = Cocobase(api_key='your-api-key')

try:
    user = db.create_document('users', {
        'name': 'John Doe',
        'email': 'john@example.com'
    })
except CocobaseError as e:
    if e.status_code == 400:
        print(f"Validation error: {e.message}")
    elif e.status_code == 401:
        print("Unauthorized - check your API key")
    elif e.status_code == 429:
        print("Rate limit exceeded - slow down")
    else:
        print(f"Error: {e.message}")
```

## Best Practices

### 1. Always Check Response Status

```typescript
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error.message);
}
```

### 2. Implement Retry Logic for Rate Limits

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url);

    if (response.status === 429) {
      const resetTime = response.headers.get("X-RateLimit-Reset");
      const waitTime = resetTime
        ? new Date(parseInt(resetTime) * 1000).getTime() - Date.now()
        : Math.pow(2, i) * 1000; // Exponential backoff

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }

    return response;
  }

  throw new Error("Max retries exceeded");
}
```

### 3. Log Errors for Debugging

```typescript
try {
  // API call
} catch (error) {
  console.error("API Error:", {
    timestamp: new Date().toISOString(),
    error: error,
    request: requestData,
  });

  // Send to error tracking service
  errorTracker.captureException(error);
}
```

### 4. Handle Network Errors

```typescript
try {
  const response = await fetch(url);
  // ...
} catch (error) {
  if (error instanceof TypeError) {
    console.error("Network error - check your connection");
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### 5. Validate Data Before Sending

```typescript
function validateUser(user: any) {
  if (!user.email || !user.email.includes("@")) {
    throw new Error("Invalid email format");
  }

  if (!user.name || user.name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  return true;
}

try {
  validateUser(userData);
  const response = await createUser(userData);
} catch (error) {
  // Handle validation error
}
```

## Error Monitoring

Consider integrating error monitoring services:

- [Sentry](https://sentry.io) - Application monitoring
- [LogRocket](https://logrocket.com) - Frontend monitoring
- [Datadog](https://www.datadoghq.com) - Infrastructure monitoring

## Next Steps

- [JavaScript SDK](../javascript/introduction) - Use the JavaScript SDK
- [API Endpoints](./endpoints) - View all available endpoints
- [Examples](../examples/sample-project) - See complete examples
