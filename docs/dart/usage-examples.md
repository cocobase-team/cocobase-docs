---
sidebar_position: 4
title: Usage Examples
---

# Dart SDK Usage Examples

Practical examples for common use cases in Flutter and Dart applications.

## Flutter Todo App

```dart
import 'package:flutter/material.dart';
import 'package:cocobase/cocobase.dart';

class TodoList extends StatefulWidget {
  @override
  _TodoListState createState() => _TodoListState();
}

class _TodoListState extends State<TodoList> {
  final db = Cocobase(apiKey: 'your-api-key');
  List<dynamic> todos = [];
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    loadTodos();
  }

  Future<void> loadTodos() async {
    setState(() => isLoading = true);

    try {
      final result = await db.listDocuments('todos',
        orderBy: '-createdAt',
      );

      setState(() {
        todos = result;
        isLoading = false;
      });
    } catch (e) {
      print('Error loading todos: $e');
      setState(() => isLoading = false);
    }
  }

  Future<void> addTodo(String title) async {
    try {
      await db.createDocument('todos', {
        'title': title,
        'completed': false,
        'createdAt': DateTime.now().toIso8601String(),
      });

      await loadTodos();
    } catch (e) {
      print('Error adding todo: $e');
    }
  }

  Future<void> toggleTodo(String id, bool completed) async {
    try {
      await db.updateDocument('todos', id, {
        'completed': !completed,
      });

      await loadTodos();
    } catch (e) {
      print('Error toggling todo: $e');
    }
  }

  Future<void> deleteTodo(String id) async {
    try {
      await db.deleteDocument('todos', id);
      await loadTodos();
    } catch (e) {
      print('Error deleting todo: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('My Todos')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: todos.length,
              itemBuilder: (context, index) {
                final todo = todos[index];
                return ListTile(
                  leading: Checkbox(
                    value: todo.data['completed'],
                    onChanged: (_) => toggleTodo(
                      todo.id,
                      todo.data['completed'],
                    ),
                  ),
                  title: Text(todo.data['title']),
                  trailing: IconButton(
                    icon: Icon(Icons.delete),
                    onPressed: () => deleteTodo(todo.id),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context),
        child: Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context) {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add Todo'),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(hintText: 'Todo title'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                addTodo(controller.text);
                Navigator.pop(context);
              }
            },
            child: Text('Add'),
          ),
        ],
      ),
    );
  }
}
```

## User Authentication Flow

```dart
class AuthService {
  final Cocobase db;

  AuthService(this.db);

  Future<User?> login(String email, String password) async {
    try {
      final session = await db.login(
        email: email,
        password: password,
      );

      return session.user;
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }

  Future<User?> register(String email, String password, String name) async {
    try {
      final user = await db.register(
        email: email,
        password: password,
        userData: {'name': name},
      );

      return user;
    } catch (e) {
      print('Registration error: $e');
      return null;
    }
  }

  Future<void> logout() async {
    await db.logout();
  }

  Future<User?> getCurrentUser() async {
    try {
      return await db.getCurrentUser();
    } catch (e) {
      return null;
    }
  }
}
```

## Blog Post Manager

```dart
class BlogService {
  final Cocobase db;

  BlogService(this.db);

  Future<List<dynamic>> getPosts({int page = 1, int perPage = 10}) async {
    return await db.listDocuments('posts',
      where: {'published': true},
      orderBy: '-createdAt',
      limit: perPage,
      offset: (page - 1) * perPage,
    );
  }

  Future<dynamic> getPost(String id) async {
    return await db.getDocument('posts', id);
  }

  Future<dynamic> createPost(Map<String, dynamic> data) async {
    return await db.createDocument('posts', {
      ...data,
      'published': false,
      'createdAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> updatePost(String id, Map<String, dynamic> data) async {
    await db.updateDocument('posts', id, {
      ...data,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> publishPost(String id) async {
    await db.updateDocument('posts', id, {
      'published': true,
      'publishedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> deletePost(String id) async {
    await db.deleteDocument('posts', id);
  }

  Future<List<dynamic>> searchPosts(String query) async {
    return await db.listDocuments('posts',
      where: {
        'published': true,
        'title': {'\$regex': query, '\$options': 'i'},
      },
    );
  }
}
```

## State Management with Provider

```dart
import 'package:flutter/foundation.dart';
import 'package:cocobase/cocobase.dart';

class DataProvider with ChangeNotifier {
  final Cocobase db;
  List<dynamic> _items = [];
  bool _isLoading = false;
  String? _error;

  DataProvider(this.db);

  List<dynamic> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchItems() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _items = await db.listDocuments('items');
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addItem(Map<String, dynamic> data) async {
    try {
      await db.createDocument('items', data);
      await fetchItems();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> deleteItem(String id) async {
    try {
      await db.deleteDocument('items', id);
      await fetchItems();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}
```

## Next Steps

- [Python SDK](../python/introduction) - Python documentation
- [JavaScript SDK](../javascript/introduction) - JavaScript documentation
- [API Reference](../api/introduction) - REST API docs
