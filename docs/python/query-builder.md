# Query Builder

The QueryBuilder class provides a fluent, chainable API for constructing complex queries to filter and paginate your documents. It helps you build URL query parameters in a readable and maintainable way.

## 🔍 What is QueryBuilder?

QueryBuilder is a utility class that helps you:
- **Filter documents** based on field values
- **Paginate results** with limit and offset
- **Build complex queries** with multiple conditions
- **Generate URL-safe query strings** for API requests

## 🚀 Basic Usage

### Simple Query

```python
from cocobase_client.query import QueryBuilder

# Create a basic query
query = QueryBuilder().eq('name', 'John').build()
# Result: "?name=John"

# Use with document listing
documents = client.list_documents(collection_id, 
                                 QueryBuilder().eq('active', True))
```

### Method Chaining

```python
# Chain multiple conditions
query = (QueryBuilder()
         .eq('category', 'Electronics')
         .gt('price', 100)
         .lt('price', 1000)
         .limit(20)
         .offset(0))

documents = client.list_documents(collection_id, query)
```

## 📋 Available Query Methods

### Equality Filters

```python
# Equal to
query = QueryBuilder().eq('status', 'active')
# Generates: ?status=active

# Multiple equality filters
query = (QueryBuilder()
         .eq('category', 'Books')
         .eq('in_stock', True))
# Generates: ?category=Books&in_stock=True
```

### Comparison Filters

```python
# Greater than
query = QueryBuilder().gt('price', 50)
# Generates: ?price_gt=50

# Greater than or equal
query = QueryBuilder().gte('age', 18)
# Generates: ?age_gte=18

# Less than
query = QueryBuilder().lt('price', 100)
# Generates: ?price_lt=100

# Less than or equal
query = QueryBuilder().lte('score', 100)
# Generates: ?score_lte=100
```

### Text Search

```python
# Contains (substring search)
query = QueryBuilder().contains('name', 'John')
# Generates: ?name_contains=John

# Search in description
query = QueryBuilder().contains('description', 'laptop')
# Generates: ?description_contains=laptop
```

### Pagination

```python
# Limit results
query = QueryBuilder().limit(50)
# Generates: ?limit=50

# Skip results (offset)
query = QueryBuilder().offset(100)
# Generates: ?offset=100

# Pagination (page 2 with 25 items per page)
query = QueryBuilder().limit(25).offset(25)
# Generates: ?limit=25&offset=25
```

## 🔧 Advanced Query Examples

### Product Search

```python
# Search for laptops under $2000, in stock
laptop_query = (QueryBuilder()
                .contains('name', 'laptop')
                .lt('price', 2000)
                .eq('in_stock', True)
                .gte('rating', 4)
                .limit(20))

laptops = client.list_documents('products', laptop_query)
```

### User Filtering

```python
# Get active adult users, sorted by creation
adult_users_query = (QueryBuilder()
                     .eq('active', True)
                     .gte('age', 18)
                     .limit(100)
                     .offset(0))

users = client.list_documents('users', adult_users_query)
```

### Date Range Queries

```python
# Get orders from the last month (assuming timestamp fields)
recent_orders = (QueryBuilder()
                 .gte('created_at', 1704067200)  # Unix timestamp
                 .lt('created_at', 1706745600)
                 .eq('status', 'completed')
                 .limit(50))

orders = client.list_documents('orders', recent_orders)
```

### Complex Business Logic

```python
# Get high-value, recent orders for VIP customers
vip_orders = (QueryBuilder()
              .eq('customer_tier', 'VIP')
              .gte('total_amount', 1000)
              .gte('created_at', 1704067200)
              .eq('status', 'completed')
              .limit(25))

orders = client.list_documents('orders', vip_orders)
```

## 🗂️ Building Queries from Data

### From Dictionary

```python
# Build query from form data or API parameters
filter_params = {
    'category': 'Electronics',
    'price_gte': 100,
    'price_lte': 500,
    'in_stock': True,
    'limit': 20
}

query = QueryBuilder().from_dict(filter_params)
products = client.list_documents('products', query)
```

### Dynamic Query Building

```python
def build_product_query(category=None, min_price=None, max_price=None, 
                       in_stock=None, search_term=None, page=1, page_size=20):
    """Build a product query dynamically based on parameters"""
    query = QueryBuilder()
    
    if category:
        query.eq('category', category)
    
    if min_price is not None:
        query.gte('price', min_price)
    
    if max_price is not None:
        query.lte('price', max_price)
    
    if in_stock is not None:
        query.eq('in_stock', in_stock)
    
    if search_term:
        query.contains('name', search_term)
    
    # Add pagination
    offset = (page - 1) * page_size
    query.limit(page_size).offset(offset)
    
    return query

# Usage
query = build_product_query(
    category='Electronics',
    min_price=100,
    max_price=1000,
    in_stock=True,
    search_term='laptop',
    page=2,
    page_size=25
)

products = client.list_documents('products', query)
```

## 📊 Pagination Patterns

### Simple Pagination

```python
def get_page(client, collection_id, page_number, page_size=20):
    """Get a specific page of results"""
    offset = (page_number - 1) * page_size
    query = QueryBuilder().limit(page_size).offset(offset)
    
    return client.list_documents(collection_id, query)

# Get page 3 with 25 items per page
page_3 = get_page(client, 'products', 3, 25)
```

### Pagination with Filters

```python
def get_filtered_page(client, collection_id, filters, page_number, page_size=20):
    """Get a filtered page of results"""
    query = QueryBuilder()
    
    # Apply filters
    for key, value in filters.items():
        if key.endswith('_gt'):
            query.gt(key[:-3], value)
        elif key.endswith('_lt'):
            query.lt(key[:-3], value)
        elif key.endswith('_contains'):
            query.contains(key[:-9], value)
        else:
            query.eq(key, value)
    
    # Add pagination
    offset = (page_number - 1) * page_size
    query.limit(page_size).offset(offset)
    
    return client.list_documents(collection_id, query)

# Usage
filters = {
    'category': 'Electronics',
    'price_gt': 100,
    'name_contains': 'laptop'
}

page_1 = get_filtered_page(client, 'products', filters, 1, 25)
```

### Infinite Scroll Pattern

```python
def get_all_documents_generator(client, collection_id, query_base=None, batch_size=50):
    """Generator that yields documents in batches for infinite scroll"""
    offset = 0
    
    while True:
        # Start with base query or create new one
        query = query_base or QueryBuilder()
        query.limit(batch_size).offset(offset)
        
        documents = client.list_documents(collection_id, query)
        
        if not documents:
            break
        
        for doc in documents:
            yield doc
        
        if len(documents) < batch_size:
            break
            
        offset += batch_size

# Usage
base_query = QueryBuilder().eq('category', 'Electronics')

for product in get_all_documents_generator(client, 'products', base_query):
    print(f"Product: {product['name']}")
    # Process each product
```

## 🔧 Query Building Utilities

### Query Builder Factory

```python
class QueryBuilderFactory:
    """Factory for creating common query patterns"""
    
    @staticmethod
    def active_users(limit=100):
        """Get active users query"""
        return QueryBuilder().eq('active', True).limit(limit)
    
    @staticmethod
    def recent_orders(days=30, limit=50):
        """Get recent orders query"""
        # Assuming timestamp in seconds
        since_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())
        return (QueryBuilder()
                .gte('created_at', since_timestamp)
                .limit(limit))
    
    @staticmethod
    def products_in_price_range(min_price, max_price, in_stock=True):
        """Get products in price range"""
        query = QueryBuilder().gte('price', min_price).lte('price', max_price)
        if in_stock:
            query.eq('in_stock', True)
        return query
    
    @staticmethod
    def search_products(search_term, category=None):
        """Search products by name and optional category"""
        query = QueryBuilder().contains('name', search_term)
        if category:
            query.eq('category', category)
        return query

# Usage
factory = QueryBuilderFactory()

# Get active users
active_users = client.list_documents('users', factory.active_users(50))

# Get recent orders
recent_orders = client.list_documents('orders', factory.recent_orders(7, 25))

# Search products
laptops = client.list_documents('products', 
                               factory.search_products('laptop', 'Electronics'))
```

### Query Validation

```python
def validate_query_params(params):
    """Validate query parameters before building query"""
    errors = []
    
    # Validate limit
    if 'limit' in params:
        if not isinstance(params['limit'], int) or params['limit'] < 1:
            errors.append("Limit must be a positive integer")
        elif params['limit'] > 1000:
            errors.append("Limit cannot exceed 1000")
    
    # Validate offset
    if 'offset' in params:
        if not isinstance(params['offset'], int) or params['offset'] < 0:
            errors.append("Offset must be a non-negative integer")
    
    # Validate price ranges
    if 'price_gt' in params and 'price_lt' in params:
        if params['price_gt'] >= params['price_lt']:
            errors.append("Minimum price must be less than maximum price")
    
    return errors

def build_safe_query(params):
    """Build query with validation"""
    errors = validate_query_params(params)
    
    if errors:
        raise ValueError(f"Invalid query parameters: {', '.join(errors)}")
    
    query = QueryBuilder()
    
    # Safe parameter mapping
    safe_params = {k: v for k, v in params.items() if v is not None}
    
    return query.from_dict(safe_params)
```

## 🎯 Best Practices

### Query Optimization

```python
# ✅ Good: Use specific filters to reduce result set
query = (QueryBuilder()
         .eq('category', 'Electronics')  # Narrow down first
         .gte('price', 100)              # Then apply ranges
         .limit(20))                     # Always limit results

# ❌ Avoid: Overly broad queries
query = QueryBuilder().limit(1000)  # Too many results
```

### Readable Query Building

```python
# ✅ Good: Use descriptive variable names and comments
def get_premium_products():
    """Get premium products (high price, high rating, in stock)"""
    return (QueryBuilder()
            .gte('price', 500)        # Premium price range
            .gte('rating', 4.5)       # High rating
            .eq('in_stock', True)     # Available for purchase
            .limit(50))               # Reasonable limit

# ✅ Good: Break complex queries into steps
def get_user_dashboard_data(user_id):
    """Get data for user dashboard"""
    base_query = QueryBuilder().eq('user_id', user_id)
    
    # Recent orders
    recent_orders = (base_query
                     .gte('created_at', get_last_month_timestamp())
                     .limit(10))
    
    # Pending orders
    pending_orders = (base_query
                      .eq('status', 'pending')
                      .limit(5))
    
    return recent_orders, pending_orders
```

### Error Handling

```python
def safe_query_execution(client, collection_id, query):
    """Execute query with proper error handling"""
    try:
        # Validate query before execution
        query_string = query.build()
        if len(query_string) > 2000:  # URL length limit
            raise ValueError("Query too long")
        
        documents = client.list_documents(collection_id, query)
        return documents
    
    except Exception as e:
        print(f"Query execution failed: {e}")
        print(f"Query string: {query.build()}")
        return []
```

---

**Next Steps:**
- [Record Class Guide](record-class) - Learn about type-safe data access
- [Authentication Guide](authentication) - Secure your queries with user authentication