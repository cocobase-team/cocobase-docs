---
sidebar_position: 2
title: Installation
---

# Installation

Learn how to install the Cocobase Dart SDK in your Flutter or Dart project.

## Prerequisites

- Dart SDK 2.17.0 or higher
- Flutter 3.0.0 or higher (for Flutter projects)

## Installation

Add Cocobase to your `pubspec.yaml` file:

```yaml
dependencies:
  cocobase: ^1.0.0
```

Then run:

```bash
flutter pub get
# or for Dart projects
dart pub get
```

## Quick Start

```dart
import 'package:cocobase/cocobase.dart';

void main() async {
  // Initialize Cocobase
  final db = Cocobase(apiKey: 'your-api-key');

  // Create a document
  final user = await db.createDocument('users', {
    'name': 'John Doe',
    'email': 'john@example.com',
  });

  print('Created user: ${user.id}');

  // List documents
  final users = await db.listDocuments('users');
  print('Total users: ${users.length}');
}
```

## Flutter Integration

For Flutter projects, you can initialize Cocobase in your main app:

```dart
import 'package:flutter/material.dart';
import 'package:cocobase/cocobase.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  final db = Cocobase(apiKey: 'your-api-key');

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cocobase Demo',
      home: HomeScreen(db: db),
    );
  }
}
```

## Next Steps

- [Getting Started](./getting-started) - Learn the basics
- [Usage Examples](./usage-examples) - See practical examples
