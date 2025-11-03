# CustomDatabaseService

A powerful, user-friendly database service for cloud function environments that provides MongoDB-style querying with automatic project-level security scoping.

## 🚀 Features

- **Automatic Project Scoping** - All operations are automatically limited to your project data
- **MongoDB-Style Queries** - Familiar query operators like `$gt`, `$in`, `$contains`, etc.
- **JSONB Support** - Full support for PostgreSQL JSONB operations
- **Aggregation Functions** - Built-in aggregation with grouping and statistical operations
- **Full-Text Search** - Search across document content with field-specific targeting
- **Pagination & Sorting** - Built-in limit/offset pagination and sorting support
- **Type Safety** - Automatic type handling for different data types
- **Security First** - Users can only access their own project data

## 📦 Installation

The CustomDatabaseService is automatically available in your cloud function execution environment. No additional installation required.

## 🔧 Basic Usage

### Initialization

```python
def main():
    # u can access it within your cloud function its a global variable
    my_db = db
    
    # Your code here...
```

The service automatically scopes all operations to your `project_id`, ensuring data isolation.

## 📚 API Reference

### Collection Operations

#### `get_collections(limit=None)`
Get all collections for your project.

```python
collections = db.get_collections()
# Returns: [{'id': '...', 'name': 'users', 'created_at': '...', ...}, ...]
```

#### `create_collection(name, webhook_url=None, permissions=None)`
Create a new collection.

```python
collection = db.create_collection('products', 
    webhook_url='https://api.example.com/webhook',
    permissions={'read': ['*'], 'write': ['admin']}
)
```

#### `get_collection(name)`
Get a specific collection by name.

```python
collection = db.get_collection('users')
```

#### `update_collection(name, **updates)`
Update collection properties.

```python
updated = db.update_collection('users', webhook_url='https://new-url.com')
```

#### `delete_collection(name)`
Delete a collection and all its documents.

```python
success = db.delete_collection('old_collection')
```

### Document Operations

#### `get_documents(collection_name, filters=None, limit=None, offset=None)`
Get documents from a collection with optional filtering.

```python
# Basic usage
docs = db.get_documents('users')

# With simple filters
docs = db.get_documents('users', filters={'status': 'active'})

# With advanced filters
docs = db.get_documents('users', filters={
    'age': {'$gte': 18},
    'status': {'$in': ['active', 'verified']}
}, limit=50)
```

#### `create_document(collection_name, data)`
Create a new document.

```python
document = db.create_document('users', {
    'name': 'John Doe',
    'email': 'john@example.com',
    'age': 30,
    'roles': ['user']
})
```

#### `update_document(collection_name, document_id, data)`
Replace a document's data completely.

```python
updated = db.update_document('users', doc_id, {
    'name': 'John Smith',
    'email': 'john.smith@example.com',
    'age': 31
})
```

#### `update_document_fields(collection_name, document_id, updates)`
Update specific fields in a document (merges with existing data).

```python
updated = db.update_document_fields('users', doc_id, {
    'last_login': '2024-09-09',
    'login_count': 42
})
```

#### `delete_document(collection_name, document_id)`
Delete a document.

```python
success = db.delete_document('users', doc_id)
```

#### `count_documents(collection_name, filters=None)`
Count documents with optional filters.

```python
count = db.count_documents('users', filters={'status': 'active'})
```

### Advanced Document Queries

#### `query_documents(collection_name, conditions, limit=None, offset=None, sort_by=None, sort_order='asc')`
Advanced querying with MongoDB-style operators.

```python
# Find users older than 25
users = db.query_documents('users', {
    'age': {'$gt': 25}
})

# Complex query with multiple conditions
products = db.query_documents('products', {
    'category': {'$in': ['electronics', 'books']},
    'price': {'$gte': 10, '$lte': 100},
    'stock': {'$gt': 0}
}, limit=20, sort_by='price', sort_order='desc')

# Find documents with array fields
admins = db.query_documents('users', {
    'roles': {'$contains': 'admin'}
})
```

### App User Operations

#### `get_app_users(limit=None, offset=None, filters=None)`
Get app users with optional filtering.

```python
# Basic usage
users = db.get_app_users(limit=50)

# With filters
users = db.get_app_users(filters={
    'data': {'subscription': 'premium'},
    'roles': {'$contains': 'verified'}
})
```

#### `create_app_user(email, password, data=None, roles=None, oauth_id=None)`
Create a new app user.

```python
user = db.create_app_user(
    email='user@example.com',
    password='hashed_password',
    data={'subscription': 'free', 'age': 25},
    roles=['user']
)
```

#### `query_app_users(conditions, limit=None, offset=None, sort_by=None, sort_order='asc')`
Advanced app user querying.

```python
# Find users by email pattern
company_users = db.query_app_users({
    'email': {'$ilike': '%@company.com'}
})

# Query user data fields
premium_users = db.query_app_users({
    'data.subscription': {'$in': ['premium', 'enterprise']},
    'data.age': {'$gte': 18},
    'created_at': {'$gte': '2024-01-01'}
})
```

### Search Operations

#### `search_documents(collection_name, search_term, search_fields=None, limit=None)`
Full-text search across documents.

```python
# Search all fields
results = db.search_documents('users', 'john')

# Search specific fields
results = db.search_documents('users', 'john@', ['email', 'contact.email'])

# Limited results
results = db.search_documents('products', 'laptop', limit=10)
```

### Aggregation Operations

#### `aggregate_documents(collection_name, group_by, aggregations, conditions=None)`
Perform aggregations on documents.

```python
# Get product statistics by category
stats = db.aggregate_documents('products', 'category', {
    'count': 'count',
    'avg_price': 'avg:price',
    'total_value': 'sum:price',
    'max_price': 'max:price',
    'min_price': 'min:price'
})

# With conditions
active_stats = db.aggregate_documents('orders', 'region', {
    'total_orders': 'count',
    'total_revenue': 'sum:total'
}, conditions={'status': 'completed'})
```

## 🔍 Query Operators

The service supports MongoDB-style query operators:

| Operator | Description | Example |
|----------|-------------|---------|
| `$gt` | Greater than | `{'age': {'$gt': 25}}` |
| `$gte` | Greater than or equal | `{'price': {'$gte': 10}}` |
| `$lt` | Less than | `{'score': {'$lt': 100}}` |
| `$lte` | Less than or equal | `{'discount': {'$lte': 50}}` |
| `$in` | In array | `{'category': {'$in': ['books', 'electronics']}}` |
| `$nin` | Not in array | `{'status': {'$nin': ['deleted', 'banned']}}` |
| `$like` | Pattern match (case-sensitive) | `{'name': {'$like': 'John%'}}` |
| `$ilike` | Pattern match (case-insensitive) | `{'email': {'$ilike': '%@gmail.com'}}` |
| `$exists` | Field exists | `{'phone': {'$exists': true}}` |
| `$contains` | Contains value (arrays) | `{'roles': {'$contains': 'admin'}}` |
| `$regex` | Regular expression | `{'code': {'$regex': '^[A-Z]{2}[0-9]{4}$'}}` |

## 💡 Examples

### E-commerce Example

```python
def get_product_insights(request, db_session, project_id):
    db = CustomDatabaseService(db_session, project_id)
    
    # Find popular products on sale
    sale_products = db.query_documents('products', {
        'discount': {'$gt': 0},
        'rating': {'$gte': 4.0},
        'stock': {'$gt': 10}
    }, sort_by='rating', sort_order='desc', limit=20)
    
    # Get sales statistics by category
    category_stats = db.aggregate_documents('orders', 'category', {
        'total_sales': 'count',
        'revenue': 'sum:total',
        'avg_order': 'avg:total'
    }, conditions={'status': 'completed'})
    
    # Find high-value customers
    vip_customers = db.query_app_users({
        'data.total_spent': {'$gte': 1000},
        'data.orders': {'$gte': 5}
    }, sort_by='data.total_spent', sort_order='desc')
    
    return {
        'sale_products': sale_products,
        'category_stats': category_stats,
        'vip_customers': vip_customers
    }
```

### User Management Example

```python
def analyze_users(request, db_session, project_id):
    db = CustomDatabaseService(db_session, project_id)
    
    # Find recently active users
    active_users = db.query_app_users({
        'data.last_login': {'$gte': '2024-09-01'},
        'roles': {'$contains': 'verified'}
    })
    
    # Get user engagement by department
    engagement = db.aggregate_documents('activity_logs', 'department', {
        'total_actions': 'count',
        'avg_session': 'avg:session_duration'
    })
    
    # Find users needing attention
    inactive_users = db.query_app_users({
        'data.last_login': {'$lt': '2024-08-01'},
        'data.subscription': {'$in': ['premium', 'enterprise']}
    })
    
    return {
        'active_users': len(active_users),
        'engagement': engagement,
        'inactive_premium': len(inactive_users)
    }
```

### Content Management Example

```python
def content_analytics(request, db_session, project_id):
    db = CustomDatabaseService(db_session, project_id)
    
    # Find trending articles
    trending = db.query_documents('articles', {
        'published': True,
        'views': {'$gte': 1000},
        'created_at': {'$gte': '2024-09-01'}
    }, sort_by='views', sort_order='desc', limit=10)
    
    # Search for specific content
    tech_articles = db.search_documents('articles', 'technology', 
                                       ['title', 'content', 'tags'])
    
    # Get author statistics
    author_stats = db.aggregate_documents('articles', 'author', {
        'article_count': 'count',
        'total_views': 'sum:views',
        'avg_rating': 'avg:rating'
    }, conditions={'published': True})
    
    return {
        'trending': trending,
        'tech_articles': len(tech_articles),
        'top_authors': author_stats
    }
```

## 🛡️ Security

- **Automatic Project Scoping**: All operations are automatically limited to your project's data
- **No Cross-Project Access**: Users cannot access data from other projects
- **Password Protection**: App user passwords are never returned in queries
- **SQL Injection Safe**: All queries use parameterized statements

## 🔧 Advanced Features

### Raw Queries (Advanced Users)

```python
# Execute raw SQL with automatic project scoping
results = db.execute_raw_query("""
    SELECT data->>'category' as category, COUNT(*) as count
    FROM documents d
    JOIN collections c ON d.collection_id = c.id
    WHERE c.project_id = :project_id
    GROUP BY data->>'category'
""", {'additional_param': 'value'})
```

### Transaction Management

```python
try:
    # Your database operations
    db.create_document('users', user_data)
    db.update_document('stats', stats_id, new_stats)
    
    # Manually commit if needed
    db.commit()
except Exception as e:
    # Rollback on error
    db.rollback()
    raise
```

## 🚨 Error Handling

The service handles common errors gracefully:

- Returns `None` for not found operations
- Returns empty lists `[]` for queries with no results
- Returns `False` for failed delete operations
- Returns `0` for counts on non-existent collections

```python
# Safe operations
user = db.get_app_user('non-existent-id')  # Returns None
docs = db.get_documents('empty-collection')  # Returns []
deleted = db.delete_document('collection', 'fake-id')  # Returns False
```

## 📈 Performance Tips

1. **Use Indexes**: Ensure your frequently queried JSONB fields have GIN indexes
2. **Limit Results**: Always use `limit` for large datasets
3. **Specific Filters**: Use specific conditions to reduce query scope
4. **Pagination**: Use `offset` and `limit` for pagination rather than loading all data
5. **Aggregations**: Use built-in aggregation functions instead of fetching all data

```python
# Good: Limited and specific
products = db.query_documents('products', {
    'category': 'electronics',
    'price': {'$lte': 500}
}, limit=50)

# Better: With pagination
products_page1 = db.query_documents('products', conditions, limit=50, offset=0)
products_page2 = db.query_documents('products', conditions, limit=50, offset=50)
```

## 🤝 Support

For additional support or feature requests, please contact your platform administrator or check the main documentation for your cloud function environment.

---

**Happy Querying!** 🚀