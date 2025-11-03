---

sidebar_position: 1
---

# Cloud Functions

CocoBASE Cloud Functions allow you to run custom Python code on the server without managing infrastructure. Write serverless functions that can process data, handle webhooks, perform complex business logic, and interact with your database—all with automatic scaling and security.

## Overview

Cloud Functions in CocoBASE are Python functions that run in a secure, sandboxed environment. They have access to:

- **Database Operations**: Full CRUD operations on your collections and app users
- **Request Data**: Access to incoming request payload, headers, and query parameters
- **User Context**: Information about the authenticated user making the request
- **Built-in Libraries**: JSON, datetime, math, regex, and other essential Python modules

## Getting Started

### Basic Function Structure

Every cloud function should follow this basic pattern:

```python
def main():
    # Your function logic here
    return {"status": "success", "message": "Hello from CocoBASE!"}
```

The `main()` function is automatically called when your cloud function is executed. If no `main()` function is defined, you can set a `result` variable instead:

```python
# Alternative approach
result = {"status": "success", "data": "some value"}
```

### Available Objects

Your cloud function has access to these pre-configured objects:

- **`db`**: Database service for collection and user operations
- **`request`** or **`req`**: Request object with payload, headers, and user info
- **Standard libraries**: `json`, `datetime`, `math`, `re`

## Request Object

The `request` object provides access to incoming request data:

```python
def main():
    # Get request payload
    data = request.json()
    name = request.get('name', 'Anonymous')
    
    # Access query parameters
    page = request.query_params.get('page', '1')
    
    # Check request headers
    user_agent = request.headers.get('user-agent')
    
    # Get authenticated user info
    if request.user:
        user_id = request.user.id
        user_email = request.user.email
    
    return {"message": f"Hello {name}!"}
```

### Request Properties

- **`request.json()`**: Get the request payload as a dictionary
- **`request.get(key, default)`**: Get a value from the payload with optional default
- **`request.query_params`**: Dictionary of URL query parameters
- **`request.headers`**: Request headers
- **`request.user`**: Authenticated user object (if applicable)
- **`request.method`**: HTTP method (typically "POST" for cloud functions)
- **`request.timestamp`**: Timestamp when the request was received

## Database Operations

The `db` object provides comprehensive database functionality scoped to your project:

### Collection Management

```python
def main():
    # Get all collections
    collections = db.get_collections()
    
    # Get specific collection
    users_collection = db.get_collection('users')
    
    # Create new collection
    new_collection = db.create_collection(
        name='products',
        webhook_url='https://example.com/webhook'
    )
    
    # Update collection
    updated = db.update_collection('products', 
        webhook_url='https://new-webhook.com'
    )
    
    # Delete collection
    deleted = db.delete_collection('old_collection')
    
    return {"collections": len(collections)}
```

### Document Operations

```python
def main():
    # Create a new document
    new_user = db.create_document('users', {
        'name': 'John Doe',
        'email': 'john@example.com',
        'age': 30,
        'roles': ['user'],
        'status': 'active'
    })
    
    # Get documents with filters
    active_users = db.get_documents('users', 
        filters={'status': 'active'},
        limit=10
    )
    
    # Get specific document
    user = db.get_document('users', 'document-id-here')
    
    # Update entire document
    updated_user = db.update_document('users', 'document-id', {
        'name': 'Jane Doe',
        'email': 'jane@example.com',
        'age': 28
    })
    
    # Update specific fields
    partial_update = db.update_document_fields('users', 'document-id', {
        'status': 'inactive',
        'last_login': datetime.now().isoformat()
    })
    
    # Delete document
    deleted = db.delete_document('users', 'document-id')
    
    # Count documents
    total_users = db.count_documents('users')
    active_count = db.count_documents('users', {'status': 'active'})
    
    return {
        "new_user_id": new_user['id'],
        "active_users": len(active_users),
        "total_users": total_users
    }
```

### App User Management

```python
def main():
    # Get all app users
    users = db.get_app_users(limit=50)
    
    # Get user by ID
    user = db.get_app_user('user-id-here')
    
    # Get user by email
    user = db.get_app_user_by_email('john@example.com')
    
    # Create new app user
    new_user = db.create_app_user(
        email='newuser@example.com',
        password='secure_password',
        data={'department': 'engineering', 'level': 'senior'},
        roles=['user', 'developer']
    )
    
    # Update app user
    updated = db.update_app_user('user-id', 
        data={'department': 'marketing'},
        roles=['user', 'admin']
    )
    
    # Delete app user
    deleted = db.delete_app_user('user-id')
    
    # Count app users
    total = db.count_app_users()
    
    return {"total_users": total}
```

### Search Operations

```python
def main():
    # Search documents
    search_results = db.search_documents(
        'users',
        search_term='john',
        search_fields=['name', 'email'],
        limit=20
    )
    
    # Search all fields
    global_search = db.search_documents('products', 'laptop')
    
    return {"results": len(search_results)}
```

## Common Use Cases

### 1. Data Processing and Validation

```python
def main():
    # Get form data
    form_data = request.json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'age']
    for field in required_fields:
        if not form_data.get(field):
            return {"error": f"Missing required field: {field}"}
    
    # Process and clean data
    processed_data = {
        'name': form_data['name'].strip().title(),
        'email': form_data['email'].lower(),
        'age': int(form_data['age']),
        'created_at': datetime.now().isoformat(),
        'status': 'pending'
    }
    
    # Save to database
    user = db.create_document('users', processed_data)
    
    return {"success": True, "user_id": user['id']}
```

### 2. Webhook Handler

```python
def main():
    # Handle incoming webhook
    webhook_data = request.json()
    event_type = webhook_data.get('type')
    
    if event_type == 'payment.completed':
        # Process payment
        payment_id = webhook_data['data']['id']
        user_id = webhook_data['data']['user_id']
        amount = webhook_data['data']['amount']
        
        # Update user's subscription
        db.update_document_fields('subscriptions', user_id, {
            'status': 'active',
            'last_payment': datetime.now().isoformat(),
            'amount': amount
        })
        
        # Log the event
        db.create_document('payment_logs', {
            'payment_id': payment_id,
            'user_id': user_id,
            'amount': amount,
            'processed_at': datetime.now().isoformat()
        })
        
        return {"status": "processed"}
    
    return {"status": "ignored", "event_type": event_type}
```

### 3. Analytics and Reporting

```python
def main():
    # Get user statistics
    total_users = db.count_documents('users')
    active_users = db.count_documents('users', {'status': 'active'})
    premium_users = db.count_documents('users', {'plan': 'premium'})
    
    # Get recent signups
    recent_users = db.get_documents('users', 
        limit=10,
        # Note: For date filtering, you'd typically use raw queries
    )
    
    # Calculate conversion rate
    conversion_rate = (premium_users / total_users * 100) if total_users > 0 else 0
    
    return {
        "analytics": {
            "total_users": total_users,
            "active_users": active_users,
            "premium_users": premium_users,
            "conversion_rate": round(conversion_rate, 2),
            "recent_signups": len(recent_users)
        }
    }
```

### 4. Email Notifications

```python
def main():
    # Get notification data
    notification_data = request.json()
    user_id = notification_data.get('user_id')
    message = notification_data.get('message')
    
    # Get user details
    user = db.get_app_user(user_id)
    if not user:
        return {"error": "User not found"}
    
    # Create notification record
    notification = db.create_document('notifications', {
        'user_id': user_id,
        'email': user['email'],
        'message': message,
        'status': 'pending',
        'created_at': datetime.now().isoformat()
    })
    
    # In a real implementation, you'd integrate with an email service here
    # For now, we'll just mark it as sent
    db.update_document_fields('notifications', notification['id'], {
        'status': 'sent',
        'sent_at': datetime.now().isoformat()
    })
    
    return {"success": True, "notification_id": notification['id']}
```

### 5. Data Transformation

```python
def main():
    # Get all products that need price updates
    products = db.get_documents('products', {'price_update_needed': True})
    
    updated_count = 0
    
    for product in products:
        old_price = product['data']['price']
        # Apply 10% price increase
        new_price = round(old_price * 1.1, 2)
        
        # Update product
        db.update_document_fields('products', product['id'], {
            'price': new_price,
            'old_price': old_price,
            'price_update_needed': False,
            'updated_at': datetime.now().isoformat()
        })
        
        updated_count += 1
    
    return {
        "success": True,
        "products_updated": updated_count
    }
```

## Advanced Features

### Raw SQL Queries

For complex queries that can't be achieved with the standard methods:

```python
def main():
    # Execute raw SQL (use with caution)
    query = """
    SELECT 
        json_extract(data, '$.status') as status,
        COUNT(*) as count
    FROM documents d
    JOIN collections c ON d.collection_id = c.id
    WHERE c.project_id = :project_id 
      AND c.name = 'users'
    GROUP BY json_extract(data, '$.status')
    """
    
    results = db.execute_raw_query(query)
    
    return {"status_counts": results}
```

### Error Handling

```python
def main():
    try:
        # Risky operation
        user_id = request.get('user_id')
        if not user_id:
            raise ValueError("user_id is required")
        
        user = db.get_app_user(user_id)
        if not user:
            return {"error": "User not found", "code": "USER_NOT_FOUND"}
        
        # Process user data
        result = process_user_data(user)
        
        return {"success": True, "data": result}
        
    except ValueError as e:
        return {"error": str(e), "code": "VALIDATION_ERROR"}
    except Exception as e:
        return {"error": "Internal server error", "code": "INTERNAL_ERROR"}

def process_user_data(user):
    # Your processing logic here
    return {"processed": True}
```

## Security and Limitations

### Security Features

- **Project Scoping**: All database operations are automatically scoped to your project
- **Sandboxed Execution**: Functions run in a secure, isolated environment
- **Limited Built-ins**: Only safe Python built-in functions are available
- **Timeout Protection**: Functions are automatically terminated after 20 seconds

### Available Built-in Functions

Your cloud functions have access to these Python built-ins:

```python
# Basic types and functions
len, str, int, float, list, dict, tuple, set
print, range, enumerate, zip, map, filter
abs, min, max, sum, sorted, reversed
isinstance, type, any, all, bool

# Exception types
ValueError, TypeError, KeyError, IndexError

# Libraries
json, datetime, math, re
```

### Limitations

- **Execution Time**: Maximum 20 seconds per function execution
- **Memory**: Limited memory allocation per function
- **Network**: No external network access (no HTTP requests to external APIs)
- **File System**: No file system access
- **Imports**: Only pre-approved libraries are available

## Best Practices

### 1. Always Return Structured Data

```python
def main():
    # Good: Return structured response
    return {
        "success": True,
        "data": {"user_count": 42},
        "timestamp": datetime.now().isoformat()
    }
    
    # Avoid: Returning raw values
    # return 42
```

### 2. Handle Edge Cases

```python
def main():
    user_id = request.get('user_id')
    
    # Check for required parameters
    if not user_id:
        return {"error": "user_id parameter is required"}
    
    # Check if user exists
    user = db.get_app_user(user_id)
    if not user:
        return {"error": "User not found"}
    
    # Proceed with logic
    return {"success": True, "user": user}
```

### 3. Use Descriptive Function Names

```python
def main():
    action = request.get('action')
    
    if action == 'create_user':
        return create_user_handler()
    elif action == 'send_notification':
        return send_notification_handler()
    else:
        return {"error": "Unknown action"}

def create_user_handler():
    # Handle user creation
    pass

def send_notification_handler():
    # Handle notification sending
    pass
```

### 4. Log Important Operations

```python
def main():
    user_id = request.get('user_id')
    
    # Log the operation
    print(f"Processing request for user: {user_id}")
    
    # Perform operation
    result = db.update_app_user(user_id, {"last_activity": datetime.now().isoformat()})
    
    if result:
        print(f"Successfully updated user: {user_id}")
        return {"success": True}
    else:
        print(f"Failed to update user: {user_id}")
        return {"error": "Update failed"}
```

## Debugging and Testing

### Using Print Statements

```python
def main():
    print("Function started")
    
    data = request.json()
    print(f"Received data: {data}")
    
    user_count = db.count_documents('users')
    print(f"Current user count: {user_count}")
    
    return {"debug": "Check the function logs for output"}
```

### Return Debug Information

```python
def main():
    debug_info = {
        "request_data": request.json(),
        "query_params": request.query_params,
        "user_info": request.user.email if request.user else None,
        "timestamp": datetime.now().isoformat()
    }
    
    # Your function logic here
    result = {"status": "success"}
    
    return {
        "result": result,
        "debug": debug_info
    }
```

## Deployment and Execution

Cloud Functions in CocoBASE are executed when:

1. **Direct API Call**: Called via your project's API endpoint
2. **Webhook Trigger**: Automatically triggered by collection webhooks
3. **Scheduled Execution**: Run on a schedule (if supported)

Each function execution is logged with:
- Execution time
- Console output (print statements)
- Return value
- Any errors or exceptions

Start building powerful serverless functions with CocoBASE Cloud Functions and take your backend logic to the next level!