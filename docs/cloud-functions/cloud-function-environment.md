---
sidebar_position: 4
---

# Cloud Function Environment

Complete guide to the execution environment, request handling, and response types in CocoCloud functions.

## Overview

CocoCloud functions execute in a sandboxed Python 3.10 environment with access to:

- ✅ **Request object** (`request`) - Access to query params, payload, headers, user info
- ✅ **Database service** (`db`) - Query and manage your data
- ✅ **Template renderer** (`render`) - Render HTML with Jinja2
- ✅ **Environment object** (`env`) - Project and environment info

---

## 📡 Function Execution

### Execution URL

When you create a cloud function, you get an execution URL:

```
https://your-domain.com/functions/{function_id}/execute
```

### HTTP Methods

**GET Request:**

```bash
# Query parameters in URL
curl "https://your-domain.com/functions/abc123/execute?name=John&age=25"
```

**POST Request:**

```bash
# JSON payload in body
curl -X POST https://your-domain.com/functions/abc123/execute \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 25}'
```

---

## 🎯 The `request` Object

The `request` object provides access to incoming request data.

### Properties

```python
def main():
    # Get data from POST body or GET query params
    name = request.get('name', 'Guest')
    age = request.get('age', 0)

    # Access all payload data
    all_data = request.json()

    # Get query parameters (GET requests)
    page = request.query_params.get('page', '1')

    # Access headers
    auth_token = request.headers.get('authorization', '')

    # Check HTTP method
    method = request.method  # 'GET' or 'POST'

    # Request timestamp
    timestamp = request.timestamp

    # Current user (if authenticated)
    user = request.user  # AppUser object or None

    # Project ID
    project_id = request.proj
```

### Methods

#### `request.get(key, default=None)`

Get value from payload (POST) or query params (GET):

```python
def main():
    # From POST body: {"name": "John"}
    # Or GET query: ?name=John
    name = request.get('name', 'Anonymous')

    return {"greeting": f"Hello, {name}!"}
```

#### `request.json()`

Get entire payload as dictionary:

```python
def main():
    data = request.json()
    # Returns: {"name": "John", "age": 25, "email": "john@example.com"}

    return {
        "received": data,
        "keys": list(data.keys())
    }
```

#### `request.send_mail()`

Send email using CocoMailer integration:

```python
def main():
    # Send with template
    result = request.send_mail(
        to="user@example.com",
        subject="Welcome!",
        template_id="welcome-template",
        context={
            "username": "John",
            "activation_link": "https://..."
        }
    )

    # Send with plain body
    result = request.send_mail(
        to=["user1@example.com", "user2@example.com"],
        subject="Notification",
        body="<h1>Hello!</h1><p>This is your notification.</p>"
    )

    return {"email_sent": result}
```

### User Authentication

Access authenticated user data:

```python
def main():
    user = request.user

    if not user:
        return {"error": "Authentication required"}, 401

    # User properties
    user_id = user.id
    email = user.email
    user_data = user.data  # Custom user fields
    roles = user.roles

    return {
        "user_id": user_id,
        "email": email,
        "roles": roles
    }
```

---

## 🗄️ The `db` Object

Access to your project's database. See [Database API](./database-api.md) for complete reference.

### Quick Examples

```python
def main():
    # Query documents
    posts = db.query("posts",
        status="published",
        views_gte="100",
        populate=["author", "category"],
        limit=20
    )

    # Get single document
    post = db.find_one("posts", id="post-123")

    # Create document
    new_post = db.create_document("posts", {
        "title": "My Post",
        "content": "...",
        "author_id": request.user.id
    })

    # Update document
    db.update_document("posts", "post-123", {
        "views": 150
    })

    # Delete document
    db.delete_document("posts", "post-123")

    # Query users
    users = db.query_users(
        role="premium",
        limit=50
    )

    return {"posts": posts["data"]}
```

---

## 🎨 The `render` Object

Render HTML responses with Jinja2 templating.

### render.render_html()

Render HTML with template variables:

```python
def main():
    # Get data
    username = request.get('username', 'Guest')
    posts = db.query("posts", limit=10)

    # HTML template with Jinja2
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>{{ title }}</title>
        <link rel="stylesheet" href="{{ static('css/style.css') }}">
    </head>
    <body>
        <h1>Welcome, {{ username }}!</h1>

        <div class="posts">
            {% for post in posts %}
            <article>
                <h2>{{ post.title }}</h2>
                <p>{{ post.content }}</p>
                <span>By {{ post.author.name }}</span>
            </article>
            {% endfor %}
        </div>

        <script src="{{ static('js/app.js') }}"></script>
    </body>
    </html>
    '''

    # Render with context
    return render.render_html(html, {
        'title': 'My Blog',
        'username': username,
        'posts': posts['data']
    })
```

**Parameters:**

- `html_content` (str): HTML template string
- `context` (dict): Variables to pass to template
- `status_code` (int): HTTP status code (default: 200)

**Returns:** HTMLResponse object

### render.render_template()

Render a stored template file:

```python
def main():
    # Render template stored in your project
    return await render.render_template(
        'index.html',
        context={
            'title': 'Home Page',
            'user': request.user
        }
    )
```

Templates are fetched from:

```
https://storage/projects/{project_id}/__templates__/index.html
```

### Jinja2 Features

#### Variables

```html
<h1>{{ title }}</h1>
<p>{{ user.name }}</p>
<span>{{ post.views | default(0) }}</span>
```

#### Loops

```html
<ul>
  {% for item in items %}
  <li>{{ item.name }}</li>
  {% endfor %}
</ul>

{% for user in users %}
<div>{{ user.email }}</div>
{% else %}
<p>No users found</p>
{% endfor %}
```

#### Conditionals

```html
{% if user %}
<p>Hello, {{ user.name }}!</p>
{% else %}
<p>Please log in</p>
{% endif %} {% if posts|length > 0 %}
<h2>Recent Posts</h2>
{% endif %}
```

#### Filters

```html
{{ text | upper }} {{ text | lower }} {{ text | title }} {{ text | truncate(50)
}} {{ number | round(2) }} {{ list | length }} {{ date | default('N/A') }}
```

#### Static Files

```html
<!-- CSS -->
<link rel="stylesheet" href="{{ static('css/main.css') }}" />
<link rel="stylesheet" href="{{ static('css/components/button.css') }}" />

<!-- JavaScript -->
<script src="{{ static('js/app.js') }}"></script>
<script src="{{ static('js/utils.js') }}"></script>

<!-- Images -->
<img src="{{ static('images/logo.png') }}" alt="Logo" />
<img src="{{ static('images/products/product1.jpg') }}" />

<!-- Fonts -->
<link href="{{ static('fonts/custom-font.woff2') }}" rel="stylesheet" />
```

Static files are served from:

```
https://storage/projects/{project_id}/static/css/main.css
```

---

## 📤 Response Types

### JSON Response (Default)

Return a dictionary or list for automatic JSON response:

```python
def main():
    return {
        "success": True,
        "message": "Operation completed",
        "data": {
            "id": "123",
            "name": "John"
        }
    }
```

**Response:**

```json
{
  "success": true,
  "result": {
    "success": true,
    "message": "Operation completed",
    "data": {
      "id": "123",
      "name": "John"
    }
  },
  "output": "",
  "error": null,
  "execution_time": 0.045
}
```

### HTML Response

Return HTML using `render.render_html()`:

```python
def main():
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>My Page</title>
    </head>
    <body>
        <h1>Hello World!</h1>
    </body>
    </html>
    '''

    return render.render_html(html)
```

**Response:** Raw HTML (Content-Type: text/html)

### String Response

Return a plain string:

```python
def main():
    return "Hello, World!"
```

**Response:**

```json
{
  "success": true,
  "result": "Hello, World!",
  "output": "",
  "error": null,
  "execution_time": 0.012
}
```

### Status Codes

Return tuple with status code:

```python
def main():
    user = request.user

    if not user:
        return {"error": "Unauthorized"}, 401

    if not user.is_admin:
        return {"error": "Forbidden"}, 403

    post = db.find_one("posts", id=request.get('post_id'))

    if not post:
        return {"error": "Not found"}, 404

    return {"post": post}, 200
```

### Error Handling

Errors are automatically caught and returned:

```python
def main():
    try:
        result = some_operation()
        return {"result": result}
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        return {"error": "Internal server error"}, 500
```

**Error Response:**

```json
{
  "success": false,
  "result": null,
  "output": "",
  "error": "Error message here",
  "execution_time": 0.023
}
```

---

## 🌍 The `env` Object

Access environment and project information:

```python
def main():
    # Project ID
    project_id = env.project_id

    # Execution environment
    runtime = env.runtime  # "python3.10"

    # Static files base URL
    static_url = env.static_base_url

    return {
        "project": project_id,
        "runtime": runtime
    }
```

---

## 📦 Available Packages

### Standard Library

All Python 3.10 standard library modules:

```python
def main():
    import json
    import datetime
    import math
    import re
    import uuid
    from collections import defaultdict
    from datetime import datetime, timedelta

    # Use standard library
    current_time = datetime.now()
    unique_id = str(uuid.uuid4())

    return {
        "time": current_time.isoformat(),
        "id": unique_id
    }
```

### Common Patterns

```python
import json
import re
from datetime import datetime, timedelta
from collections import defaultdict

def main():
    # JSON parsing
    data = json.loads(request.get('json_string', '{}'))

    # Date handling
    today = datetime.now()
    tomorrow = today + timedelta(days=1)

    # Regular expressions
    email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    is_valid = re.match(email_pattern, email)

    # Data structures
    grouped = defaultdict(list)
    for item in items:
        grouped[item['category']].append(item)

    return {"grouped": dict(grouped)}
```

---

## 🔐 Authentication

### Query Parameter Auth

Pass authentication token in URL:

```bash
curl "https://your-domain.com/functions/abc123/execute?token=your-token&name=John"
```

```python
def main():
    token = request.query_params.get('token')

    if not token:
        return {"error": "Token required"}, 401

    # Validate token
    user = db.find_user(auth_token=token)

    if not user:
        return {"error": "Invalid token"}, 401

    return {"user": user}
```

### Header Auth

Pass authentication in headers:

```bash
curl -X POST https://your-domain.com/functions/abc123/execute \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"data": "value"}'
```

```python
def main():
    auth_header = request.headers.get('authorization', '')

    if not auth_header.startswith('Bearer '):
        return {"error": "Invalid authorization"}, 401

    token = auth_header.replace('Bearer ', '')

    # Validate token
    user = db.find_user(auth_token=token)

    return {"user": user}
```

### Built-in User

If user is authenticated via CocoBase:

```python
def main():
    user = request.user

    if not user:
        return {"error": "Please log in"}, 401

    # User is automatically available
    return {
        "user_id": user.id,
        "email": user.email,
        "name": user.data.get('name')
    }
```

---

## 💡 Complete Examples

### Example 1: Dynamic Web Page

```python
def main():
    # Get page from query param
    page = int(request.query_params.get('page', '1'))
    per_page = 10

    # Get posts from database
    posts = db.query("posts",
        status="published",
        populate=["author", "category"],
        sort="created_at",
        order="desc",
        limit=per_page,
        offset=(page - 1) * per_page
    )

    # Render HTML
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Blog - Page {{ page }}</title>
        <link rel="stylesheet" href="{{ static('css/blog.css') }}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <header>
            <h1>My Blog</h1>
            <nav>
                <a href="?page=1">Home</a>
                <a href="/about">About</a>
            </nav>
        </header>

        <main>
            {% for post in posts %}
            <article class="post">
                <h2>{{ post.title }}</h2>
                <div class="meta">
                    <span>By {{ post.author.name }}</span>
                    <span>{{ post.created_at }}</span>
                    <span class="category">{{ post.category.name }}</span>
                </div>
                <p>{{ post.excerpt }}</p>
                <a href="?post={{ post.id }}">Read more →</a>
            </article>
            {% endfor %}

            {% if not posts %}
            <p>No posts found.</p>
            {% endif %}
        </main>

        <footer>
            <div class="pagination">
                {% if page > 1 %}
                <a href="?page={{ page - 1 }}">← Previous</a>
                {% endif %}

                <span>Page {{ page }} of {{ total_pages }}</span>

                {% if has_more %}
                <a href="?page={{ page + 1 }}">Next →</a>
                {% endif %}
            </div>
        </footer>

        <script src="{{ static('js/app.js') }}"></script>
    </body>
    </html>
    '''

    return render.render_html(html, {
        'posts': posts['data'],
        'page': page,
        'total_pages': (posts['total'] + per_page - 1) // per_page,
        'has_more': posts['has_more']
    })
```

### Example 2: API Endpoint with Auth

```python
def main():
    # Check authentication
    token = request.headers.get('authorization', '').replace('Bearer ', '')

    if not token:
        return {"error": "Authorization required"}, 401

    # Validate token
    user = db.find_user(auth_token=token)

    if not user:
        return {"error": "Invalid token"}, 401

    # Get action from payload
    action = request.get('action')

    if action == 'get_profile':
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.data.get('name'),
                "avatar": user.data.get('avatar')
            }
        }

    elif action == 'update_profile':
        updates = request.get('updates', {})

        # Update user data
        user_data = user.data or {}
        user_data.update(updates)

        db.update_app_user(user.id, data=user_data)

        return {"success": True, "message": "Profile updated"}

    else:
        return {"error": "Unknown action"}, 400
```

### Example 3: Form Handler

```python
def main():
    # Handle form submission
    if request.method == 'POST':
        # Get form data
        name = request.get('name', '').strip()
        email = request.get('email', '').strip()
        message = request.get('message', '').strip()

        # Validate
        if not name or not email or not message:
            return render.render_html('''
                <!DOCTYPE html>
                <html>
                <body>
                    <h1>Error</h1>
                    <p>All fields are required.</p>
                    <a href="?">Go back</a>
                </body>
                </html>
            ''')

        # Save to database
        db.create_document('contact_submissions', {
            'name': name,
            'email': email,
            'message': message,
            'submitted_at': datetime.now().isoformat()
        })

        # Send notification email
        request.send_mail(
            to='admin@example.com',
            subject=f'New contact form submission from {name}',
            body=f'''
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Message:</strong></p>
                <p>{message}</p>
            '''
        )

        # Show success
        return render.render_html('''
            <!DOCTYPE html>
            <html>
            <body>
                <h1>Thank You!</h1>
                <p>Your message has been sent.</p>
                <a href="?">Submit another</a>
            </body>
            </html>
        ''')

    # Show form
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Contact Us</title>
        <link rel="stylesheet" href="{{ static('css/form.css') }}">
    </head>
    <body>
        <h1>Contact Us</h1>
        <form method="POST">
            <input type="text" name="name" placeholder="Your Name" required>
            <input type="email" name="email" placeholder="Your Email" required>
            <textarea name="message" placeholder="Your Message" required></textarea>
            <button type="submit">Send Message</button>
        </form>
    </body>
    </html>
    '''

    return render.render_html(html)
```

---

## 📝 Best Practices

### 1. Always Validate Input

```python
def main():
    email = request.get('email', '').strip()

    if not email:
        return {"error": "Email is required"}, 400

    if '@' not in email:
        return {"error": "Invalid email format"}, 400

    # Process email...
```

### 2. Handle Errors Gracefully

```python
def main():
    try:
        user_id = request.get('user_id')
        user = db.find_user(id=user_id)

        if not user:
            return {"error": "User not found"}, 404

        return {"user": user}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": "Internal server error"}, 500
```

### 3. Use Pagination

```python
def main():
    page = int(request.get('page', '1'))
    limit = int(request.get('limit', '20'))

    # Enforce max limit
    limit = min(limit, 100)

    posts = db.query("posts",
        limit=limit,
        offset=(page - 1) * limit
    )

    return {
        "posts": posts['data'],
        "page": page,
        "has_more": posts['has_more']
    }
```

### 4. Cache Heavy Operations

```python
# Store results in a collection
def main():
    cache_key = f"stats_{datetime.now().date()}"

    # Check cache
    cached = db.find_one("cache", key=cache_key)

    if cached:
        return cached['data']

    # Calculate stats (expensive)
    stats = calculate_stats()

    # Store in cache
    db.create_document("cache", {
        "key": cache_key,
        "data": stats,
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
    })

    return stats
```

### 5. Secure Sensitive Operations

```python
def main():
    # Require authentication
    user = request.user

    if not user:
        return {"error": "Unauthorized"}, 401

    # Check permissions
    if 'admin' not in user.roles:
        return {"error": "Forbidden"}, 403

    # Perform admin operation
    result = perform_admin_action()

    return {"result": result}
```

---

## 🎯 Quick Reference

### Request

```python
request.get(key, default)        # Get from payload/query
request.json()                   # Get all payload
request.query_params             # Query parameters dict
request.headers                  # Headers dict
request.method                   # 'GET' or 'POST'
request.user                     # Current user or None
request.send_mail(...)          # Send email
```

### Database

```python
db.query(collection, **filters)           # Query documents
db.find_one(collection, **filters)        # Get single doc
db.create_document(collection, data)      # Create doc
db.update_document(collection, id, data)  # Update doc
db.delete_document(collection, id)        # Delete doc
db.query_users(**filters)                 # Query users
db.find_user(**filters)                   # Get single user
```

### Render

```python
render.render_html(html, context)         # Render HTML
render.render_template(name, context)     # Render stored template
static('path/to/file')                    # Static file URL
```

### Response Types

```python
return {"key": "value"}                   # JSON response
return render.render_html(html)           # HTML response
return "string"                           # String response
return {"error": "..."}, 404              # With status code
```

---

## See Also

- [Database API](./database-api.md) - Complete database reference
- [Quick Reference](./quick-reference.md) - Query syntax cheat sheet
- [Examples](./examples.md) - Real-world use cases
