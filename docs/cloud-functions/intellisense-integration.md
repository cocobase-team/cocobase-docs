# Monaco Editor IntelliSense Integration for Python Cloud Functions

This guide explains how to integrate Monaco Editor with full IntelliSense support for your Python cloud functions.

## Overview

The backend provides several endpoints that return type definitions, code examples, and operator documentation to enable rich autocomplete and IntelliSense in the Monaco Editor on your frontend.

## Available Endpoints

### 1. Python Type Stubs

**Endpoint:** `GET /intellisense/python-stubs`

Returns Python type stub (.pyi) content with full type definitions for:

- `request` object (user, method, body, query, headers, path)
- `db` object (query, find_one, create, update, delete, query_users, etc.)
- `render` object (render_html, render_template, render_string)
- Built-in modules (json, datetime, math, re)
- Exception types

**Response:**

```json
{
  "content": "# Python type stubs...",
  "language": "python"
}
```

### 2. Python Code Examples

**Endpoint:** `GET /intellisense/python-examples`

Returns 10 code examples covering:

- Hello World
- Getting current user
- Querying collections
- Creating documents
- Updating documents
- Querying users by JSONB fields
- Using helper functions
- Rendering HTML templates
- Handling HTTP methods
- Error handling

**Response:**

```json
{
  "examples": [
    {
      "title": "Hello World",
      "description": "Simple function returning JSON",
      "code": "def main():\n    return {...}"
    }
  ],
  "language": "python"
}
```

### 3. Query Operators Documentation

**Endpoint:** `GET /intellisense/operators`

Returns documentation for all available query operators:

- Comparison: eq, ne, gt, gte, lt, lte
- String: contains, startswith, endswith, icontains, istartswith, iendswith
- Array: in, notin
- Null: isnull

**Response:**

```json
{
  "comparison": {
    "eq": "Equal to (default)",
    "ne": "Not equal to",
    ...
  },
  "string": { ... },
  "array": { ... },
  "null": { ... },
  "examples": [
    {
      "query": "age_gte=18",
      "description": "Users 18 or older"
    }
  ]
}
```

## Integration with Monaco Editor

### Step 1: Install Dependencies

```bash
npm install @monaco-editor/react monaco-editor
```

### Step 2: Use the CloudFunctionEditor Component

See `examples/CloudFunctionEditor.tsx` for a complete implementation.

```tsx
import CloudFunctionEditor from "@/components/CloudFunctionEditor";

function MyPage() {
  const [code, setCode] = useState(
    'def main():\n    return {"message": "Hello"}'
  );

  return (
    <CloudFunctionEditor
      value={code}
      onChange={setCode}
      apiBaseUrl="https://your-api.com"
      height="600px"
    />
  );
}
```

### Step 3: Configure Monaco IntelliSense

The component automatically:

1. Fetches Python type stubs on mount
2. Registers completion providers for `request`, `db`, `render` objects
3. Adds hover documentation for all cloud function globals
4. Provides code snippets for common patterns

## Features Provided

### Autocomplete

- Type `request.` to see all request properties (user, method, body, query, headers)
- Type `db.` to see all database methods (query, create, update, delete, query_users)
- Type `render.` to see all render methods (render_html, render_template, render_string)

### Code Snippets

- `main_function` - Creates a basic main() template
- `query_pattern` - Database query with result handling
- `method_routing` - HTTP method routing pattern

### Hover Documentation

- Hover over `request`, `db`, `render`, or `main` to see documentation
- Shows parameter types and return types

### Examples Toolbar

- Quick insert buttons for common examples
- One-click insertion of complete code patterns

## Cloud Function API Reference

### Request Object

```python
request.user          # AppUser | None - Authenticated user
request.method        # str - HTTP method (GET, POST, etc.)
request.body          # dict - Request body
request.query         # dict - Query parameters
request.headers       # dict - Request headers
request.path          # str - URL path
request.proj          # str - Project ID
```

### Database Object

```python
# Query collections
db.query(collection, **filters) -> QueryResult
db.find_one(collection, **filters) -> dict | None

# CRUD operations
db.create(collection, data) -> dict
db.update(collection, id, data) -> dict
db.delete(collection, id) -> dict

# User management
db.query_users(**filters) -> QueryResult
db.find_user(**filters) -> AppUser | None
db.create_app_user(email, password, data=None) -> AppUser
db.update_app_user(user_id, data) -> AppUser
db.delete_app_user(user_id) -> AppUser
```

### Render Object

```python
# Render HTML with Jinja2
render.render_html(html_content, context=None, status_code=200)

# Render stored template from B2
render.render_template(template_name, context=None, status_code=200)

# Render to string (not Response)
render.render_string(html_content, context=None) -> str
```

### Query Operators

Use double underscores for operators:

```python
# Comparison
db.query("users", age__gte=18)          # age >= 18
db.query("users", age__lt=65)           # age < 65

# String operations
db.query("users", email__contains="@gmail.com")
db.query("users", name__startswith="John")
db.query("users", name__icontains="smith")  # Case-insensitive

# Array operations
db.query("users", status__in="active,pending")
db.query("users", role__notin="admin,moderator")

# Null checks
db.query_users(referred_by__isnull=True)   # No referrer
db.query_users(referred_by__isnull=False)  # Has referrer

# JSONB fields (users only)
db.query_users(referred_by="user-id-123")  # Custom data field
```

## Helper Functions Support

You can now define helper functions outside `main()`:

```python
def calculate_total(items):
    return sum(item["price"] for item in items)

def apply_discount(total, percent):
    return total * (1 - percent / 100)

def main():
    items = request.body.get("items", [])

    total = calculate_total(items)
    final = apply_discount(total, 10)

    return {"total": final}
```

## Performance Optimization

The cloud function execution service now includes:

- **Code Caching**: Compiled code is cached per function (50-100x faster on subsequent runs)
- **Performance Metrics**: Response includes compile_time_ms, exec_time_ms, main_time_ms, and cached flag

## Exception Handling

Built-in exception types available:

- `Exception`
- `ValueError`
- `TypeError`
- `KeyError`
- `IndexError`
- `AttributeError`
- `RuntimeError`
- `ZeroDivisionError`
- `FileNotFoundError`

## Example: Complete Cloud Function

```python
def validate_post(data):
    """Helper function to validate post data"""
    if not data.get("title"):
        raise ValueError("Title is required")
    if not data.get("content"):
        raise ValueError("Content is required")
    return True

def get_user_or_error():
    """Helper function to get authenticated user"""
    user = request.user
    if not user:
        raise ValueError("Authentication required")
    return user

def main():
    """Main entry point"""
    try:
        method = request.method

        if method == "GET":
            # Query posts
            posts = db.query(
                "posts",
                status="published",
                views__gte=100,
                limit=20,
                sort="created_at",
                order="desc"
            )

            return {
                "success": True,
                "posts": posts["data"],
                "total": posts["total"]
            }

        elif method == "POST":
            # Create post
            user = get_user_or_error()
            data = request.body

            validate_post(data)

            post = db.create("posts", {
                "title": data["title"],
                "content": data["content"],
                "author_id": user.id,
                "status": "draft",
                "views": 0
            })

            return {
                "success": True,
                "post": post
            }

        else:
            raise ValueError(f"Method {method} not supported")

    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Internal server error"
        }
```

## Testing the IntelliSense

1. Start your backend: `uvicorn app.main:app --reload`
2. Open your frontend and load the CloudFunctionEditor
3. Type `request.` and verify autocomplete suggestions appear
4. Type `db.query` and verify parameter hints show up
5. Click example buttons to insert code templates
6. Hover over global objects to see documentation

## Troubleshooting

### No Autocomplete Suggestions

- Check browser console for fetch errors
- Verify API endpoints are accessible (test with curl or Postman)
- Ensure CORS is configured correctly if frontend is on different domain

### Slow Loading

- Type stubs are fetched once on editor mount
- Subsequent editor instances reuse cached data
- Check network tab for slow API responses

### Monaco Not Showing Hover Docs

- Hover providers require exact word match
- Try hovering over `request`, `db`, `render`, or `main`
- Check console for registration errors

## Advanced Configuration

### Custom Completions

You can add your own completion items by modifying the completion provider:

```typescript
monaco.languages.registerCompletionItemProvider('python', {
  provideCompletionItems: (model, position) => {
    // Add your custom suggestions here
    return { suggestions: [...] };
  },
});
```

### Syntax Validation

For Python syntax validation, you would need to integrate Pyright or Pylance language server. Monaco's built-in Python support provides syntax highlighting and basic completions only.

### External LSP Integration

For production use, consider:

- [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) - Connect Monaco to LSP servers
- [Pyright](https://github.com/microsoft/pyright) - Python LSP server
- [pylsp](https://github.com/python-lsp/python-lsp-server) - Alternative Python LSP

## Next Steps

1. ✅ Backend IntelliSense API is complete
2. ✅ Example Monaco component provided
3. 🔲 Add syntax validation with Pyright (optional)
4. 🔲 Add real-time error checking (optional)
5. 🔲 Add debugging capabilities (optional)

For questions or issues, check the API documentation or contact support.
