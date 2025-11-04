---
sidebar_position: 2
---

# Quick Reference

Quick lookup for common queries and patterns.

## Operators

```python
# Comparison
db.query("posts", status="published")                    # Equal
db.query("posts", status_ne="draft")                     # Not equal
db.query("posts", views_gt="100")                        # Greater than
db.query("posts", views_gte="100")                       # Greater or equal
db.query("posts", views_lt="1000")                       # Less than
db.query("posts", views_lte="1000")                      # Less or equal

# String
db.query("posts", title_contains="python")               # Contains
db.query("posts", title_startswith="How to")             # Starts with
db.query("posts", email_endswith="@gmail.com")           # Ends with

# Array
db.query("posts", status_in="published,featured")        # In array
db.query("posts", category_notin="spam,nsfw")            # Not in array

# Null check
db.query("posts", deleted_at_isnull="true")              # Is null
```

## Boolean Logic

```python
# OR - same field
db.query("posts", **{
    "[or]status": "published",
    "[or]status_2": "featured"
})

# OR - different fields
db.query("posts", **{
    "[or]title_contains": "python",
    "[or]content_contains": "python"
})

# OR groups
db.query("posts", **{
    "[or:cats]category": "tech",
    "[or:cats]category_2": "programming",
    "[or:status]status": "published",
    "[or:status]status_2": "featured"
})

# Multi-field
db.query("posts",
    __or__={"title": "Python", "category": "Programming"},
    status="published"
)
```

## Relationships

```python
# Basic population
db.query("posts", populate=["author"])

# Multiple fields
db.query("posts", populate=["author", "category", "tags"])

# Nested (deep)
db.query("posts", populate=["author.company.location"])

# With filtering
db.query("posts", **{"author.role": "admin"}, populate=["author"])

# Select fields
db.query("posts", populate=["author"], select=["id", "title", "author"])
```

## User Queries

```python
# Query users
db.query_users(role="premium", age_gte="18", limit=50)

# Find user
db.find_user(id="user-123", populate=["company"])
db.find_user(email="john@example.com")

# User relationships
db.get_user_relationships("user-123", "followers", limit=50)
db.get_user_relationships("user-123", "following", limit=50)
db.get_user_relationships("user-123", "friends", limit=100)

# User's documents
db.get_user_collections("user-123", "posts", limit=20)
db.get_user_collections("user-123", "comments", limit=50)

# Add/remove relationships
db.add_user_relationship("user-1", "user-2", "following")
db.remove_user_relationship("user-1", "user-2", "following")
db.add_user_relationship("user-1", "user-2", "friends", bidirectional=True)
```

## Common Patterns

### Pagination

```python
page = 1
per_page = 20
offset = (page - 1) * per_page

result = db.query("posts",
    status="published",
    limit=per_page,
    offset=offset,
    sort="created_at",
    order="desc"
)

return {
    "data": result["data"],
    "page": page,
    "total": result["total"],
    "has_more": result["has_more"]
}
```

### Search

```python
keyword = req.get("keyword", "")

posts = db.query("posts", **{
    "[or]title_contains": keyword,
    "[or]content_contains": keyword,
    "status": "published"
}, limit=20)
```

### Filtering with Population

```python
products = db.query("products",
    category_id="cat-1",
    price_gte="50",
    price_lte="500",
    stock_gt="0",
    populate=["category", "reviews"],
    sort="price",
    order="asc",
    limit=24
)
```

### User Profile

```python
user_id = req.get("user_id")

user = db.find_user(id=user_id, populate=["company"])
posts = db.get_user_collections(user_id, "posts", limit=10)
followers = db.get_user_relationships(user_id, "followers", limit=5)
following = db.get_user_relationships(user_id, "following", limit=5)

return {
    "user": user,
    "stats": {
        "posts": posts["total"],
        "followers": followers["total"],
        "following": following["total"]
    },
    "recent_posts": posts["data"]
}
```

### Social Feed

```python
user_id = req.get("user_id")

# Get following
following = db.get_user_relationships(user_id, "following")
following_ids = [u["id"] for u in following["data"]]

# Build OR filters
filters = {"status": "published"}
for idx, followed_id in enumerate(following_ids[:50]):
    filters[f"[or:authors]author_id_{idx}"] = followed_id

# Get feed
feed = db.query("posts", **filters,
    populate=["author", "category"],
    sort="created_at",
    order="desc",
    limit=30
)

return {"feed": feed["data"]}
```

### Follow/Unfollow

```python
action = req.get("action")
user_id = req.get("user_id")
target_id = req.get("target_id")

if action == "follow":
    return db.add_user_relationship(user_id, target_id, "following")
elif action == "unfollow":
    return db.remove_user_relationship(user_id, target_id, "following")
elif action == "is_following":
    following = db.get_user_relationships(user_id, "following")
    is_following = target_id in [u["id"] for u in following["data"]]
    return {"is_following": is_following}
```

## Field Naming

```python
# Single reference (belongs_to)
{
  "author_id": "user-123",
  "category_id": "cat-1",
  "manager_id": "user-456"
}

# Multiple references (has_many)
{
  "tag_ids": ["tag-1", "tag-2"],
  "follower_ids": ["user-1", "user-2"],
  "product_ids": ["prod-1", "prod-2"]
}

# Populate
populate=["author", "category", "manager", "tags", "followers", "products"]
```

## Response Format

```python
{
  "data": [
    {"id": "...", "title": "..."},
    {"id": "...", "title": "..."}
  ],
  "total": 150,      # Total matching documents
  "limit": 20,       # Requested limit
  "offset": 0,       # Offset used
  "has_more": true   # More results available
}
```

## Error Handling

```python
def main():
    try:
        posts = db.query("posts",
            status="published",
            limit=20
        )
        return {"posts": posts["data"]}
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": "Internal server error"}, 500
```

## Tips

- Always use `limit` to avoid large result sets
- Use `populate` only for needed fields
- Use `select` to return only required fields
- Cache relationship counts in user data
- Index frequently queried fields
- Use pagination for large datasets
- Handle errors gracefully
