# Cloud Functions Documentation

> **Comprehensive documentation for CocoBase Cloud Functions Database API**

This documentation is designed for **Docusaurus** and provides a complete guide to querying and managing data in your cloud functions.

---

## 📚 Documentation Files

### 1. [database-api.md](./database-api.md)

**Main reference** - Complete guide to the Database API

- ✅ Query operations (query, find_one, query_users, find_user)
- ✅ Comparison operators (12+ operators)
- ✅ Boolean logic (OR/AND queries)
- ✅ Auto-relationship detection
- ✅ Deep population and filtering
- ✅ User relationships (followers, friends, teams)
- ✅ Best practices
- ✅ Complete API reference

**Perfect for:** Learning the system from scratch

---

### 2. [quick-reference.md](./quick-reference.md)

**Cheat sheet** - Quick lookup for common patterns

- ✅ All operators at a glance
- ✅ Boolean logic examples
- ✅ Relationship patterns
- ✅ Common use cases
- ✅ Field naming conventions
- ✅ Response formats

**Perfect for:** Quick lookups while coding

---

### 3. [cloud-function-environment.md](./cloud-function-environment.md)

**Execution environment** - Request/response handling

- ✅ Function execution (GET/POST)
- ✅ Request object (payload, query params, headers)
- ✅ Response types (JSON, HTML, string)
- ✅ Template rendering with Jinja2
- ✅ Authentication and user access
- ✅ Complete environment reference

**Perfect for:** Understanding how cloud functions work

---

### 4. [examples.md](./examples.md)

**Real-world examples** - Complete working code

- ✅ E-commerce (products, cart, orders)
- ✅ Social media (feed, profile, follow/unfollow)
- ✅ Blog/CMS (search, comments, related posts)
- ✅ Project management (tasks, teams)
- ✅ Analytics (dashboards, popular content)

**Perfect for:** Copy-paste starting points

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

## 📖 Using with Docusaurus

### Installation

1. Copy these files to your Docusaurus `docs` folder:

```bash
cp docs/*.md /path/to/docusaurus/docs/cloud-functions/
```

2. Update `sidebars.js`:

```javascript
module.exports = {
  docs: [
    {
      type: "category",
      label: "Cloud Functions",
      items: [
        "cloud-functions/database-api",
        "cloud-functions/cloud-function-environment",
        "cloud-functions/quick-reference",
        "cloud-functions/examples",
      ],
    },
  ],
};
```

3. The files already have front matter for Docusaurus:

```yaml
---
sidebar_position: 1
---
```

---

## 🎯 Code Examples Location

Find ready-to-use code examples:

- **Collection queries**: `examples/advanced_query_examples.py`
- **User relationships**: `examples/user_relationship_examples.py`

Each file contains 10+ complete, working cloud functions you can use as starting points.

---

## 📝 Documentation Structure

```
docs/
├── README.md                      ← You are here
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

- **Database API**: [database-api.md](./database-api.md)
- **Execution Environment**: [cloud-function-environment.md](./cloud-function-environment.md)
- **Quick Reference**: [quick-reference.md](./quick-reference.md)
- **Examples**: [examples.md](./examples.md)
- **Code Samples**: `../examples/` directory

---

## 🤝 Support

Need help? Check:

1. **API Reference** - Complete method documentation
2. **Examples** - Real-world use cases
3. **Quick Reference** - Common patterns

---

**Happy Coding! 🚀**
