# Documents Guide

Documents are the individual records stored within collections. They contain your actual data and can be created, read, updated, and deleted using the CocoBase client.

## 📄 What are Documents?

Documents are JSON-like objects that store your data. Think of them as:

- **Rows** in SQL databases
- **Documents** in NoSQL databases
- **Records** in your application

Each document has:

- A unique **ID** (auto-generated)
- A **collection ID** (which collection it belongs to)
- **Data** (your actual content)
- A **creation timestamp**
- **Collection metadata**

## 🆕 Creating Documents

### Basic Document Creation

```python
from cocobase_client import CocoBaseClient

client = CocoBaseClient(api_key="your_api_key")

# First, create or get a collection
collection = client.create_collection("users")

# Create a document
user_data = {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "active": True
}

user = client.create_document(collection.id, user_data)

if user:
    print(f"Created user: {user['name']}")
    print(f"Document ID: {user.id}")
    print(f"Created at: {user.createdAt}")
```

### Complex Document Creation

```python
# Create a more complex document with nested data
product_data = {
    "name": "Laptop",
    "description": "High-performance laptop for developers",
    "price": 1299.99,
    "category": "Electronics",
    "specifications": {
        "ram": "16GB",
        "storage": "512GB SSD",
        "processor": "Intel i7"
    },
    "tags": ["laptop", "computer", "electronics"],
    "in_stock": True,
    "quantity": 25
}

product = client.create_document(collection.id, product_data)
```

## 📖 Reading Documents

### Get Single Document

```python
# Retrieve a specific document by ID
document = client.get_document(
    collection_id="your_collection_id",
    document_id="your_document_id"
)

if document:
    print(f"Document ID: {document.id}")
    print(f"Data: {document.data}")
    # Access specific fields
    print(f"Name: {document['name']}")
    print(f"Email: {document.get('email', 'No email')}")
```

### List All Documents

```python
# Get all documents in a collection
documents = client.list_documents(collection_id="your_collection_id")

if documents:
    print(f"Found {len(documents)} documents")
    for doc in documents:
        print(f"- {doc['name']}: {doc['email']}")
```

### List Documents with Query

```python
from cocobase_client.query import QueryBuilder

# Build a query to filter documents
query = QueryBuilder().eq("active", True).gt("age", 18).limit(10)

# Get filtered documents
active_adults = client.list_documents(
    collection_id="your_collection_id",
    query=query
)

if active_adults:
    print(f"Found {len(active_adults)} active adults")
```

## 🔄 Updating Documents

### Full Document Update

```python
# Update a document with new data
updated_data = {
    "name": "John Smith",  # Updated name
    "email": "john.smith@example.com",  # Updated email
    "age": 31,  # Updated age
    "active": True,
    "last_login": "2024-01-15T10:30:00Z"
}

updated_document = client.update_document(
    collection_id="your_collection_id",
    document_id="your_document_id",
    data=updated_data
)

if updated_document:
    print(f"Updated document: {updated_document['name']}")
```

### Partial Document Update

```python
# Update only specific fields
partial_update = {
    "last_login": "2024-01-15T14:45:00Z",
    "login_count": 15
}

updated_document = client.update_document(
    collection_id="your_collection_id",
    document_id="your_document_id",
    data=partial_update
)
```

## 🗑️ Deleting Documents

```python
# Delete a document
success = client.delete_document(
    collection_id="your_collection_id",
    document_id="your_document_id"
)

if success:
    print("Document deleted successfully")
else:
    print("Failed to delete document")
```

## 📊 Working with Record Objects

When you retrieve documents, you get `Record` objects with helpful methods:

### Basic Record Access

```python
# Get a document
user = client.get_document(collection_id, document_id)

# Dictionary-like access
name = user['name']
email = user.get('email', 'No email provided')

# Direct property access
print(f"Document ID: {user.id}")
print(f"Collection ID: {user.collectionId}")
print(f"Created at: {user.createdAt}")
```

### Type-Safe Getters

```python
# Use type-safe getters to ensure data types
user = client.get_document(collection_id, document_id)

# Get values with automatic type conversion
name = user.get_string('name')  # Returns string or None
age = user.get_int('age')       # Returns int or None
active = user.get_bool('active') # Returns bool or None
price = user.get_float('price') # Returns float or None
created = user.get_datetime('created_at') # Returns datetime or None

# With error handling
try:
    age = user.get_int('age', raise_error=True)
    print(f"User age: {age}")
except TypeError as e:
    print(f"Invalid age value: {e}")
```

## 🔍 Advanced Querying

### Complex Queries

```python
from cocobase_client.query import QueryBuilder

# Build complex queries
query = (QueryBuilder()
         .eq('category', 'Electronics')
         .gte('price', 100)
         .lt('price', 1000)
         .contains('name', 'laptop')
         .limit(20)
         .offset(0))

products = client.list_documents(collection_id, query)
```

### Pagination

```python
def get_all_documents_paginated(client, collection_id, page_size=50):
    """Get all documents with pagination"""
    offset = 0
    all_documents = []

    while True:
        query = QueryBuilder().limit(page_size).offset(offset)
        documents = client.list_documents(collection_id, query)

        if not documents:
            break

        all_documents.extend(documents)

        if len(documents) < page_size:
            break

        offset += page_size

    return all_documents
```

## 🛠️ Error Handling

```python
from cocobase_client.exceptions import CocobaseError

try:
    # Attempt to create a document
    document = client.create_document(collection_id, document_data)
    print(f"Document created: {document.id}")

except CocobaseError as e:
    if "Invalid Request" in str(e):
        print("Invalid data or collection ID")
    elif "field is missing" in str(e):
        print("Required field missing")
    elif "Internal Server Error" in str(e):
        print("Server error occurred")
    else:
        print(f"API error: {e}")

except Exception as e:
    print(f"Unexpected error: {e}")
```

## 📝 Complete CRUD Example

```python
from cocobase_client import CocoBaseClient
from cocobase_client.query import QueryBuilder
from cocobase_client.exceptions import CocobaseError

class DocumentManager:
    def __init__(self, api_key: str, collection_id: str):
        self.client = CocoBaseClient(api_key=api_key)
        self.collection_id = collection_id

    def create_user(self, name: str, email: str, age: int):
        """Create a new user document"""
        user_data = {
            "name": name,
            "email": email,
            "age": age,
            "active": True,
            "created_at": "2024-01-01T12:00:00Z"
        }

        try:
            user = self.client.create_document(self.collection_id, user_data)
            print(f"✅ Created user: {user['name']} (ID: {user.id})")
            return user
        except CocobaseError as e:
            print(f"❌ Failed to create user: {e}")
            return None

    def get_user(self, user_id: str):
        """Get a user by ID"""
        try:
            user = self.client.get_document(self.collection_id, user_id)
            if user:
                print(f"Found user: {user['name']} ({user['email']})")
                return user
            else:
                print("User not found")
                return None
        except CocobaseError as e:
            print(f"❌ Error getting user: {e}")
            return None

    def update_user(self, user_id: str, updates: dict):
        """Update a user document"""
        try:
            updated_user = self.client.update_document(
                self.collection_id, user_id, updates
            )
            if updated_user:
                print(f"✅ Updated user: {updated_user['name']}")
                return updated_user
            else:
                print("Failed to update user")
                return None
        except CocobaseError as e:
            print(f"❌ Error updating user: {e}")
            return None

    def delete_user(self, user_id: str):
        """Delete a user document"""
        try:
            success = self.client.delete_document(self.collection_id, user_id)
            if success:
                print("✅ User deleted successfully")
                return True
            else:
                print("❌ Failed to delete user")
                return False
        except CocobaseError as e:
            print(f"❌ Error deleting user: {e}")
            return False

    def search_users(self, name_contains: str = None, min_age: int = None):
        """Search for users with filters"""
        query = QueryBuilder()

        if name_contains:
            query.contains('name', name_contains)
        if min_age:
            query.gte('age', min_age)

        query.limit(100)  # Limit results

        try:
            users = self.client.list_documents(self.collection_id, query)
            print(f"Found {len(users)} users matching criteria")
            return users
        except CocobaseError as e:
            print(f"❌ Error searching users: {e}")
            return []

    def get_user_stats(self):
        """Get statistics about users"""
        try:
            all_users = self.client.list_documents(self.collection_id)

            if not all_users:
                return {"total": 0, "active": 0, "average_age": 0}

            total_users = len(all_users)
            active_users = sum(1 for user in all_users if user.get('active', False))

            # Calculate average age
            ages = [user.get_int('age') for user in all_users if user.get_int('age')]
            average_age = sum(ages) / len(ages) if ages else 0

            stats = {
                "total": total_users,
                "active": active_users,
                "inactive": total_users - active_users,
                "average_age": round(average_age, 1)
            }

            print(f"📊 User Stats: {stats}")
            return stats

        except CocobaseError as e:
            print(f"❌ Error getting user stats: {e}")
            return {}

# Usage Example
def main():
    # Initialize the document manager
    manager = DocumentManager("your_api_key", "your_collection_id")

    # Create users
    user1 = manager.create_user("Alice Smith", "alice@example.com", 28)
    user2 = manager.create_user("Bob Johnson", "bob@example.com", 35)

    if user1:
        # Update user
        manager.update_user(user1.id, {"last_login": "2024-01-15T10:30:00Z"})

        # Get user
        retrieved_user = manager.get_user(user1.id)

        # Search users
        young_users = manager.search_users(min_age=25)

        # Get statistics
        stats = manager.get_user_stats()

        # Delete user (commented out to preserve data)
        # manager.delete_user(user1.id)

if __name__ == "__main__":
    main()
```

## 🚀 Advanced Document Patterns

### Batch Operations

```python
def create_users_batch(client, collection_id, users_data):
    """Create multiple users in batch"""
    created_users = []
    failed_users = []

    for user_data in users_data:
        try:
            user = client.create_document(collection_id, user_data)
            created_users.append(user)
            print(f"✅ Created: {user['name']}")
        except CocobaseError as e:
            failed_users.append({"data": user_data, "error": str(e)})
            print(f"❌ Failed to create {user_data.get('name', 'Unknown')}: {e}")

    return created_users, failed_users

# Usage
users_to_create = [
    {"name": "User 1", "email": "user1@example.com", "age": 25},
    {"name": "User 2", "email": "user2@example.com", "age": 30},
    {"name": "User 3", "email": "user3@example.com", "age": 35},
]

created, failed = create_users_batch(client, collection_id, users_to_create)
```

### Document Validation

```python
def validate_user_data(data):
    """Validate user data before creating/updating"""
    errors = []

    # Required fields
    if not data.get('name'):
        errors.append("Name is required")
    if not data.get('email'):
        errors.append("Email is required")

    # Email format validation
    if data.get('email') and '@' not in data['email']:
        errors.append("Invalid email format")

    # Age validation
    age = data.get('age')
    if age is not None:
        if not isinstance(age, int) or age < 0 or age > 150:
            errors.append("Age must be a valid number between 0 and 150")

    return errors

def create_user_with_validation(client, collection_id, user_data):
    """Create user with validation"""
    errors = validate_user_data(user_data)

    if errors:
        print(f"❌ Validation errors: {', '.join(errors)}")
        return None

    try:
        user = client.create_document(collection_id, user_data)
        print(f"✅ Created validated user: {user['name']}")
        return user
    except CocobaseError as e:
        print(f"❌ Failed to create user: {e}")
        return None
```

### Document Relationships

```python
def create_order_with_user(client, users_collection_id, orders_collection_id,
                          user_id, order_data):
    """Create an order linked to a user"""
    # First verify the user exists
    user = client.get_document(users_collection_id, user_id)
    if not user:
        print("❌ User not found")
        return None

    # Add user reference to order
    order_data['user_id'] = user_id
    order_data['user_name'] = user['name']
    order_data['user_email'] = user['email']

    # Create the order
    try:
        order = client.create_document(orders_collection_id, order_data)
        print(f"✅ Created order {order.id} for user {user['name']}")
        return order
    except CocobaseError as e:
        print(f"❌ Failed to create order: {e}")
        return None

def get_user_orders(client, orders_collection_id, user_id):
    """Get all orders for a specific user"""
    query = QueryBuilder().eq('user_id', user_id)

    try:
        orders = client.list_documents(orders_collection_id, query)
        print(f"Found {len(orders)} orders for user {user_id}")
        return orders
    except CocobaseError as e:
        print(f"❌ Error getting user orders: {e}")
        return []
```

## 🔧 Performance Tips

### Efficient Querying

```python
# ✅ Good: Use specific queries to limit results
query = QueryBuilder().eq('category', 'Electronics').limit(50)
products = client.list_documents(collection_id, query)

# ❌ Avoid: Getting all documents when you only need a few
all_products = client.list_documents(collection_id)  # Could be thousands!
```

### Selective Field Updates

```python
# ✅ Good: Update only changed fields
updates = {"last_login": "2024-01-15T10:30:00Z"}
client.update_document(collection_id, document_id, updates)

# ❌ Avoid: Sending entire document for small changes
# This wastes bandwidth and may overwrite concurrent changes
```

### Batch Processing

```python
def process_documents_in_batches(client, collection_id, batch_size=100):
    """Process documents in batches to avoid memory issues"""
    offset = 0

    while True:
        query = QueryBuilder().limit(batch_size).offset(offset)
        documents = client.list_documents(collection_id, query)

        if not documents:
            break

        # Process this batch
        for doc in documents:
            # Your processing logic here
            process_document(doc)

        print(f"Processed {len(documents)} documents")

        if len(documents) < batch_size:
            break

        offset += batch_size
```

## 📈 Document Monitoring

### Track Document Changes

```python
def track_document_changes(client, collection_id, document_id):
    """Track when a document was last modified"""
    document = client.get_document(collection_id, document_id)

    if document:
        # Add tracking metadata
        updates = {
            "last_modified": "2024-01-15T12:00:00Z",
            "modified_by": "system",
            "version": document.get('version', 0) + 1
        }

        updated = client.update_document(collection_id, document_id, updates)
        return updated

    return None
```

---

**Next Steps:**

- [Query Builder Guide](query-builder) - Master complex queries
- [Record Class Guide](record-class) - Learn about type-safe data access
- [Authentication Guide](authentication) - Secure
