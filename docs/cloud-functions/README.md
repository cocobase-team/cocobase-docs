# Cloud Functions Documentation

> **Comprehensive documentation for CocoBase Cloud Functions**

Build powerful serverless backend logic with Python, advanced database queries, and dynamic HTML rendering.

---

## 📚 Documentation Structure

### 1. [Introduction](./introduction.md)

**Getting Started** - Overview and basic concepts

- ✅ What are Cloud Functions
- ✅ Key features and capabilities
- ✅ Available objects (request, db, render, env)
- ✅ Common use cases
- ✅ Response types
- ✅ Security basics

**Perfect for:** First-time users

---

### 2. [Database API](./database-api.md)

**Complete Database Reference** - Advanced querying and data management

- ✅ Query operations (query, find_one, query_users, find_user)
- ✅ Comparison operators (12+ operators)
- ✅ Boolean logic (OR/AND queries)
- ✅ Auto-relationship detection
- ✅ Deep population and filtering
- ✅ User relationships (followers, friends, teams)
- ✅ Best practices
- ✅ Complete API reference

**Perfect for:** Learning the database system in depth

---

### 3. [Cloud Function Environment](./cloud-function-environment.md)

**Execution Environment** - Request/response handling

- ✅ Function execution (GET/POST)
- ✅ Request object (payload, query params, headers)
- ✅ Response types (JSON, HTML, string)
- ✅ Template rendering with Jinja2
- ✅ Authentication and user access
- ✅ Complete environment reference

**Perfect for:** Understanding the runtime environment

---

### 4. [Quick Reference](./quick-reference.md)

**Cheat Sheet** - Quick lookup for common patterns

- ✅ All operators at a glance
- ✅ Boolean logic examples
- ✅ Relationship patterns
- ✅ Common use cases
- ✅ Field naming conventions
- ✅ Response formats

**Perfect for:** Quick lookups while coding

---

### 5. [Examples](./examples.md)

**Real-World Examples** - Complete working code

- ✅ E-commerce (products, cart, orders)
- ✅ Social media (feed, profile, follow/unfollow)
- ✅ Blog/CMS (search, comments, related posts)
- ✅ Project management (tasks, teams)
- ✅ Analytics (dashboards, popular content)

**Perfect for:** Copy-paste starting points

---

---

## 🚀 Key Features

### Advanced Querying

```python
products = db.query("products",
    price_gte="50",
    price_lte="500",
    stock_gt="0",
    category_in="electronics,computers",
    sort="popularity",
    limit=24
)
```

### Auto Relationships

```python
# Automatically detects users vs documents
posts = db.query("posts",
    populate=["author", "category", "tags"],  # No config needed!
    limit=20
)
```

### Complex Logic

```python
# OR groups
posts = db.query("posts", **{
    "[or:search]title_contains": "python",
    "[or:search]content_contains": "python",
    "[or:status]status": "published",
    "[or:status]status_2": "featured"
})
```

### User Relationships

```python
# Built-in social features
followers = db.get_user_relationships("user-123", "followers", limit=50)
db.add_user_relationship("user-1", "user-2", "following")
posts = db.get_user_collections("user-123", "posts", limit=20)
```

---

## 📖 Documentation Structure

The Cloud Functions documentation is organized as follows:

```
cloud-functions/
├── README.md                      ← You are here
├── introduction.md                ← Getting started guide
├── database-api.md                ← Database API reference (comprehensive)
├── cloud-function-environment.md  ← Execution environment & request/response
├── quick-reference.md             ← Quick lookup (cheat sheet)
└── examples.md                    ← Real-world examples (copy-paste)
```

---

## ✨ What Makes This Special

### Zero Configuration

No need to define relationships manually. The system automatically detects whether fields point to users or collection documents.

### MongoDB-like Syntax

Familiar query interface for PostgreSQL with JSONB fields.

### Production Ready

- ✅ No syntax errors
- ✅ Tested implementation
- ✅ Performance optimized
- ✅ Automatic relationship caching

### Complete Examples

Every feature has working code examples you can copy and modify.

---

## 🔗 Quick Links

1. **[Introduction](./introduction.md)** - Get started with Cloud Functions
2. **[Database API](./database-api.md)** - Complete database reference
3. **[Cloud Function Environment](./cloud-function-environment.md)** - Request/response handling
4. **[Quick Reference](./quick-reference.md)** - Syntax cheat sheet
5. **[Examples](./examples.md)** - Real-world use cases

---

## 🤝 Need Help?

Start with:

1. **[Introduction](./introduction.md)** - If you're new to Cloud Functions
2. **[Examples](./examples.md)** - For copy-paste starting points
3. **[Quick Reference](./quick-reference.md)** - For quick syntax lookups
4. **[Database API](./database-api.md)** - For in-depth database queries

---

**Happy Coding! 🚀**
