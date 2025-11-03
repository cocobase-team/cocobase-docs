---
sidebar_position: 5
title: Advanced Query Filtering
---

# Advanced Query Filtering - JavaScript/TypeScript SDK

Complete guide for using advanced query filtering in the COCOBASE JavaScript/TypeScript SDK.

## 🚀 Quick Start

```typescript
import { buildFilterQuery } from "coco_base_js";

// Simple query
const query = buildFilterQuery({
  filters: { status: "active", age_gte: 18 },
  limit: 50,
  offset: 0,
});
// Returns: "status=active&age_gte=18&limit=50&offset=0"
```

## 📖 Table of Contents

1. [Basic Operators](#basic-operators)
2. [Simple AND Conditions](#simple-and-conditions)
3. [Multi-Field OR](#multi-field-or)
4. [Simple OR Conditions](#simple-or-conditions)
5. [Mixed AND + OR](#mixed-and--or)
6. [Named OR Groups](#named-or-groups)
7. [Sorting & Pagination](#sorting--pagination)
8. [Real-World Examples](#real-world-examples)

## Basic Operators

All operators are used as suffixes to field names, separated by underscore.

### Comparison Operators

```typescript
// Equals (default - no suffix needed)
buildFilterQuery({ filters: { status: "active" } });
// status=active

// Not equals
buildFilterQuery({ filters: { status_ne: "deleted" } });
// status_ne=deleted

// Greater than
buildFilterQuery({ filters: { age_gt: 18 } });
// age_gt=18

// Greater than or equal
buildFilterQuery({ filters: { age_gte: 18 } });
// age_gte=18

// Less than
buildFilterQuery({ filters: { age_lt: 65 } });
// age_lt=65

// Less than or equal
buildFilterQuery({ filters: { age_lte: 65 } });
// age_lte=65
```

### String Operators

```typescript
// Contains substring (case-insensitive)
buildFilterQuery({ filters: { name_contains: "john" } });
// name_contains=john

// Starts with
buildFilterQuery({ filters: { name_startswith: "john" } });
// name_startswith=john

// Ends with
buildFilterQuery({ filters: { email_endswith: "gmail.com" } });
// email_endswith=gmail.com
```

### List Operators

```typescript
// In list (comma-separated values)
buildFilterQuery({ filters: { status_in: "active,pending,review" } });
// status_in=active,pending,review

// Not in list
buildFilterQuery({ filters: { status_notin: "deleted,banned" } });
// status_notin=deleted,banned
```

### Null Checks

```typescript
// Is null
buildFilterQuery({ filters: { deletedAt_isnull: true } });
// deletedAt_isnull=true

// Is not null
buildFilterQuery({ filters: { profilePicture_isnull: false } });
// profilePicture_isnull=false
```

## Simple AND Conditions

By default, all filter conditions are combined with AND logic.

```typescript
// Find active users aged 18-65
buildFilterQuery({
  filters: {
    status: "active",
    age_gte: 18,
    age_lte: 65,
  },
});
// status=active&age_gte=18&age_lte=65
// SQL: WHERE status = 'active' AND age >= 18 AND age <= 65
```

## Multi-Field OR

Search for the same value across multiple fields using `field1__or__field2` syntax.

```typescript
// Search "john" in name OR email
buildFilterQuery({
  filters: {
    name__or__email_contains: "john",
  },
});
// SQL: WHERE (name ILIKE '%john%' OR email ILIKE '%john%')

// Search in 3 fields
buildFilterQuery({
  filters: {
    name__or__username__or__email_contains: "admin",
  },
});
```

## Simple OR Conditions

Use `[or]` prefix to group multiple conditions with OR logic.

```typescript
// Find users who are EITHER over 18 OR admins
buildFilterQuery({
  filters: {
    "[or]age_gte": 18,
    "[or]role": "admin",
  },
});
// SQL: WHERE (age >= 18 OR role = 'admin')
```

## Mixed AND + OR

Combine AND and OR logic. OR conditions are grouped together and ANDed with other filters.

```typescript
// Find active users who are EITHER premium OR verified
buildFilterQuery({
  filters: {
    status: "active",
    "[or]isPremium": true,
    "[or]isVerified": true,
  },
});
// SQL: WHERE status = 'active' AND (isPremium = true OR isVerified = true)
```

## Named OR Groups

Create multiple independent OR groups using `[or:groupname]` syntax.

```typescript
// (age >= 18 OR role = admin) AND (country = USA OR country = UK)
buildFilterQuery({
  filters: {
    "[or:age]age_gte": 18,
    "[or:age]role": "admin",
    "[or:country]country": "USA",
    "[or:country]country": "UK",
  },
});
```

## Sorting & Pagination

Control result ordering and pagination.

```typescript
// Sort by age ascending
buildFilterQuery({
  filters: { status: "active" },
  sort: "age",
  order: "asc",
});

// Paginate results (20 per page, page 3)
buildFilterQuery({
  filters: { status: "active" },
  limit: 20,
  offset: 40, // (page - 1) * limit
});
```

## Real-World Examples

### E-commerce Product Search

```typescript
const query = buildFilterQuery({
  filters: {
    "[or:availability]inStock": true,
    "[or:availability]preOrder": true,
    "[or:promo]onSale": true,
    "[or:promo]isNew": true,
    price_gte: 50,
    price_lte: 200,
    category: "electronics",
  },
  sort: "price",
  order: "asc",
  limit: 50,
});
```

### User Management - Find Risky Users

```typescript
const query = buildFilterQuery({
  filters: {
    "[or]failedLogins_gte": 5,
    "[or]suspiciousActivity": true,
    status_ne: "banned",
    lastLogin_lt: "2025-10-01",
  },
  sort: "lastLogin",
  order: "desc",
});
```

### Social Media - Popular Posts

```typescript
const query = buildFilterQuery({
  filters: {
    "[or]likes_gt": 100,
    "[or]comments_gt": 50,
    createdAt_gte: "2025-10-01",
    isReported: false,
    isPublic: true,
  },
  sort: "likes",
  order: "desc",
  limit: 50,
});
```

## Integration with Collections

Use query building with your collection queries:

```typescript
import { buildFilterQuery } from "coco_base_js";

// Build query
const queryString = buildFilterQuery({
  filters: {
    status: "active",
    "[or]isPremium": true,
    "[or]isVerified": true,
  },
  sort: "createdAt",
  order: "desc",
  limit: 50,
});

// Use with your API
const response = await fetch(
  `${baseUrl}/collections/users/documents?${queryString}`
);
const data = await response.json();
```

## Next Steps

- [Relationships & Population](./relationships) - Work with related documents
- [Examples](../examples/sample-project) - See complete project examples
