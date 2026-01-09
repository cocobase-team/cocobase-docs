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

Add the CocoBase SDK and its peer dependencies to your Flutter project. The SDK requires `dio` for HTTP requests, `web_socket_channel` for real-time features, and `shared_preferences` for local storage.

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

Install all the packages you've added:

```bash
flutter pub get
```

### 3. Verify Installation

Test that the SDK is properly installed by importing it in your code:

```dart
import 'package:coco_base_flutter/coco_base_flutter.dart';

void main() {
  print('CocoBase SDK loaded!');
}
```

If this runs without errors, you're all set!

---

## Basic Setup

### Initialize CocoBase

Before making any requests, create a `Cocobase` instance with your API credentials:

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

The `db` object is your main interface for all database operations.

### Get Your API Key

1. Go to [CocoBase Dashboard](https://app.cocobase.buzz)
2. Navigate to **Settings → API Keys**
3. Create a new API key or copy an existing one
4. Keep it safe! Never commit it to version control

---

## First Request

### List All Documents

The simplest way to get started is to retrieve all documents from a collection:

```dart
// List all books
final books = await db.listDocuments("books");

print('Found ${books.length} books');
for (var doc in books) {
  print('ID: ${doc.id}');
  print('Data: ${doc.data}');
}
```

This returns a list of `CocoDocument` objects, each containing an `id` and `data` (as a Map).

### Filter Documents

Narrow down results by passing a `filters` map with field-value pairs:

```dart
// Find published books
final publishedBooks = await db.listDocuments("books", filters: {
  'status': 'published'
});

print('Published books: ${publishedBooks.length}');
```

Only documents where `status` equals `'published'` will be returned.

### With Type Safety

For better code safety and IDE autocomplete, create a Dart model class:

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

The `fromJson` factory method tells CocoBase how to convert raw JSON data into your typed `Book` objects.

Register the converter once at app startup:

```dart
// In your main() or app initialization
CocobaseConverters.register<Book>(Book.fromJson);
```

This global registration allows you to use type parameters without passing converters every time.

Now you can use type parameters everywhere without passing the converter manually:

```dart
// No converter parameter needed!
final books = await db.listDocuments<Book>("books");

print('First book: ${books[0].data.title}');
print('Author: ${books[0].data.author}');
```

The `<Book>` type parameter automatically converts each document's data to a `Book` instance, giving you full autocomplete and type checking.

---

## Common Operations

### Create a Document

Add a new document to a collection by passing your data object:

```dart
final newBook = Book(
  title: 'Clean Code',
  author: 'Robert Martin',
  price: 45.99,
);

final created = await db.createDocument<Book>("books", newBook);
print('Created with ID: ${created.id}');
```

CocoBase generates a unique ID and returns the complete document including metadata like `createdAt`.

### Get a Specific Document

Retrieve a single document by its ID:

```dart
final book = await db.getDocument<Book>("books", "doc-id");
print('Title: ${book.data.title}');
```

Replace `"doc-id"` with the actual document ID you want to fetch.

### Update a Document

Modify specific fields in an existing document:

```dart
await db.updateDocument("books", "doc-id", {
  'status': 'archived',
  'price': 29.99,
});
```

Only the fields you specify will be updated; other fields remain unchanged.

### Delete a Document

Permanently remove a document from a collection:

```dart
await db.deleteDocument("books", "doc-id");
```

This action cannot be undone, so use with caution.

---

## Error Handling

Always wrap database requests in try-catch blocks to handle network failures and other errors gracefully:

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

The `DioException` specifically catches HTTP/network errors, while the general `catch` handles all other exceptions.

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
