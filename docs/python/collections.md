# Collections Guide

Collections in CocoBase are similar to tables in traditional databases. They contain documents (records) and can be configured with webhooks for real-time notifications.

## 📦 What are Collections?

A collection is a container for related documents. Think of it as:
- A **table** in SQL databases
- A **collection** in MongoDB
- A **container** for your data

Each collection has:
- A unique **ID** (auto-generated)
- A **name** (user-defined)
- A **creation timestamp**
- An optional **webhook URL** for notifications

## 🆕 Creating Collections

### Basic Collection Creation

```python
from cocobase_client import CocoBaseClient

client = CocoBaseClient(api_key="your_api_key")

# Create a simple collection
collection = client.create_collection("users")

if collection:
    print(f"Created collection: {collection.name}")
    print(f"Collection ID: {collection.id}")
    print(f"Created at: {collection.createdAt}")
else:
    print("Failed to create collection")
```

### Collection with Webhook

```python
# Create a collection with webhook for real-time notifications
collection = client.create_collection(
    collection_name="orders",
    webhookurl="https://yourapp.com/webhooks/orders"
)

if collection:
    print(f"Collection '{collection.name}' created with webhook")
```

## 📋 Collection Properties

When you create or retrieve a collection, you get a `Collection` object with these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `str` | Unique collection identifier |
| `name` | `str` | Collection name |
| `createdAt` | `datetime` | When the collection was created |

```python
collection = client.create_collection("products")

# Access collection properties
print(f"ID: {collection.id}")
print(f"Name: {collection.name}")
print(f"Created: {collection.createdAt}")
```

## 📝 Updating Collections

You can update a collection's name and/or webhook URL:

### Update Collection Name

```python
# Update collection name
result = client.update_collection(
    collection_id="collection_id_here",
    collection_name="new_collection_name"
)

if result:
    print("Collection name updated successfully")
```

### Update Webhook URL

```python
# Update webhook URL
result = client.update_collection(
    collection_id="collection_id_here",
    webhookurl="https://newurl.com/webhook"
)

if result:
    print("Webhook URL updated successfully")
```

### Update Both Name and Webhook

```python
# Update both name and webhook
result = client.update_collection(
    collection_id="collection_id_here",
    collection_name="updated_collection_name",
    webhookurl="https://newurl.com/webhook"
)

if result:
    print("Collection updated successfully")
```

## 🗑️ Deleting Collections

**⚠️ Warning:** Deleting a collection will permanently remove all documents within it.

```python
# Delete a collection
success = client.delete_collection("collection_id_here")

if success:
    print("Collection deleted successfully")
else:
    print("Failed to delete collection")
```

## 🔍 Listing Collections

```python
# List all collections (method may vary based on API)
# Note: This method might not be available in the current client
# Check your API documentation for collection listing endpoints
```

## 🎯 Collection Naming Best Practices

### Good Collection Names

```python
# ✅ Good: Clear, descriptive names
client.create_collection("users")
client.create_collection("products")
client.create_collection("orders")
client.create_collection("user_sessions")
client.create_collection("blog_posts")
```

### Names to Avoid

```python
# ❌ Avoid: Vague or generic names
client.create_collection("data")
client.create_collection("items")
client.create_collection("stuff")

# ❌ Avoid: Special characters or spaces
client.create_collection("user data")  # Use "user_data" instead
client.create_collection("my-collection")  # Use "my_collection" instead
```

## 🔔 Webhook Integration

Webhooks allow your application to receive real-time notifications when documents in a collection are modified.

### Setting Up Webhooks

```python
# Create collection with webhook
collection = client.create_collection(
    collection_name="notifications",
    webhookurl="https://yourapp.com/api/webhooks/notifications"
)
```

### Webhook Payload Structure

When documents are modified, your webhook endpoint will receive a payload like:

```json
{
  "event": "document.created",
  "collection_id": "collection_id_here",
  "document_id": "document_id_here",
  "data": {
    "field1": "value1",
    "field2": "value2"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `document.created` | New document added to collection |
| `document.updated` | Existing document modified |
| `document.deleted` | Document removed from collection |

## 🛠️ Error Handling

```python
from cocobase_client.exceptions import CocobaseError

try:
    collection = client.create_collection("test_collection")
    print(f"Collection created: {collection.name}")
    
except CocobaseError as e:
    if "Invalid Request" in str(e):
        print("Invalid collection name or parameters")
    elif "field is missing" in str(e):
        print("Required field missing")
    elif "Internal Server Error" in str(e):
        print("Server error occurred")
    else:
        print(f"API error: {e}")
        
except Exception as e:
    print(f"Unexpected error: {e}")
```

## 📊 Complete Collection Management Example

```python
from cocobase_client import CocoBaseClient
from cocobase_client.exceptions import CocobaseError

class CollectionManager:
    def __init__(self, api_key: str):
        self.client = CocoBaseClient(api_key=api_key)
        
    def create_collection_with_retry(self, name: str, webhook_url: str = None, max_retries: int = 3):
        """Create a collection with retry logic"""
        for attempt in range(max_retries):
            try:
                collection = self.client.create_collection(
                    collection_name=name,
                    webhookurl=webhook_url
                )
                return collection
            except CocobaseError as e:
                if attempt == max_retries - 1:
                    raise e
                print(f"Attempt {attempt + 1} failed, retrying...")
                time.sleep(1)
        return None
        
    def setup_application_collections(self):
        """Set up all collections needed for the application"""
        collections_config = [
            {"name": "users", "webhook": "https://app.com/webhooks/users"},
            {"name": "products", "webhook": "https://app.com/webhooks/products"},
            {"name": "orders", "webhook": "https://app.com/webhooks/orders"},
            {"name": "sessions", "webhook": None},
        ]
        
        created_collections = []
        
        for config in collections_config:
            try:
                collection = self.create_collection_with_retry(
                    name=config["name"],
                    webhook_url=config["webhook"]
                )
                created_collections.append(collection)
                print(f"✅ Created collection: {config['name']}")
            except CocobaseError as e:
                print(f"❌ Failed to create collection {config['name']}: {e}")
                
        return created_collections
        
    def cleanup_collection(self, collection_id: str, confirm: bool = False):
        """Safely delete a collection with confirmation"""
        if not confirm:
            print("⚠️  Warning: This will permanently delete the collection and all its documents!")
            response = input("Type 'DELETE' to confirm: ")
            if response != "DELETE":
                print("Operation cancelled")
                return False
                
        try:
            success = self.client.delete_collection(collection_id)
            if success:
                print("✅ Collection deleted successfully")
                return True
            else:
                print("❌ Failed to delete collection")
                return False
        except CocobaseError as e:
            print(f"❌ Error deleting collection: {e}")
            return False

# Usage
manager = CollectionManager("your_api_key")

# Set up application collections
collections = manager.setup_application_collections()

# Update a collection
if collections:
    collection_id = collections[0].id
    result = manager.client.update_collection(
        collection_id=collection_id,
        collection_name="updated_users"
    )
```

## 🔧 Advanced Collection Patterns

### Factory Pattern for Collection Creation

```python
class CollectionFactory:
    def __init__(self, client: CocoBaseClient):
        self.client = client
        
    def create_user_collection(self):
        return self.client.create_collection(
            collection_name="users",
            webhookurl="https://yourapp.com/webhooks/users"
        )
        
    def create_product_collection(self):
        return self.client.create_collection(
            collection_name="products",
            webhookurl="https://yourapp.com/webhooks/products"
        )
        
    def create_audit_collection(self):
        # No webhook for audit logs
        return self.client.create_collection("audit_logs")
```

---

**Next Steps:**
- [Documents Guide](document) - Learn to manage documents within collections
- [Query Builder Guide](query-builder) - Build complex queries for your data
