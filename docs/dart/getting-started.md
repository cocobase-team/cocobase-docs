---
sidebar_position: 3
title: Getting Started
---

# Getting Started with Dart SDK

Learn the basics of using Cocobase in your Dart or Flutter application.

## Initialize the Client

```dart
import 'package:cocobase/cocobase.dart';

final db = Cocobase(
  apiKey: 'your-api-key',
  // Optional configuration
  baseUrl: 'https://api.cocobase.buzz',
  timeout: Duration(seconds: 30),
);
```

## Authentication

### Register a User

```dart
try {
  final user = await db.register(
    email: 'user@example.com',
    password: 'securePassword123',
    userData: {
      'name': 'John Doe',
      'role': 'user',
    },
  );

  print('User registered: ${user.email}');
} catch (e) {
  print('Registration failed: $e');
}
```

### Login

```dart
try {
  final session = await db.login(
    email: 'user@example.com',
    password: 'securePassword123',
  );

  print('Login successful! Token: ${session.token}');
} catch (e) {
  print('Login failed: $e');
}
```

### Logout

```dart
await db.logout();
print('User logged out');
```

## Working with Documents

### Create a Document

```dart
final post = await db.createDocument('posts', {
  'title': 'My First Post',
  'content': 'Hello, Cocobase!',
  'published': true,
  'tags': ['flutter', 'dart'],
  'createdAt': DateTime.now().toIso8601String(),
});

print('Created post: ${post.id}');
```

### Get a Document

```dart
final post = await db.getDocument('posts', postId);
print('Post title: ${post.data['title']}');
```

### Update a Document

```dart
await db.updateDocument('posts', postId, {
  'title': 'Updated Title',
  'updatedAt': DateTime.now().toIso8601String(),
});

print('Post updated');
```

### Delete a Document

```dart
await db.deleteDocument('posts', postId);
print('Post deleted');
```

### List Documents

```dart
final posts = await db.listDocuments('posts');

for (var post in posts) {
  print('${post.id}: ${post.data['title']}');
}
```

## Querying Documents

### Filter Documents

```dart
final publishedPosts = await db.listDocuments('posts',
  where: {'published': true},
);
```

### Sort Documents

```dart
final latestPosts = await db.listDocuments('posts',
  orderBy: '-createdAt',
  limit: 10,
);
```

### Pagination

```dart
final page1 = await db.listDocuments('posts',
  limit: 10,
  offset: 0,
);

final page2 = await db.listDocuments('posts',
  limit: 10,
  offset: 10,
);
```

## Error Handling

```dart
import 'package:cocobase/cocobase.dart';

try {
  final user = await db.getDocument('users', userId);
  print(user.data);
} on CocobaseAuthException catch (e) {
  print('Authentication error: ${e.message}');
} on CocobaseNotFoundException catch (e) {
  print('Document not found: ${e.message}');
} on CocobaseException catch (e) {
  print('Cocobase error: ${e.message}');
} catch (e) {
  print('Unknown error: $e');
}
```

## Next Steps

- [Usage Examples](./usage-examples) - See complete Flutter examples
- [API Reference](../api/introduction) - REST API documentation
