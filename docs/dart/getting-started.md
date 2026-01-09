---
sidebar_position: 3
title: Getting Started
---

# CocoBase Flutter SDK - Getting Started Guide

Welcome to the CocoBase Flutter SDK! This guide will help you get up and running in minutes.

## Table of Contents

1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [First Request](#first-request)
4. [Next Steps](#next-steps)

---

## Installation

### 1. Add to Your `pubspec.yaml`

```yaml
dependencies:
  flutter:
    sdk: flutter
  coco_base_flutter: ^1.0.0
  dio: ^5.2.1
  web_socket_channel: ^2.4.0
  shared_preferences: ^2.0.18
```

### 2. Run Dependencies

```bash
flutter pub get
```

### 3. Verify Installation

```dart
import 'package:coco_base_flutter/coco_base_flutter.dart';

void main() {
  print('CocoBase SDK loaded!');
}
```

---

## Basic Setup

### Initialize CocoBase

```dart
import 'package:coco_base_flutter/coco_base_flutter.dart';

void main() async {
  // Create a configuration
  final config = CocobaseConfig(
    apiKey: "YOUR_API_KEY_HERE",
    baseUrl: "https://api.cocobase.buzz", // Optional, defaults to this
  );

  // Initialize the database client
  final db = Cocobase(config);

  // Ready to use!
  print('Connected to CocoBase');
}
```

### Get Your API Key

1. Go to [CocoBase Dashboard](https://app.cocobase.buzz)
2. Navigate to **Settings → API Keys**
3. Create a new API key or copy an existing one
4. Keep it safe! Never commit it to version control

---

## First Request

### List All Documents

The simplest way to get started:

```dart
// List all books
final books = await db.listDocuments("books");

print('Found ${books.length} books');
for (var doc in books) {
  print('ID: ${doc.id}');
  print('Data: ${doc.data}');
}
```

### Filter Documents

Using a simple filter map:

```dart
// Find published books
final publishedBooks = await db.listDocuments("books", filters: {
  'status': 'published'
});

print('Published books: ${publishedBooks.length}');
```

### With Type Safety

Define your model:

```dart
class Book {
  final String title;
  final String author;
  final double price;

  Book({
    required this.title,
    required this.author,
    required this.price,
  });

  // Critical: fromJson factory for type conversion
  factory Book.fromJson(Map<String, dynamic> json) {
    return Book(
      title: json['title'] as String,
      author: json['author'] as String,
      price: (json['price'] as num).toDouble(),
    );
  }
}
```

Register the converter once:

```dart
// In your main() or app initialization
CocobaseConverters.register<Book>(Book.fromJson);
```

Now use it everywhere without passing converter:

```dart
// No converter parameter needed!
final books = await db.listDocuments<Book>("books");

print('First book: ${books[0].data.title}');
print('Author: ${books[0].data.author}');
```

---

## Common Operations

### Create a Document

```dart
final newBook = Book(
  title: 'Clean Code',
  author: 'Robert Martin',
  price: 45.99,
);

final created = await db.createDocument<Book>("books", newBook);
print('Created with ID: ${created.id}');
```

### Get a Specific Document

```dart
final book = await db.getDocument<Book>("books", "doc-id");
print('Title: ${book.data.title}');
```

### Update a Document

```dart
await db.updateDocument("books", "doc-id", {
  'status': 'archived',
  'price': 29.99,
});
```

### Delete a Document

```dart
await db.deleteDocument("books", "doc-id");
```

---

## Error Handling

Always wrap requests in try-catch:

```dart
try {
  final books = await db.listDocuments<Book>("books");
  print('Success: ${books.length} books');
} on DioException catch (e) {
  print('Network error: ${e.message}');
} catch (e) {
  print('Error: $e');
}
```

---

## Key Concepts

| Concept            | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| **Document**       | A single record in a collection (has `id`, `data`, `createdAt`, `updatedAt`) |
| **Collection**     | A table-like structure containing many documents                             |
| **Type Parameter** | The `<T>` in `listDocuments<Book>()` specifies the data type                 |
| **Converter**      | A function like `Book.fromJson()` that converts JSON to your type            |
| **QueryBuilder**   | A fluent API for building complex queries                                    |
| **Filter Map**     | A simple `Map<String, dynamic>` for easy filtering                           |

---

## Next Steps

- **[Querying Data](01-QUERYING_DATA.md)** - Learn QueryBuilder and filters
- **[Type Conversion](02-TYPE_CONVERSION.md)** - Master type-safe documents
- **[Collections](03-COLLECTIONS.md)** - Create and manage collections
- **[Authentication](04-AUTHENTICATION.md)** - User login and registration
- **[Real-Time Data](05-REAL_TIME_DATA.md)** - Watch collections for changes
- **[Advanced Features](06-ADVANCED_FEATURES.md)** - Batch ops, aggregations, etc.

---

## Troubleshooting

### "API key is invalid"

- Check that your API key is correct
- Ensure it's not missing from the config

### "Collection not found"

- Verify the collection name exists
- Check spelling (case-sensitive)

### "Type mismatch"

- Ensure your `Book.fromJson()` matches your API response
- Check that field names match

### Need Help?

- See [Common Issues](09-COMMON_ISSUES.md)
- Check [Examples](10-EXAMPLES.md)
- Read [API Reference](11-API_REFERENCE.md)

---

**Next:** [Querying Data →](01-QUERYING_DATA.md)
