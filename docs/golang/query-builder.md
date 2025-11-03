---
sidebar_position: 7
title: Query Builder
---

# Query Builder

The Cocobase Query Builder provides an intuitive, fluent API for constructing complex database queries. This guide covers all query capabilities.

## Table of Contents

- [Basic Concepts](#basic-concepts)
- [Comparison Operators](#comparison-operators)
- [String Operations](#string-operations)
- [List Operations](#list-operations)
- [Boolean Logic](#boolean-logic)
- [Pagination](#pagination)
- [Sorting](#sorting)
- [Helper Methods](#helper-methods)
- [Complex Queries](#complex-queries)

## Basic Concepts

### Creating a Query

```go
query := cocobase.NewQuery()
```

### Building and Executing

```go
// Build the query
query := cocobase.NewQuery().
    Where("status", "active").
    Limit(10)

// Execute it
docs, err := client.ListDocuments(ctx, "users", query)
```

### Query Model

The QueryBuilder uses a fluent interface where methods return `*QueryBuilder`, allowing method chaining:

```go
query := cocobase.NewQuery().
    Where("field1", "value1").
    GreaterThan("field2", 100).
    Limit(50)
```

## Comparison Operators

### Equality

```go
// Basic equality (field = value)
query := cocobase.NewQuery().Where("status", "active")

// Alternative
query := cocobase.NewQuery().Equals("status", "active")
```

### Not Equals

```go
// field != value
query := cocobase.NewQuery().NotEquals("status", "banned")
```

### Greater Than

```go
// field > value
query := cocobase.NewQuery().GreaterThan("age", 18)
```

### Greater Than or Equal

```go
// field >= value
query := cocobase.NewQuery().GreaterThanOrEqual("age", 18)
```

### Less Than

```go
// field < value
query := cocobase.NewQuery().LessThan("age", 65)
```

### Less Than or Equal

```go
// field <= value
query := cocobase.NewQuery().LessThanOrEqual("price", 100)
```

### Between (Range)

```go
// field >= min AND field <= max
query := cocobase.NewQuery().Between("age", 18, 65)

// Equivalent to:
query := cocobase.NewQuery().
    GreaterThanOrEqual("age", 18).
    LessThanOrEqual("age", 65)
```

### Examples

```go
// Find adults
query := cocobase.NewQuery().GreaterThanOrEqual("age", 18)

// Find affordable items
query := cocobase.NewQuery().LessThanOrEqual("price", 100)

// Find users in age range
query := cocobase.NewQuery().Between("age", 25, 40)

// Find non-admin users
query := cocobase.NewQuery().NotEquals("role", "admin")
```

## String Operations

### Contains (Substring Search)

```go
// Case-insensitive substring search
query := cocobase.NewQuery().Contains("name", "john")

// Finds: "John", "Johnny", "john doe", etc.
```

### Starts With

```go
// Field starts with prefix
query := cocobase.NewQuery().StartsWith("email", "admin")

// Finds: "admin@example.com", "admin.user@test.com"
```

### Ends With

```go
// Field ends with suffix
query := cocobase.NewQuery().EndsWith("email", "gmail.com")

// Finds: "user@gmail.com", "test.user@gmail.com"
```

### Multi-Field Search

```go
// Search for a term across multiple fields
query := cocobase.NewQuery().Search("john", "name", "email", "username")

// Searches for "john" in name OR email OR username
```

### Examples

```go
// Find Gmail users
query := cocobase.NewQuery().EndsWith("email", "gmail.com")

// Find users with "admin" in name
query := cocobase.NewQuery().Contains("name", "admin")

// Find usernames starting with "test"
query := cocobase.NewQuery().StartsWith("username", "test")

// Search across multiple fields
query := cocobase.NewQuery().Search("support", "name", "email", "role")
```

## List Operations

### In (Match Any)

```go
// field IN (value1, value2, ...)
query := cocobase.NewQuery().In("role", "admin", "moderator", "support")

// Finds users with any of these roles
```

### Not In (Exclude)

```go
// field NOT IN (value1, value2, ...)
query := cocobase.NewQuery().NotIn("status", "banned", "deleted", "suspended")

// Finds users without these statuses
```

### Examples

```go
// Find staff members
query := cocobase.NewQuery().In("role", "admin", "moderator", "support")

// Find active users (exclude problematic statuses)
query := cocobase.NewQuery().NotIn("status", "banned", "suspended", "deleted")

// Find specific priority items
query := cocobase.NewQuery().In("priority", "high", "critical")
```

## Null Checks

### Is Null

```go
// Check if field is null
query := cocobase.NewQuery().IsNull("deletedAt")

// Finds documents where deletedAt is null
```

### Is Not Null

```go
// Check if field is not null
query := cocobase.NewQuery().IsNotNull("profilePicture")

// Finds documents where profilePicture exists
```

### Examples

```go
// Find active (non-deleted) records
query := cocobase.NewQuery().IsNull("deletedAt")

// Find users with profile pictures
query := cocobase.NewQuery().IsNotNull("profilePicture")

// Find completed tasks
query := cocobase.NewQuery().IsNotNull("completedAt")
```

## Boolean Logic

### Simple OR Conditions

```go
// Active OR Premium users
query := cocobase.NewQuery().
    Or().
        Where("status", "active").
        Where("isPremium", true).
    Done()
```

### Mixing AND and OR

```go
// Active AND (Premium OR Verified)
query := cocobase.NewQuery().
    Where("status", "active").        // AND condition
    Or().                              // Start OR group
        Where("isPremium", true).
        Where("isVerified", true).
    Done()
```

### Named OR Groups

For complex queries with multiple OR groups:

```go
// (Premium OR Verified) AND (US OR UK)
query := cocobase.NewQuery().
    OrGroup("tier").
        Where("isPremium", true).
        Where("isVerified", true).
    Done().
    OrGroup("location").
        Where("country", "US").
        Where("country", "UK").
    Done()
```

### OR Builder Methods

The OR builder supports all comparison operators:

```go
query := cocobase.NewQuery().
    Or().
        Where("role", "admin").
        Equals("role", "moderator").
        GreaterThan("score", 100).
        Contains("email", "vip").
        IsNull("bannedAt").
    Done()
```

### Examples

```go
// Find users who are either premium or verified
query := cocobase.NewQuery().
    Or().
        Where("isPremium", true).
        Where("isVerified", true).
    Done()

// Find high-priority or overdue tasks
query := cocobase.NewQuery().
    Where("status", "open").
    Or().
        Equals("priority", "high").
        Where("isOverdue", true).
    Done()

// Complex: (Admin OR Moderator) AND (Active AND Age >= 18)
query := cocobase.NewQuery().
    Where("status", "active").
    GreaterThanOrEqual("age", 18).
    Or().
        Equals("role", "admin").
        Equals("role", "moderator").
    Done()

// Multiple OR groups
query := cocobase.NewQuery().
    OrGroup("tier").
        Where("isPremium", true).
        GreaterThan("loyaltyPoints", 1000).
    Done().
    OrGroup("location").
        Where("country", "US").
        Where("country", "CA").
        Where("country", "UK").
    Done()
```

## Pagination

### Limit

```go
// Limit number of results
query := cocobase.NewQuery().Limit(10)
```

### Offset

```go
// Skip first N results
query := cocobase.NewQuery().Offset(20)
```

### Page-Based Pagination

```go
// Get page 2 with 20 items per page
query := cocobase.NewQuery().Page(2, 20)

// Equivalent to:
query := cocobase.NewQuery().
    Limit(20).
    Offset(20)
```

### Examples

```go
// First 10 results
query := cocobase.NewQuery().Limit(10)

// Skip first 20, get next 10
query := cocobase.NewQuery().
    Limit(10).
    Offset(20)

// Page 3 with 25 items per page
query := cocobase.NewQuery().Page(3, 25)

// Efficient pagination pattern
func getPage(client *cocobase.Client, page, perPage int) ([]cocobase.Document, error) {
    query := cocobase.NewQuery().
        Where("status", "active").
        Page(page, perPage).
        Recent()

    return client.ListDocuments(ctx, "users", query)
}
```

## Sorting

### Order By (Ascending)

```go
// Sort by field (ascending)
query := cocobase.NewQuery().OrderBy("created_at")

// Alternative
query := cocobase.NewQuery().OrderByAsc("created_at")
```

### Order By Descending

```go
// Sort by field (descending)
query := cocobase.NewQuery().OrderByDesc("created_at")
```

### Chaining Order

```go
// Set field, then order
query := cocobase.NewQuery().
    OrderBy("created_at").
    Desc()
```

### Examples

```go
// Newest first
query := cocobase.NewQuery().OrderByDesc("created_at")

// Alphabetical by name
query := cocobase.NewQuery().OrderByAsc("name")

// Highest price first
query := cocobase.NewQuery().OrderByDesc("price")

// Most popular items
query := cocobase.NewQuery().
    OrderByDesc("views").
    Limit(10)
```

## Helper Methods

### Active (Non-Deleted Records)

```go
// Shortcut for IsNull("deletedAt")
query := cocobase.NewQuery().Active()
```

### Deleted Records

```go
// Shortcut for IsNotNull("deletedAt")
query := cocobase.NewQuery().Deleted()
```

### Recent (Newest First)

```go
// Shortcut for OrderByDesc("created_at")
query := cocobase.NewQuery().Recent()
```

### Oldest (Oldest First)

```go
// Shortcut for OrderByAsc("created_at")
query := cocobase.NewQuery().Oldest()
```

### Examples

```go
// Get 10 most recent active users
query := cocobase.NewQuery().
    Active().
    Recent().
    Limit(10)

// Get oldest deleted records
query := cocobase.NewQuery().
    Deleted().
    Oldest()
```

## Complex Queries

### E-Commerce: Available Products on Sale

```go
query := cocobase.NewQuery().
    Where("inStock", true).
    Where("onSale", true).
    Between("price", 10, 100).
    Active().
    OrderBy("price").
    Limit(50)
```

### Social Media: Popular Recent Posts

```go
query := cocobase.NewQuery().
    Recent().
    Or().
        GreaterThan("likes", 100).
        GreaterThan("shares", 50).
    Done().
    Active().
    Limit(20)
```

### User Management: Risky Accounts

```go
query := cocobase.NewQuery().
    Or().
        GreaterThanOrEqual("failedLogins", 5).
        Where("suspiciousActivity", true).
        IsNotNull("reportedAt").
    Done().
    NotEquals("status", "banned").
    Recent()
```

### Task Management: My Urgent Tasks

```go
query := cocobase.NewQuery().
    Where("assignedTo", userID).
    NotIn("status", "completed", "cancelled", "archived").
    Or().
        Equals("priority", "high").
        Where("isOverdue", true).
    Done().
    OrderByDesc("priority").
    Limit(50)
```

### Content Moderation: Flagged Content

```go
query := cocobase.NewQuery().
    Where("status", "pending_review").
    Or().
        GreaterThanOrEqual("reportCount", 3).
        Contains("content", "spam").
        Where("autoFlagged", true).
    Done().
    Recent().
    Limit(100)
```

### Analytics: Active Premium Users

```go
query := cocobase.NewQuery().
    Where("isPremium", true).
    Where("status", "active").
    GreaterThanOrEqual("lastLoginAt", "2025-01-01").
    Active().
    OrderByDesc("lastLoginAt")
```

### Support Tickets: VIP or High Priority

```go
query := cocobase.NewQuery().
    In("status", "open", "pending", "escalated").
    OrGroup("priority").
        Where("customerTier", "vip").
        Equals("priority", "high").
        Equals("priority", "critical").
    Done().
    Recent()
```

### Inventory: Low Stock Alerts

```go
query := cocobase.NewQuery().
    Or().
        LessThanOrEqual("stock", 10).
        Equals("stock", 0).
    Done().
    Where("discontinued", false).
    Active().
    OrderBy("stock")
```

## Query String Output

You can build the query string without executing it:

```go
query := cocobase.NewQuery().
    Where("status", "active").
    GreaterThan("age", 18).
    Limit(10)

queryString := query.Build()
fmt.Println(queryString)
// Output: status=active&age_gt=18&limit=10
```

## Best Practices

### 1. Chain Related Conditions

```go
// Good: Clear and readable
query := cocobase.NewQuery().
    Where("status", "active").
    GreaterThanOrEqual("age", 18).
    Recent().
    Limit(50)
```

### 2. Use Named OR Groups for Complex Logic

```go
// Good: Clear separation of concerns
query := cocobase.NewQuery().
    OrGroup("eligibility").
        Where("isVerified", true).
        GreaterThan("accountAge", 30).
    Done().
    OrGroup("location").
        Where("country", "US").
        Where("country", "CA").
    Done()
```

### 3. Use Helper Methods

```go
// Good: Use helpers for common patterns
query := cocobase.NewQuery().Active().Recent()

// Instead of:
query := cocobase.NewQuery().
    IsNull("deletedAt").
    OrderByDesc("created_at")
```

### 4. Set Reasonable Limits

```go
// Good: Prevent loading too much data
query := cocobase.NewQuery().
    Where("status", "active").
    Limit(100)  // Reasonable limit
```

### 5. Order Results for Consistency

```go
// Good: Consistent ordering
query := cocobase.NewQuery().
    Where("status", "active").
    OrderBy("id")  // Stable sort order
```

---

**Previous**: [Document Operations](./document-operations.md) | **Next**: [Authentication](./authentication.md) →
