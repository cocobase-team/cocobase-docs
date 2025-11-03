---
sidebar_position: 4
title: CRUD Operations
---

# CRUD Operations

Master data management with Cocobase's intuitive CRUD (Create, Read, Update, Delete) operations. This guide covers everything from basic operations to advanced querying and real-time updates.

## Basic CRUD Operations

### Creating Documents

The `createDocument` method adds new documents to your collections:

```typescript
import db from "../lib/cocobase";

// Create a simple document
const user = await db.createDocument("users", {
  name: "John Doe",
  email: "john@example.com",
  age: 30,
});

console.log(user.id); // Auto-generated document ID
```

### Reading Documents

#### Get Single Document

```typescript
// Get document by ID
const user = await db.getDocument("users", "user-id-123");

if (user) {
  console.log(user.name);
} else {
  console.log("User not found");
}
```

#### List All Documents

```typescript
// Get all documents in a collection
const allUsers = await db.listDocuments("users");

console.log(`Found ${allUsers.length} users`);
allUsers.forEach((user) => console.log(user.name));
```

#### With Pagination

```typescript
// Paginated results
const result = await db.listDocuments("posts", {
  limit: 10,
  offset: 0,
});

console.log(`Page 1: ${result.documents.length} posts`);

// Get next page
const nextPage = await db.listDocuments("posts", {
  limit: 10,
  offset: 10,
});
```

### Updating Documents

#### Full Update

```typescript
// Replace entire document
const updatedUser = await db.updateDocument("users", "user-id-123", {
  name: "Jane Doe",
  email: "jane@example.com",
  age: 28,
  lastLogin: new Date(),
});
```

#### Partial Update

If fields that do not exist in the model are added to the request they will be added as well.And fields that exist already will be updated.Fields that are not included will remain the same.

```typescript
// Update only specific fields
const updatedUser = await db.updateDocument("users", "user-id-123", {
  lastLogin: new Date(),
  loginCount: 5,
});
```

### Deleting Documents

#### Delete Single Document

```typescript
// Delete a document
await db.deleteDocument("users", "user-id-123");
```

## Advanced Querying

### Filtering

#### Basic Filters

```typescript
// Simple equality filter
const activeUsers = await db.listDocuments("users", {
  filters: {
    status: "active",
  },
});

// Multiple filters (AND operation)

// To use the [ db.user?.id] the user has to be authenticated.
// Confirm a user is authenticated by running [db.isAuthenticated()]
const recentPosts = await db.listDocuments("posts", {
  filters: {
    published: true,
    author: db.user?.id,
  },
});
```

#### Advanced Queries

To check if a field contains a certain block of text prefix the field name with '\_contains' in the filter object.

```typescript
// Array contains
const jsDevs = await db.listDocuments("users", {
  filters: {
    skills_contains: "javascript",
  },
});
```

Multiple conditions in your filters will be treated as an AND query and will only returns documents that match all the given conditions.

```typescript
// User is above 18 and is a graduate
// _gte used to check for Greater Than, only use this for number fields
const youngGraduates = await db.listDocuments("users", {
  filters: {
    age_gte: 18,
    graduate: true,
  },
});
```

⚙️ **Filter Operators Reference**

| Operator | Example               | Description                      |
| -------- | --------------------- | -------------------------------- |
| eq       | `name: "John"`        | Exact match                      |
| contains | `name_contains: "jo"` | Case-insensitive substring match |
| gt       | `age_gt: 30`          | Greater than                     |
| gte      | `age_gte: 30`         | Greater than or equal            |
| lt       | `age_lt: 50`          | Less than                        |
| lte      | `age_lte: 50`         | Less than or equal               |

🧠 Combine multiple filters to form AND queries.

## Real-time Subscriptions

Cocobase provides robust real-time capabilities, allowing you to listen for changes in your collections as they happen. Use the `watchCollection` method to receive live updates whenever documents are created, updated, or deleted in a collection. You can also close real-time connections by name using `closeConnection`.

### Listen to Collection Changes

```typescript
/**
 * watchCollection(
 *   collection: string,
 *   callback: (event: { event: string; data: Document<any> }) => void,
 *   connectionName?: string,
 *   onOpen?: () => void,
 *   onError?: () => void
 * ): Connection
 */

// Example: Watch a collection for real-time changes
const connection = db.watchCollection(
  "posts",
  (event) => {
    console.log(`Event: ${event.event}`);
    console.log("Changed document:", event.data);
  },
  "posts-connection", // Optional connection name
  () => {
    console.log("WebSocket connection established!");
  },
  (err) => {
    console.error("WebSocket error", err);
  }
);

// To close the connection later:
db.closeConnection("posts-connection");
```

**Parameters:**

- `collection` (string): The name of the collection to watch.
- `callback` (function): Called with an object containing the event type (`create`, `update`, or `delete`) and the changed document data.
- `connectionName` (string, optional): A custom name for the connection, useful for managing multiple connections.
- `onOpen` (function, optional): Called when the WebSocket connection is established.
- `onError` (function, optional): Called if there is a WebSocket error.

**Closing Connections:**
To close a real-time connection, call `db.closeConnection(name)` with the connection name you provided to `watchCollection`.

## TypeScript Integration

### Typed Collections

```typescript
// Define your data types
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  role: "admin" | "user" | "moderator";
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Use generic types for type safety
const users = db.collection<User>("users");
const posts = db.collection<Post>("posts");

// Now you get full type safety
const user = await users.create({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  role: "user",
  skills: ["javascript", "react"],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// TypeScript will catch errors
const invalidUser = await users.create({
  name: "Jane",
  email: "jane@example.com",
  age: "thirty", // Error: Type 'string' is not assignable to type 'number'
  role: "superuser", // Error: Type 'superuser' is not assignable to type 'admin' | 'user' | 'moderator'
});
```
