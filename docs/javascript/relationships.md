---
sidebar_position: 6
title: Relationships & Population
---

# Relationships & Population Guide

Complete guide for working with relationships between documents in COCOBASE.

## 📖 Table of Contents

1. [Setting Up Relationships](#setting-up-relationships)
2. [Basic Population](#basic-population)
3. [Multiple Populations](#multiple-populations)
4. [Nested Populations](#nested-populations)
5. [Filtering by Relationship Fields](#filtering-by-relationship-fields)
6. [Field Selection with Relationships](#field-selection-with-relationships)
7. [Real-World Examples](#real-world-examples)

---

## Setting Up Relationships

Documents can reference other documents using foreign keys. By convention, use `{collection_name}_id` format:

### Example Document Structure

**Posts Collection:**

```json
{
  "id": "post-1",
  "title": "My First Post",
  "content": "Hello World",
  "author_id": "user-123",
  "category_id": "cat-456",
  "created_at": "2025-11-01T10:00:00Z"
}
```

**Users Collection:**

```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

---

## Basic Population

Use the `populate` parameter to automatically fetch related documents:

```typescript
import { buildFilterQuery } from "coco_base_js";

// Populate author relationship
const queryString = buildFilterQuery({
  populate: "author",
});

// Use with API
const posts = await fetch(
  `${baseUrl}/collections/posts/documents?${queryString}`
);
```

**Response:**

```json
[
  {
    "id": "post-1",
    "title": "My First Post",
    "author_id": "user-123",
    "author": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
]
```

---

## Multiple Populations

Populate multiple relationships at once:

```typescript
// Populate both author and category
const queryString = buildFilterQuery({
  populate: ["author", "category"],
});
```

**Response:**

```json
[
  {
    "id": "post-1",
    "title": "My First Post",
    "author_id": "user-123",
    "category_id": "cat-456",
    "author": {
      "id": "user-123",
      "name": "John Doe"
    },
    "category": {
      "id": "cat-456",
      "name": "Technology"
    }
  }
]
```

Alternative syntax:

```typescript
buildFilterQuery({
  populate: "author,category",
});
```

---

## Nested Populations

Populate relationships within relationships using dot notation:

```typescript
// Comments -> Post -> Author
const queryString = buildFilterQuery({
  populate: "post.author",
});
```

**Response:**

```json
[
  {
    "id": "comment-1",
    "text": "Great post!",
    "post_id": "post-1",
    "post": {
      "id": "post-1",
      "title": "My First Post",
      "author_id": "user-123",
      "author": {
        "id": "user-123",
        "name": "John Doe"
      }
    }
  }
]
```

### Multiple Nested Populations

```typescript
buildFilterQuery({
  populate: ["post.author", "post.category", "user"],
});
```

---

## Filtering by Relationship Fields

Query documents based on related document data:

```typescript
// Find posts by admin authors
const queryString = buildFilterQuery({
  filters: {
    "author.role": "admin",
  },
  populate: "author",
});
```

**SQL Equivalent:**

```sql
SELECT posts.* FROM posts
JOIN users ON posts.author_id = users.id
WHERE users.role = 'admin'
```

### Using Operators on Relationships

```typescript
// Find posts by authors with email containing 'john'
buildFilterQuery({
  filters: {
    "author.email_contains": "john",
  },
  populate: "author",
});

// Find posts by authors older than 18
buildFilterQuery({
  filters: {
    "author.age_gte": 18,
  },
  populate: "author",
});
```

### Complex Relationship Queries

```typescript
// Find posts by admin authors OR verified authors in Technology category
buildFilterQuery({
  filters: {
    "[or]author.role": "admin",
    "[or]author.isVerified": true,
    "category.name": "Technology",
    status: "published",
  },
  populate: ["author", "category"],
  sort: "created_at",
  order: "desc",
});
```

---

## Field Selection with Relationships

Control response size by selecting specific fields:

```typescript
// Only return title, content, and author name/email
buildFilterQuery({
  select: ["title", "content", "author.name", "author.email"],
  populate: "author",
});
```

**Response:**

```json
[
  {
    "title": "My First Post",
    "content": "Hello World",
    "author": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### Select from Multiple Relations

```typescript
buildFilterQuery({
  select: [
    "title",
    "content",
    "author.name",
    "author.email",
    "category.name",
    "category.slug",
  ],
  populate: ["author", "category"],
});
```

---

## Real-World Examples

### Blog System

```typescript
// Get published posts with author and category info
const blogQuery = buildFilterQuery({
  filters: {
    status: "published",
    "category.slug_ne": "draft",
  },
  populate: ["author", "category"],
  select: [
    "title",
    "excerpt",
    "slug",
    "created_at",
    "author.name",
    "author.avatar",
    "category.name",
    "category.slug",
  ],
  sort: "created_at",
  order: "desc",
  limit: 20,
});

const response = await fetch(
  `${baseUrl}/collections/posts/documents?${blogQuery}`
);
```

### Social Media Feed

```typescript
// Get posts from friends with comments
const feedQuery = buildFilterQuery({
  filters: {
    "author.id_in": friendIds.join(","),
    visibility: "public",
    "author.isBlocked": false,
  },
  populate: ["author", "comments.user"],
  select: [
    "content",
    "image",
    "created_at",
    "likes",
    "author.name",
    "author.avatar",
  ],
  sort: "created_at",
  order: "desc",
  limit: 50,
});
```

### E-commerce Orders

```typescript
// Get user orders with product details
const ordersQuery = buildFilterQuery({
  filters: {
    "customer.id": userId,
    "[or]status": "pending",
    "[or]status": "processing",
    "product.inStock": true,
  },
  populate: ["customer", "product", "product.category"],
  select: [
    "orderNumber",
    "quantity",
    "total",
    "status",
    "customer.name",
    "product.name",
    "product.price",
  ],
  sort: "created_at",
  order: "desc",
});
```

### Project Management

```typescript
// Get tasks with project details
const tasksQuery = buildFilterQuery({
  filters: {
    "assignee.team_id": teamId,
    "[or:priority]priority": "high",
    "[or:priority]isOverdue": true,
    "project.status_ne": "archived",
    status_notin: "completed,cancelled",
  },
  populate: ["assignee", "project", "project.owner"],
  select: [
    "title",
    "description",
    "dueDate",
    "priority",
    "assignee.name",
    "project.name",
  ],
  sort: "dueDate",
  order: "asc",
});
```

---

## Best Practices

### ✅ DO's

1. **Use Consistent Naming Convention**

   ```typescript
   // Good: {collection}_id format
   author_id: "user-123";
   category_id: "cat-456";
   ```

2. **Select Only Needed Fields**

   ```typescript
   buildFilterQuery({
     select: ["title", "author.name"],
     populate: "author",
   });
   ```

3. **Filter Before Populating**

   ```typescript
   buildFilterQuery({
     filters: { status: "published" },
     populate: "author",
   });
   ```

4. **Limit Nested Populations**

   ```typescript
   // Good: 1-2 levels deep
   populate: "post.author";

   // Avoid: Very deep nesting
   populate: "comment.post.author.team.company";
   ```

### ❌ DON'Ts

1. **Don't Over-Populate**

   ```typescript
   // Bad: Populating unnecessary relationships
   populate: ["author", "category", "tags", "comments", "likes"];

   // Good: Only what you need
   populate: ["author", "category"];
   ```

2. **Don't Skip Pagination**
   ```typescript
   // Always use limit for large result sets
   buildFilterQuery({
     populate: "author",
     limit: 50,
     offset: 0,
   });
   ```

---

## Performance Tips

1. **Index Foreign Keys** - Ensure all `*_id` fields are indexed
2. **Use Pagination** - Always limit result sets
3. **Select Specific Fields** - Don't fetch unnecessary data
4. **Cache Relationships** - Cache frequently accessed related data

---

## Next Steps

- [Advanced Features](./advanced) - Learn more advanced SDK features
- [Examples](../examples/sample-project) - See complete implementations
