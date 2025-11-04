---
sidebar_position: 1
---

# Cloud Functions Introduction

Welcome to **CocoBase Cloud Functions** - a powerful serverless platform for building backend logic without managing servers.

## What are Cloud Functions?

Cloud Functions are serverless Python functions that run in response to HTTP requests. They provide a simple way to build APIs, webhooks, scheduled tasks, and dynamic web pages without setting up and maintaining servers.

## Key Features

### 🐍 Python 3.10 Runtime

- Full Python standard library
- Rich ecosystem support
- Familiar syntax
- Easy to learn and use

### 🗄️ Powerful Database API

- MongoDB-like query interface
- Advanced filtering with 12+ operators
- Automatic relationship detection
- Deep population of related data
- User relationship management

### 🎨 Template Rendering

- Jinja2 template engine
- Static file serving
- Dynamic HTML pages
- Component-based layouts

### 🔐 Built-in Authentication

- User authentication support
- Request headers and tokens
- Role-based access control
- Secure by default

### 📧 Email Integration

- Send emails with CocoMailer
- Template-based emails
- Transactional emails
- Notifications

## How It Works

### Write Your Function

```python
def main():
    # Get data from request
    name = request.get('name', 'Guest')

    # Query your database
    posts = db.query("posts",
        status="published",
        populate=["author"],
        limit=10
    )

    # Return response
    return {
        "message": f"Hello, {name}!",
        "posts": posts["data"]
    }
```

### Execute Your Function

To call your cloud function, get the execution URL from the **Cloud Functions** tab in your CocoBase dashboard. Each function has a unique execution URL that looks like:

```
https://your-domain.com/functions/{function_id}/execute
```

Call it with GET or POST requests:

```bash
# GET request
curl "https://your-domain.com/functions/{function_id}/execute?name=John"

# POST request
curl -X POST https://your-domain.com/functions/{function_id}/execute \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "action": "get_profile"}'
```

## Available Objects

### `request` - Request Data

Access incoming request data:

```python
# Get from payload or query params
name = request.get('name')

# Get all data
data = request.json()

# Access headers
auth = request.headers.get('authorization')

# Current user
user = request.user

# HTTP method
method = request.method  # 'GET' or 'POST'
```

### `db` - Database Service

Query and manage your data:

```python
# Query documents
posts = db.query("posts", status="published", limit=10)

# Get single document
post = db.find_one("posts", id="post-123")

# Query users
users = db.query_users(role="premium", limit=50)

# User relationships
followers = db.get_user_relationships("user-123", "followers")
```

### `render` - Template Renderer

Render HTML responses:

```python
# Render HTML
html = '''
<!DOCTYPE html>
<html>
<head>
    <title>{{ title }}</title>
</head>
<body>
    <h1>{{ heading }}</h1>
</body>
</html>
'''

return render.render_html(html, {
    'title': 'My Page',
    'heading': 'Welcome!'
})
```

### `env` - Environment Info

Access environment variables:

```python
project_id = env.project_id
runtime = env.runtime
static_url = env.static_base_url
```

## Common Use Cases

### 🛒 E-Commerce

- Product search and filtering
- Shopping cart management
- Order processing
- Inventory tracking

### 📱 Social Media

- User feeds and timelines
- Follow/unfollow systems
- Like and comment systems
- User profiles

### 📝 Content Management

- Blog posts and articles
- Content search
- Comment systems
- Related content

### 📊 Analytics

- User activity tracking
- Popular content
- Dashboard data
- Reports generation

### 🔔 Webhooks

- Payment notifications
- Third-party integrations
- Event handlers
- Real-time updates

### 🌐 Dynamic Websites

- Server-side rendering
- SEO-friendly pages
- Form handling
- User authentication

## Response Types

### JSON Response (Default)

```python
def main():
    return {
        "success": True,
        "data": {"id": "123", "name": "John"}
    }
```

### HTML Response

```python
def main():
    return render.render_html('<h1>Hello World!</h1>')
```

### String Response

```python
def main():
    return "Hello World!"
```

### With Status Code

```python
def main():
    user = request.user

    if not user:
        return {"error": "Unauthorized"}, 401

    return {"user": user}, 200
```

## Security

### Authentication

```python
def main():
    # Check if user is authenticated
    user = request.user

    if not user:
        return {"error": "Authentication required"}, 401

    # Check user role
    if 'admin' not in user.roles:
        return {"error": "Forbidden"}, 403

    # Process request
    return {"message": "Success"}
```

### Input Validation

```python
def main():
    email = request.get('email', '').strip()

    if not email:
        return {"error": "Email is required"}, 400

    if '@' not in email:
        return {"error": "Invalid email format"}, 400

    # Process valid input
    return {"success": True}
```

## Performance Tips

### 1. Use Pagination

Always limit query results:

```python
posts = db.query("posts", limit=20)
```

### 2. Selective Population

Only populate needed relationships:

```python
posts = db.query("posts",
    populate=["author"],  # Only what you need
    select=["id", "title", "author"]
)
```

### 3. Cache Results

Store frequently accessed data:

```python
cache_key = f"stats_{date.today()}"
cached = db.find_one("cache", key=cache_key)

if cached:
    return cached['data']

# Calculate and cache
stats = calculate_stats()
db.create_document("cache", {
    "key": cache_key,
    "data": stats
})

return stats
```

### 4. Index Your Data

Create indexes on frequently queried fields for better performance.

## Error Handling

```python
def main():
    try:
        result = db.query("posts", limit=10)
        return {"posts": result["data"]}

    except ValueError as e:
        return {"error": str(e)}, 400

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": "Internal server error"}, 500
```

## Next Steps

Now that you understand the basics, dive deeper:

1. **[Database API](./database-api.md)** - Learn advanced querying
2. **[Cloud Function Environment](./cloud-function-environment.md)** - Master request/response handling
3. **[Quick Reference](./quick-reference.md)** - Quick syntax lookup
4. **[Examples](./examples.md)** - Real-world use cases

## Need Help?

- 📖 Check the [Database API Reference](./database-api.md)
- 🎯 See [Examples](./examples.md) for common patterns
- ⚡ Use [Quick Reference](./quick-reference.md) for syntax

---

**Ready to build? Let's get started! 🚀**
