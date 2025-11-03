---
sidebar_position: 5
title: Query Guide
---

# CocoBase Flutter SDK - Query Guide

Complete guide to using the powerful QueryBuilder for complex queries with OR conditions, relationships, and more.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Query Types](#query-types)
- [Operators](#operators)
- [Relationships (Populate)](#relationships-populate)
- [Field Selection](#field-selection)
- [Sorting & Pagination](#sorting--pagination)
- [Real-World Examples](#real-world-examples)

## Basic Setup

```dart
import 'package:coco_base_flutter/coco_base_flutter.dart';

// Initialize with optional custom base URL
final cocobase = Cocobase(
  CocobaseConfig(
    apiKey: 'your-api-key',
    baseUrl: 'https://api.cocobase.com', // Optional
  ),
);
```

## Query Types

### AND Queries (Default)

All conditions are ANDed together by default:

```dart
// Find active users aged 18-65
final query = QueryBuilder()
    .where('status', 'active')
    .whereGreaterThanOrEqual('age', 18)
    .whereLessThanOrEqual('age', 65);

// SQL equivalent: WHERE status = 'active' AND age >= 18 AND age <= 65
```

### Multi-Field OR

Search for the same value across multiple fields:

```dart
// Search "john" in name OR email OR username
final query = QueryBuilder()
    .searchInFields(['name', 'email', 'username'], 'john');

// Or use multiFieldOr with operator
final query2 = QueryBuilder()
    .multiFieldOr(['firstName', 'lastName'], 'Smith');

// Results in: name__or__email__or__username__contains=john
// SQL: WHERE (name ILIKE '%john%' OR email ILIKE '%john%' OR username ILIKE '%john%')
```

### Simple OR Conditions

Group conditions with OR logic using `[or]` prefix:

```dart
// Find users who are EITHER over 18 OR admins
final query = QueryBuilder()
    .orGreaterThanOrEqual('age', 18)
    .or('role', 'admin');

// Results in: [or]age__gte=18&[or]role=admin
// SQL: WHERE (age >= 18 OR role = 'admin')
```

**Mix AND + OR:**

```dart
// Active users who are EITHER premium OR verified
final query = QueryBuilder()
    .where('status', 'active')           // AND condition
    .or('isPremium', true)                // OR condition
    .or('isVerified', true);              // OR condition

// SQL: WHERE status = 'active' AND (isPremium = true OR isVerified = true)
```

### Named OR Groups

Create multiple OR groups that are ANDed together:

```dart
// (age >= 18 OR role = admin) AND (country = USA OR country = UK)
final query = QueryBuilder()
    .orGroup('age', 'age__gte', 18)
    .orGroup('age', 'role', 'admin')
    .orGroup('country', 'country', 'USA')
    .orGroup('country', 'country', 'UK');

// SQL: WHERE (age >= 18 OR role = 'admin') AND (country = 'USA' OR country = 'UK')
```

## Operators

### Comparison Operators

| Method                      | Operator | Example                               |
| --------------------------- | -------- | ------------------------------------- |
| `where()`                   | `eq`     | `.where('status', 'active')`          |
| `whereNotEqual()`           | `ne`     | `.whereNotEqual('status', 'deleted')` |
| `whereGreaterThan()`        | `gt`     | `.whereGreaterThan('age', 18)`        |
| `whereGreaterThanOrEqual()` | `gte`    | `.whereGreaterThanOrEqual('age', 18)` |
| `whereLessThan()`           | `lt`     | `.whereLessThan('age', 65)`           |
| `whereLessThanOrEqual()`    | `lte`    | `.whereLessThanOrEqual('age', 65)`    |

### String Operators

| Method              | Operator     | Example                                |
| ------------------- | ------------ | -------------------------------------- |
| `whereContains()`   | `contains`   | `.whereContains('name', 'john')`       |
| `whereStartsWith()` | `startswith` | `.whereStartsWith('email', 'admin')`   |
| `whereEndsWith()`   | `endswith`   | `.whereEndsWith('email', 'gmail.com')` |

### List Operators

| Method         | Operator | Example                                        |
| -------------- | -------- | ---------------------------------------------- |
| `whereIn()`    | `in`     | `.whereIn('role', ['admin', 'moderator'])`     |
| `whereNotIn()` | `notin`  | `.whereNotIn('status', ['deleted', 'banned'])` |

### Null Operators

| Method          | Operator | Example                           |
| --------------- | -------- | --------------------------------- |
| `whereIsNull()` | `isnull` | `.whereIsNull('deletedAt', true)` |

## Relationships (Populate)

### Basic Population

```dart
// Populate single relationship
final query = QueryBuilder()
    .where('status', 'published')
    .populate('author');

final posts = await cocobase.listDocuments('posts', queryBuilder: query);
```

### Multiple Relationships

```dart
// Populate multiple relationships
final query = QueryBuilder()
    .populate('author')
    .populate('category')
    .populate('tags');

// Or use populateAll
final query2 = QueryBuilder()
    .populateAll(['author', 'category', 'tags']);
```

### Nested Population

```dart
// Populate relationships within relationships
final query = QueryBuilder()
    .populate('post.author')        // Post -> Author
    .populate('comments.user');     // Comments -> User
```

### Filter by Relationship Fields

```dart
// Find posts by admin authors
final query = QueryBuilder()
    .where('author.role', 'admin')
    .populate('author');
```

## Field Selection

```dart
// Select specific fields
final query = QueryBuilder()
    .selectAll(['name', 'email', 'age']);

// With relationships
final query2 = QueryBuilder()
    .selectAll(['title', 'author.name', 'author.email'])
    .populate('author');
```

## Sorting & Pagination

```dart
// Sort ascending
final query = QueryBuilder()
    .where('status', 'active')
    .orderByAsc('age');

// Sort descending
final query2 = QueryBuilder()
    .orderByDesc('createdAt');

// Pagination
final query3 = QueryBuilder()
    .limit(50)
    .offset(100);

// Or use aliases
final query4 = QueryBuilder()
    .take(50)
    .skip(100);
```

## Real-World Examples

### E-commerce Product Search

```dart
// Find available products: (in stock OR pre-order) AND (on sale OR new)
final products = await cocobase.listDocuments<Map<String, dynamic>>(
  'products',
  queryBuilder: QueryBuilder()
      .orGroup('availability', 'inStock', true)
      .orGroup('availability', 'preOrder', true)
      .orGroup('promo', 'onSale', true)
      .orGroup('promo', 'isNew', true)
      .whereGreaterThanOrEqual('price', 50)
      .whereLessThanOrEqual('price', 200)
      .orderByAsc('price')
      .limit(20),
);
```

### Task Management

```dart
// (high priority OR overdue) AND (assigned to me OR unassigned)
final urgentTasks = await cocobase.listDocuments<Map<String, dynamic>>(
  'tasks',
  queryBuilder: QueryBuilder()
      .orGroup('urgency', 'priority', 'high')
      .orGroup('urgency', 'isOverdue', true)
      .orGroup('assignment', 'assignedTo', 'user123')
      .orGroup('assignment', 'assignedTo__isnull', true)
      .whereNotEqual('status', 'completed')
      .populate('assignedUser')
      .orderByDesc('priority'),
);
```

### Social Media - Popular Posts

```dart
// (likes > 100 OR comments > 50) AND recent
final popularPosts = await cocobase.listDocuments<Map<String, dynamic>>(
  'posts',
  queryBuilder: QueryBuilder()
      .orGreaterThan('likes', 100)
      .orGreaterThan('comments', 50)
      .whereGreaterThanOrEqual('createdAt', '2025-01-05')
      .where('isReported', false)
      .populate('author')
      .selectAll(['title', 'excerpt', 'author.name', 'likes'])
      .orderByDesc('likes')
      .limit(50),
);
```

## Best Practices

1. **Use meaningful OR group names**

```dart
// Good
.orGroup('availability', 'inStock', true)

// Bad
.orGroup('a', 'inStock', true)
```

2. **Prefer `whereIn` over multiple OR conditions**

```dart
// Good
.whereIn('status', ['active', 'pending', 'review'])

// Less efficient
.or('status', 'active').or('status', 'pending')
```

3. **Use field selection to reduce payload**

```dart
.selectAll(['id', 'name', 'email'])
```

4. **Limit nested populations**

```dart
// Good (2 levels)
.populate('post.author')

// Avoid (3+ levels)
.populate('comment.post.author.company')
```

## Next Steps

- [Getting Started](./getting-started) - Learn the basics
- [Usage Examples](./usage-examples) - See practical examples
- [API Reference](../api/introduction) - REST API docs
