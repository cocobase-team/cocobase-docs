---
sidebar_position: 1
---

# Cloud Functions Database API

Complete guide to querying and managing data in your CocoBase cloud functions.

## Overview

The **CustomDatabaseService** provides a powerful, MongoDB-like query interface for your PostgreSQL database with automatic relationship detection and advanced filtering capabilities.

### Key Features

- ✅ **Advanced Querying** - 12+ operators (eq, ne, lt, gt, contains, in, etc.)
- ✅ **Complex Logic** - OR/AND combinations with grouping
- ✅ **Auto Relationships** - Automatically detects users vs collections
- ✅ **Deep Population** - Nested relationship loading (author.company.location)
- ✅ **Relationship Filtering** - Filter by related data (author.role=admin)
- ✅ **User Relationships** - Followers, friends, teams support
- ✅ **Zero Configuration** - No manual relationship definitions needed

---

## Quick Start

### Basic Query

```python
def main():
    # Get all published posts
    posts = db.query("posts",
        status="published",
        limit=10
    )

    return {"posts": posts["data"]}
```

### Query with Population

```python
def main():
    # Get posts with author and category data
    posts = db.query("posts",
        status="published",
        populate=["author", "category"],
        sort="created_at",
        order="desc",
        limit=20
    )

    return {"posts": posts["data"]}
```

### Advanced Filtering

```python
def main():
    # Get posts with views > 100, published after date
    posts = db.query("posts",
        status="published",
        views_gte="100",
        created_at_gt="2024-01-01",
        populate=["author"],
        limit=50
    )

    return {"posts": posts["data"]}
```

---

## Table of Contents

1. [Query Operations](#query-operations)
2. [Comparison Operators](#comparison-operators)
3. [Boolean Logic (OR/AND)](#boolean-logic)
4. [Relationships](#relationships)
5. [User Queries](#user-queries)
6. [User Relationships](#user-relationships)
7. [Best Practices](#best-practices)

---

## Query Operations

### query() - Query Collection

Query documents with filters, population, sorting, and pagination.

```python
db.query(
    collection_name: str,
    populate: List[str] = None,
    select: List[str] = None,
    sort: str = None,
    order: str = "asc",
    limit: int = 10,
    offset: int = 0,
    **filters
) -> Dict
```

**Example:**

```python
products = db.query("products",
    category="electronics",
    price_lte="1000",
    stock_gt="0",
    populate=["category", "reviews"],
    sort="price",
    order="asc",
    limit=20
)
```

### find_one() - Get Single Document

```python
product = db.find_one("products",
    id="prod-123",
    populate=["category"]
)
```

### get_documents() - Raw Query

Lower-level method with full filter control:

```python
docs = db.get_documents(
    collection_name="posts",
    filters={"status": "published", "views_gte": "100"},
    populate=["author", "category"],
    limit=50
)
```

---

## Comparison Operators

Add operator suffix to any field name:

| Operator         | Suffix          | Example                       | Description           |
| ---------------- | --------------- | ----------------------------- | --------------------- |
| Equal            | (none) or `_eq` | `status="published"`          | Exact match           |
| Not Equal        | `_ne`           | `status_ne="draft"`           | Not equal             |
| Greater Than     | `_gt`           | `price_gt="100"`              | Greater than          |
| Greater or Equal | `_gte`          | `age_gte="18"`                | Greater than or equal |
| Less Than        | `_lt`           | `price_lt="1000"`             | Less than             |
| Less or Equal    | `_lte`          | `stock_lte="10"`              | Less than or equal    |
| Contains         | `_contains`     | `title_contains="python"`     | String contains       |
| Starts With      | `_startswith`   | `name_startswith="john"`      | String starts with    |
| Ends With        | `_endswith`     | `email_endswith="@gmail.com"` | String ends with      |
| In Array         | `_in`           | `status_in="published,draft"` | Value in list         |
| Not In Array     | `_notin`        | `category_notin="spam,nsfw"`  | Value not in list     |
| Is Null          | `_isnull`       | `deleted_at_isnull="true"`    | Check if null         |

### Examples

```python
# Equal (default)
posts = db.query("posts", status="published")

# Greater than
products = db.query("products", price_gt="50")

# Contains (case-insensitive)
users = db.query_users(name_contains="john")

# In array
posts = db.query("posts",
    status_in="published,featured,trending"
)

# Multiple operators
products = db.query("products",
    price_gte="50",
    price_lte="500",
    stock_gt="0",
    category_ne="discontinued"
)
```

---

## Boolean Logic

### OR Queries

#### Simple OR (Multiple values for one field)

```python
# Posts with status = published OR featured
posts = db.query("posts",
    **{
        "[or]status": "published",
        "[or]status_2": "featured"
    }
)
```

#### OR with Different Fields

```python
# Posts where title OR content contains "python"
posts = db.query("posts",
    **{
        "[or]title_contains": "python",
        "[or]content_contains": "python"
    }
)
```

#### Named OR Groups

```python
# (category=tech OR category=programming) AND (status=published OR status=featured)
posts = db.query("posts",
    **{
        "[or:cats]category": "tech",
        "[or:cats]category_2": "programming",
        "[or:status]status": "published",
        "[or:status]status_2": "featured"
    }
)
```

### AND Queries (Default)

```python
# All filters are ANDed by default
posts = db.query("posts",
    status="published",      # AND
    category="technology",   # AND
    views_gte="100"         # AND
)
```

### Multi-Field Queries

```python
# Posts where (title OR content) contains keyword
posts = db.query("posts",
    __or__={"title_contains": "AI", "content_contains": "AI"},
    status="published"
)

# Complex: (field1 OR field2) AND (field3 OR field4)
docs = db.query("posts",
    __or__={"title": "Python", "category": "Programming"},
    __and__={"status": "published", "featured": "true"}
)
```

---

## Relationships

### How Relationships Work

Relationships are **automatically detected** based on your field names. No manual configuration needed!

#### Field Naming Convention

- **Single reference**: `{field}_id`
- **Multiple references**: `{field}_ids`

```json
{
  "author_id": "user-123", // ← Single user
  "category_id": "cat-1", // ← Single document
  "tag_ids": ["tag-1", "tag-2"], // ← Multiple documents
  "follower_ids": ["user-4", "user-5"] // ← Multiple users
}
```

#### Auto-Detection Logic

```
1. Extract field name (e.g., "author" from "author_id")
2. Pluralize it ("author" → "authors")
3. Check if it's a system collection ["users", "app_users", "appusers"]
   → YES: Query AppUser table
   → NO: Look for collection with that name
     → FOUND: Query Documents table
     → NOT FOUND: Fallback to AppUser table
```

### Basic Population

```python
# Populate single relationship
posts = db.query("posts",
    populate=["author"],
    limit=10
)
```

**Input:**

```json
{
  "id": "post-1",
  "title": "My Post",
  "author_id": "user-123"
}
```

**Output:**

```json
{
  "id": "post-1",
  "title": "My Post",
  "author": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Multiple Relationships

```python
# Populate multiple fields
posts = db.query("posts",
    populate=["author", "category", "tags"],
    limit=10
)
```

### Nested (Deep) Population

```python
# Populate author and their company and location
posts = db.query("posts",
    populate=["author.company.location"],
    limit=10
)
```

**Result:**

```json
{
  "id": "post-1",
  "title": "My Post",
  "author": {
    "id": "user-123",
    "name": "John Doe",
    "company": {
      "id": "comp-1",
      "name": "TechCorp",
      "location": {
        "id": "loc-1",
        "city": "San Francisco",
        "country": "USA"
      }
    }
  }
}
```

### Relationship Filtering

Filter documents by properties of related data:

```python
# Get posts where author has role=admin
posts = db.query("posts",
    **{
        "author.role": "admin"
    },
    populate=["author"],
    limit=20
)

# Get orders where customer age >= 18
orders = db.query("orders",
    **{
        "customer.age_gte": "18"
    },
    populate=["customer"]
)

# Multiple relationship filters
posts = db.query("posts",
    **{
        "author.verified": "true",
        "category.status": "active"
    },
    populate=["author", "category"]
)
```

### Select Specific Fields

```python
# Only return specific fields
posts = db.query("posts",
    populate=["author"],
    select=["id", "title", "author"],
    limit=10
)
```

---

## User Queries

Query users (AppUser table) with same powerful features:

### query_users() - Query Users

```python
users = db.query_users(
    role="premium",
    age_gte="18",
    email_endswith="@gmail.com",
    populate=["referred_by"],
    sort="created_at",
    order="desc",
    limit=50
)
```

### find_user() - Get Single User

```python
user = db.find_user(
    id="user-123",
    populate=["company", "manager"]
)

# Or by email
user = db.find_user(
    email="john@example.com"
)
```

### get_app_users() - Raw User Query

```python
users = db.get_app_users(
    filters={"role": "admin", "verified": "true"},
    populate=["company"],
    limit=100
)
```

### User Population Example

```json
// User document
{
  "id": "user-123",
  "email": "john@example.com",
  "data": {
    "name": "John Doe",
    "manager_id": "user-999",
    "company_id": "comp-1",
    "referred_by_id": "user-456"
  }
}
```

```python
# Populate user relationships
user = db.find_user(
    id="user-123",
    populate=["manager", "company", "referred_by"]
)
```

**Result:**

```json
{
  "id": "user-123",
  "email": "john@example.com",
  "name": "John Doe",
  "manager": {
    "id": "user-999",
    "name": "Jane Manager"
  },
  "company": {
    "id": "comp-1",
    "name": "TechCorp"
  },
  "referred_by": {
    "id": "user-456",
    "name": "Sarah Smith"
  }
}
```

---

## User Relationships

Manage relationships between users (followers, friends, teams) and between users and collections.

### Get User Relationships

```python
# Get user's followers
followers = db.get_user_relationships(
    user_id="user-123",
    relationship_type="followers",
    limit=50
)

# Get users this user follows
following = db.get_user_relationships(
    user_id="user-123",
    relationship_type="following",
    limit=50
)

# Get friends
friends = db.get_user_relationships(
    user_id="user-123",
    relationship_type="friends",
    limit=100
)
```

**Response:**

```json
{
  "data": [
    {
      "id": "user-456",
      "email": "jane@example.com",
      "name": "Jane Smith",
      "avatar": "https://..."
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0,
  "has_more": true
}
```

### Add Relationship

```python
# User follows another user
result = db.add_user_relationship(
    user_id="user-123",
    related_user_id="user-456",
    relationship_type="following"
)

# Add bidirectional (friends)
result = db.add_user_relationship(
    user_id="user-123",
    related_user_id="user-456",
    relationship_type="friends",
    bidirectional=True  # Both become friends
)
```

### Remove Relationship

```python
# Unfollow
result = db.remove_user_relationship(
    user_id="user-123",
    related_user_id="user-456",
    relationship_type="following"
)

# Unfriend (bidirectional)
result = db.remove_user_relationship(
    user_id="user-123",
    related_user_id="user-456",
    relationship_type="friends",
    bidirectional=True  # Removes for both
)
```

### Get User's Collections

Get all documents in a collection that belong to a user:

```python
# Get user's posts
posts = db.get_user_collections(
    user_id="user-123",
    collection_name="posts",
    filters={"status": "published"},
    populate=["category"],
    limit=20
)

# Get user's comments
comments = db.get_user_collections(
    user_id="user-123",
    collection_name="comments",
    populate=["post"],
    limit=50
)
```

### Common Patterns

#### Follow System

```python
def main():
    action = req.get("action")
    user_id = req.get("user_id")
    target_id = req.get("target_id")

    if action == "follow":
        return db.add_user_relationship(user_id, target_id, "following")

    elif action == "unfollow":
        return db.remove_user_relationship(user_id, target_id, "following")

    elif action == "followers":
        return db.get_user_relationships(user_id, "followers", limit=50)

    elif action == "following":
        return db.get_user_relationships(user_id, "following", limit=50)
```

#### Friend System

```python
def main():
    action = req.get("action")
    user_id = req.get("user_id")
    friend_id = req.get("friend_id")

    if action == "add_friend":
        return db.add_user_relationship(
            user_id, friend_id, "friends", bidirectional=True
        )

    elif action == "remove_friend":
        return db.remove_user_relationship(
            user_id, friend_id, "friends", bidirectional=True
        )

    elif action == "get_friends":
        return db.get_user_relationships(user_id, "friends", limit=100)
```

#### Social Feed

```python
def main():
    user_id = req.get("user_id")

    # Get users this user follows
    following = db.get_user_relationships(user_id, "following")
    following_ids = [u["id"] for u in following["data"]]

    # Build OR filter for posts from followed users
    filters = {}
    for idx, followed_id in enumerate(following_ids[:50]):
        filters[f"[or:authors]author_id_{idx}"] = followed_id

    # Query posts
    feed = db.query("posts", **{
        **filters,
        "status": "published"
    },
    populate=["author", "category"],
    sort="created_at",
    order="desc",
    limit=30)

    return {"feed": feed["data"]}
```

---

## Best Practices

### 1. Always Use Limits

```python
# Good
posts = db.query("posts", limit=20)

# Bad (could return thousands)
posts = db.query("posts")
```

### 2. Use Indexes for Performance

```python
# Query on indexed fields
posts = db.query("posts",
    status="published",  # Should be indexed
    user_id="user-123",  # Should be indexed
    sort="created_at",   # Should be indexed
    limit=20
)
```

### 3. Selective Population

```python
# Good - only populate what you need
posts = db.query("posts",
    populate=["author"],
    select=["id", "title", "author"]
)

# Bad - populating everything is slow
posts = db.query("posts",
    populate=["author", "category", "tags", "comments", "likes"]
)
```

### 4. Clear Field Naming

```python
# Good - clear intent
{
  "author_id": "user-123",        # Obviously a user
  "product_ids": ["p1", "p2"],    # Obviously products
  "referred_by_id": "user-456"    # Obviously a user
}

# Bad - ambiguous
{
  "related_id": "...",   # Related to what?
  "linked_ids": ["..."]  # Linked to what?
}
```

### 5. Cache Relationship Counts

```python
# Store counts for quick access
user_data = {
  "followers_count": 1500,  # Update when changed
  "following_count": 300,
  "posts_count": 42
}

# Instead of counting every time
followers = db.get_user_relationships(user_id, "followers")
count = followers["total"]  # Expensive!
```

### 6. Handle Pagination

```python
def get_posts(page=1, per_page=20):
    offset = (page - 1) * per_page

    result = db.query("posts",
        status="published",
        limit=per_page,
        offset=offset,
        sort="created_at",
        order="desc"
    )

    return {
        "posts": result["data"],
        "page": page,
        "per_page": per_page,
        "total": result["total"],
        "has_more": result["has_more"]
    }
```

### 7. Error Handling

```python
def main():
    try:
        user_id = req.get("user_id")

        if not user_id:
            return {"error": "user_id is required"}, 400

        posts = db.query("posts",
            author_id=user_id,
            limit=20
        )

        return {"posts": posts["data"]}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": "Internal server error"}, 500
```

---

## Complete Examples

### E-Commerce Product Search

```python
def main():
    # Get filters from request
    category = req.get("category")
    min_price = req.get("min_price", "0")
    max_price = req.get("max_price", "10000")
    search = req.get("search", "")

    # Build filters
    filters = {
        "status": "active",
        "stock_gt": "0",
        "price_gte": min_price,
        "price_lte": max_price
    }

    if category:
        filters["category_id"] = category

    if search:
        filters["[or]name_contains"] = search
        filters["[or]description_contains"] = search

    # Query products
    products = db.query("products", **filters,
        populate=["category", "reviews"],
        sort="popularity",
        order="desc",
        limit=24
    )

    return {
        "products": products["data"],
        "total": products["total"],
        "has_more": products["has_more"]
    }
```

### User Dashboard

```python
def main():
    user_id = req.get("user_id")

    # Get user info
    user = db.find_user(id=user_id, populate=["company"])

    # Get user's posts
    posts = db.get_user_collections(
        user_id, "posts",
        filters={"status": "published"},
        limit=10
    )

    # Get followers/following
    followers = db.get_user_relationships(user_id, "followers", limit=5)
    following = db.get_user_relationships(user_id, "following", limit=5)

    # Get recent activity
    comments = db.get_user_collections(
        user_id, "comments",
        populate=["post"],
        limit=5
    )

    return {
        "user": user,
        "stats": {
            "posts": posts["total"],
            "followers": followers["total"],
            "following": following["total"],
            "comments": comments["total"]
        },
        "recent_posts": posts["data"],
        "recent_comments": comments["data"]
    }
```

### Blog Search with Filters

```python
def main():
    # Get search params
    keyword = req.get("keyword", "")
    category = req.get("category")
    author_id = req.get("author_id")
    tags = req.get("tags", "").split(",") if req.get("tags") else []

    # Build filters
    filters = {"status": "published"}

    # Search in title or content
    if keyword:
        filters["[or:search]title_contains"] = keyword
        filters["[or:search]content_contains"] = keyword

    # Filter by category
    if category:
        filters["category_id"] = category

    # Filter by author
    if author_id:
        filters["author_id"] = author_id

    # Filter by tags (any tag matches)
    if tags:
        for idx, tag in enumerate(tags):
            filters[f"[or:tags]tag_ids_{idx}"] = tag

    # Query posts
    posts = db.query("posts", **filters,
        populate=["author", "category", "tags"],
        sort="created_at",
        order="desc",
        limit=20
    )

    return {
        "posts": posts["data"],
        "total": posts["total"]
    }
```

---

## API Reference

### Query Methods

#### `query(collection_name, **options)`

Query collection documents with filters and options.

**Parameters:**

- `collection_name` (str): Collection name
- `populate` (List[str]): Fields to populate
- `select` (List[str]): Fields to select
- `sort` (str): Field to sort by
- `order` (str): Sort order ("asc" or "desc")
- `limit` (int): Max results (default: 10)
- `offset` (int): Pagination offset (default: 0)
- `**filters`: Field filters with operators

**Returns:** `Dict[data, total, limit, offset, has_more]`

#### `find_one(collection_name, **filters)`

Get single document matching filters.

**Returns:** `Dict` or `None`

#### `query_users(**options)`

Query users (AppUser) with filters and options.

**Returns:** `Dict[data, total, limit, offset, has_more]`

#### `find_user(**filters)`

Get single user matching filters.

**Returns:** `Dict` or `None`

### Relationship Methods

#### `get_user_relationships(user_id, relationship_type, **options)`

Get users related to a user.

**Parameters:**

- `user_id` (str): User ID
- `relationship_type` (str): Relationship type (followers, following, friends, etc.)
- `filters` (dict): Additional filters
- `limit` (int): Max results
- `offset` (int): Pagination offset

**Returns:** `Dict[data, total, limit, offset, has_more]`

#### `get_user_collections(user_id, collection_name, **options)`

Get collection documents belonging to a user.

**Returns:** `Dict[data, total, limit, offset, has_more]`

#### `add_user_relationship(user_id, related_user_id, relationship_type, bidirectional=False)`

Add relationship between users.

**Returns:** `Dict[success, message, bidirectional]`

#### `remove_user_relationship(user_id, related_user_id, relationship_type, bidirectional=False)`

Remove relationship between users.

**Returns:** `Dict[success, message, bidirectional]`

---

## Need Help?

Check out the example functions:

- `examples/advanced_query_examples.py` - 10 collection query examples
- `examples/user_relationship_examples.py` - 10 user relationship examples

---

**Happy Coding! 🚀**
