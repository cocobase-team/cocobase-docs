# Dart SDK

The CocoBASE Dart SDK provides a comprehensive Flutter/Dart client for interacting with your CocoBASE backend. Build powerful mobile and web applications with real-time capabilities, authentication, and seamless database operations.

## Installation

Add the CocoBASE SDK to your `pubspec.yaml`:

```yaml
dependencies:
  cocobase: ^1.0.0
  dio: ^5.0.0
  web_socket_channel: ^2.4.0
  shared_preferences: ^2.0.0
```

Then run:

```bash
flutter pub get
```

## Quick Start

### Initialize CocoBASE

```dart
import 'package:cocobase/cocobase.dart';

void main() {
  final cocobase = Cocobase(CocobaseConfig(
    apiKey: 'your-api-key-here',
  ));
  
  runApp(MyApp(cocobase: cocobase));
}
```

### Basic Usage

```dart
class MyApp extends StatelessWidget {
  final Cocobase cocobase;
  
  const MyApp({Key? key, required this.cocobase}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HomePage(cocobase: cocobase),
    );
  }
}
```

## Configuration

### CocobaseConfig

```dart
final config = CocobaseConfig(
  apiKey: 'your-api-key-here',
);

final cocobase = Cocobase(config);
```

The SDK automatically connects to `https://api.cocobase.com` and handles:
- Request timeout configuration (5s connect, 3s receive)
- Automatic API key injection in headers
- JSON content-type headers
- Bearer token authentication

## Database Operations

### Document Management

#### Create Document

```dart
// Create a user document
final newUser = await cocobase.createDocument<Map<String, dynamic>>(
  'users',
  {
    'name': 'John Doe',
    'email': 'john@example.com',
    'age': 30,
    'roles': ['user'],
  },
);

print('Created user: ${newUser.id}');
print('User data: ${newUser.data}');
```

#### Get Single Document

```dart
// Fetch a specific document
try {
  final user = await cocobase.getDocument<Map<String, dynamic>>(
    'users',
    'document-id-here',
  );
  
  print('User: ${user.data['name']}');
  print('Created: ${user.createdAt}');
} catch (e) {
  print('Document not found: $e');
}
```

#### Update Document

```dart
// Update a document
final updatedUser = await cocobase.updateDocument<Map<String, dynamic>>(
  'users',
  'document-id-here',
  {
    'name': 'Jane Doe',
    'age': 31,
    'last_login': DateTime.now().toIso8601String(),
  },
);

print('Updated user: ${updatedUser.data['name']}');
```

#### Delete Document

```dart
// Delete a document
final result = await cocobase.deleteDocument('users', 'document-id-here');
if (result['success'] == true) {
  print('Document deleted successfully');
}
```

#### List Documents

```dart
// Get all documents
final users = await cocobase.listDocuments<Map<String, dynamic>>('users');
print('Total users: ${users.length}');

// Get documents with query
final activeUsers = await cocobase.listDocuments<Map<String, dynamic>>(
  'users',
  query: Query(
    where: {'status': 'active'},
    limit: 10,
    offset: 0,
    orderBy: 'created_at',
  ),
);

print('Active users: ${activeUsers.length}');
```

### Query Options

The `Query` class supports the following options:

```dart
final query = Query(
  where: {
    'status': 'active',
    'age': '25',
    'role': 'admin',
  },
  orderBy: 'created_at',  // Field to sort by
  limit: 20,              // Maximum number of results
  offset: 0,              // Skip first N results
);

final results = await cocobase.listDocuments('users', query: query);
```

### Working with Typed Data

You can work with custom Dart classes:

```dart
class User {
  final String name;
  final String email;
  final int age;
  
  User({required this.name, required this.email, required this.age});
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      name: json['name'],
      email: json['email'],
      age: json['age'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'age': age,
    };
  }
}

// Create with typed data
final userData = User(name: 'John', email: 'john@example.com', age: 30);
final document = await cocobase.createDocument('users', userData.toJson());

// Retrieve and convert
final doc = await cocobase.getDocument<Map<String, dynamic>>('users', document.id);
final user = User.fromJson(doc.data);
```

## Authentication

### Initialize Authentication

Before using authentication features, initialize the auth system:

```dart
void initializeApp() async {
  await cocobase.initAuth();
  
  if (cocobase.isAuthenticated()) {
    print('User is logged in: ${cocobase.user?.email}');
  } else {
    print('User is not authenticated');
  }
}
```

### User Registration

```dart
Future<void> registerUser(String email, String password) async {
  try {
    await cocobase.register(
      email,
      password,
      data: {
        'firstName': 'John',
        'lastName': 'Doe',
        'preferences': {
          'theme': 'dark',
          'notifications': true,
        },
      },
    );
    
    print('Registration successful!');
    print('User: ${cocobase.user?.email}');
  } catch (e) {
    print('Registration failed: $e');
  }
}
```

### User Login

```dart
Future<void> loginUser(String email, String password) async {
  try {
    await cocobase.login(email, password);
    print('Login successful!');
    print('Welcome back, ${cocobase.user?.email}');
  } catch (e) {
    print('Login failed: $e');
  }
}
```

### User Information

```dart
// Check authentication status
if (cocobase.isAuthenticated()) {
  final currentUser = cocobase.user!;
  print('ID: ${currentUser.id}');
  print('Email: ${currentUser.email}');
  print('Created: ${currentUser.createdAt}');
  print('Custom data: ${currentUser.data}');
}

// Refresh user data
try {
  final user = await cocobase.getCurrentUser();
  print('Updated user data: ${user.data}');
} catch (e) {
  print('Failed to fetch user: $e');
}
```

### Update User Profile

```dart
Future<void> updateUserProfile() async {
  try {
    final updatedUser = await cocobase.updateUser(
      email: 'newemail@example.com',
      password: 'newpassword123',
      data: {
        'firstName': 'Jane',
        'preferences': {
          'theme': 'light',
          'notifications': false,
        },
      },
    );
    
    print('Profile updated: ${updatedUser.email}');
  } catch (e) {
    print('Update failed: $e');
  }
}
```

### Logout

```dart
void logoutUser() {
  cocobase.logout();
  print('User logged out');
}
```

## Real-time Features

### Watch Collection Changes

```dart
Connection? connection;

void watchUsers() {
  connection = cocobase.watchCollection(
    'users',
    (event) {
      print('Event received: ${event['event']}');
      print('Data: ${event['data']}');
      
      // Handle different event types
      switch (event['event']) {
        case 'create':
          handleUserCreated(event['data']);
          break;
        case 'update':
          handleUserUpdated(event['data']);
          break;
        case 'delete':
          handleUserDeleted(event['data']);
          break;
      }
    },
    connectionName: 'users-watcher',
    onOpen: () {
      print('Connected to users collection');
    },
    onError: () {
      print('Connection error occurred');
    },
  );
}

void handleUserCreated(Map<String, dynamic> userData) {
  print('New user created: ${userData['name']}');
  // Update your UI here
}

void handleUserUpdated(Map<String, dynamic> userData) {
  print('User updated: ${userData['id']}');
  // Update your UI here
}

void handleUserDeleted(Map<String, dynamic> userData) {
  print('User deleted: ${userData['id']}');
  // Update your UI here
}
```

### Manage Connections

```dart
// Close specific connection
void closeUsersWatcher() {
  if (connection != null) {
    cocobase.closeConnection(connection!);
    print('Connection closed');
  }
}

// Check connection status
void checkConnection() {
  if (connection != null && !connection!.closed) {
    print('Connection is active');
  } else {
    print('Connection is closed');
  }
}
```

## Error Handling

The SDK provides detailed error information:

```dart
try {
  final user = await cocobase.getDocument('users', 'invalid-id');
} catch (e) {
  print('Error: $e');
  
  // The error includes:
  // - HTTP status code
  // - Request URL and method
  // - Error details from server
  // - Helpful suggestions for fixing the issue
}
```

### Common Error Scenarios

```dart
Future<void> handleCommonErrors() async {
  try {
    await cocobase.createDocument('users', {'name': 'Test'});
  } catch (e) {
    final errorStr = e.toString();
    
    if (errorStr.contains('401')) {
      print('Authentication error - check your API key');
    } else if (errorStr.contains('403')) {
      print('Permission denied - verify access rights');
    } else if (errorStr.contains('404')) {
      print('Resource not found - check collection name and document ID');
    } else if (errorStr.contains('429')) {
      print('Rate limit exceeded - wait before retrying');
    } else {
      print('Unexpected error: $e');
    }
  }
}
```

## Flutter Integration Examples

### User Authentication Flow

```dart
class AuthScreen extends StatefulWidget {
  final Cocobase cocobase;
  
  const AuthScreen({Key? key, required this.cocobase}) : super(key: key);
  
  @override
  _AuthScreenState createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  
  Future<void> _login() async {
    setState(() => _isLoading = true);
    
    try {
      await widget.cocobase.login(
        _emailController.text,
        _passwordController.text,
      );
      
      // Navigate to home screen
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => HomeScreen(cocobase: widget.cocobase)),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _login,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### Real-time Data List

```dart
class UsersList extends StatefulWidget {
  final Cocobase cocobase;
  
  const UsersList({Key? key, required this.cocobase}) : super(key: key);
  
  @override
  _UsersListState createState() => _UsersListState();
}

class _UsersListState extends State<UsersList> {
  List<Document<Map<String, dynamic>>> users = [];
  Connection? _connection;
  
  @override
  void initState() {
    super.initState();
    _loadUsers();
    _watchUsers();
  }
  
  @override
  void dispose() {
    if (_connection != null) {
      widget.cocobase.closeConnection(_connection!);
    }
    super.dispose();
  }
  
  Future<void> _loadUsers() async {
    try {
      final usersList = await widget.cocobase.listDocuments<Map<String, dynamic>>('users');
      setState(() {
        users = usersList;
      });
    } catch (e) {
      print('Failed to load users: $e');
    }
  }
  
  void _watchUsers() {
    _connection = widget.cocobase.watchCollection(
      'users',
      (event) {
        setState(() {
          switch (event['event']) {
            case 'create':
              users.add(Document<Map<String, dynamic>>.fromJson(event['data']));
              break;
            case 'update':
              final updatedDoc = Document<Map<String, dynamic>>.fromJson(event['data']);
              final index = users.indexWhere((u) => u.id == updatedDoc.id);
              if (index != -1) {
                users[index] = updatedDoc;
              }
              break;
            case 'delete':
              users.removeWhere((u) => u.id == event['data']['id']);
              break;
          }
        });
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: users.length,
      itemBuilder: (context, index) {
        final user = users[index];
        return ListTile(
          title: Text(user.data['name'] ?? 'Unknown'),
          subtitle: Text(user.data['email'] ?? ''),
          trailing: Text(user.createdAt.toString()),
        );
      },
    );
  }
}
```

### Data Submission Form

```dart
class CreateUserForm extends StatefulWidget {
  final Cocobase cocobase;
  
  const CreateUserForm({Key? key, required this.cocobase}) : super(key: key);
  
  @override
  _CreateUserFormState createState() => _CreateUserFormState();
}

class _CreateUserFormState extends State<CreateUserForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _ageController = TextEditingController();
  
  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      try {
        final newUser = await widget.cocobase.createDocument<Map<String, dynamic>>(
          'users',
          {
            'name': _nameController.text,
            'email': _emailController.text,
            'age': int.parse(_ageController.text),
            'created_at': DateTime.now().toIso8601String(),
          },
        );
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User created: ${newUser.id}')),
        );
        
        // Clear form
        _nameController.clear();
        _emailController.clear();
        _ageController.clear();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create user: $e')),
        );
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(labelText: 'Name'),
            validator: (value) => value?.isEmpty == true ? 'Name is required' : null,
          ),
          TextFormField(
            controller: _emailController,
            decoration: const InputDecoration(labelText: 'Email'),
            validator: (value) => value?.isEmpty == true ? 'Email is required' : null,
          ),
          TextFormField(
            controller: _ageController,
            decoration: const InputDecoration(labelText: 'Age'),
            keyboardType: TextInputType.number,
            validator: (value) {
              if (value?.isEmpty == true) return 'Age is required';
              if (int.tryParse(value!) == null) return 'Age must be a number';
              return null;
            },
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _submitForm,
            child: const Text('Create User'),
          ),
        ],
      ),
    );
  }
}
```

## Best Practices

### 1. Initialize Authentication Early

```dart
class MyApp extends StatefulWidget {
  final Cocobase cocobase;
  
  const MyApp({Key? key, required this.cocobase}) : super(key: key);
  
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _isInitialized = false;
  
  @override
  void initState() {
    super.initState();
    _initializeAuth();
  }
  
  Future<void> _initializeAuth() async {
    await widget.cocobase.initAuth();
    setState(() {
      _isInitialized = true;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const MaterialApp(
        home: Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }
    
    return MaterialApp(
      home: widget.cocobase.isAuthenticated()
          ? HomeScreen(cocobase: widget.cocobase)
          : AuthScreen(cocobase: widget.cocobase),
    );
  }
}
```

### 2. Handle Connection Lifecycle

```dart
class RealtimeScreen extends StatefulWidget {
  @override
  _RealtimeScreenState createState() => _RealtimeScreenState();
}

class _RealtimeScreenState extends State<RealtimeScreen>
    with WidgetsBindingObserver {
  Connection? _connection;
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _setupRealtimeConnection();
  }
  
  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _closeConnection();
    super.dispose();
  }
  
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
        _closeConnection();
        break;
      case AppLifecycleState.resumed:
        _setupRealtimeConnection();
        break;
      default:
        break;
    }
  }
  
  void _setupRealtimeConnection() {
    _connection = cocobase.watchCollection('users', (event) {
      // Handle events
    });
  }
  
  void _closeConnection() {
    if (_connection != null) {
      cocobase.closeConnection(_connection!);
      _connection = null;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    // Your UI here
    return Container();
  }
}
```

### 3. Error Handling Patterns

```dart
Future<T?> safeApiCall<T>(Future<T> Function() apiCall) async {
  try {
    return await apiCall();
  } catch (e) {
    print('API call failed: $e');
    
    // Show user-friendly error message
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Something went wrong. Please try again.')),
    );
    
    return null;
  }
}

// Usage
final users = await safeApiCall(() => 
  cocobase.listDocuments<Map<String, dynamic>>('users')
);

if (users != null) {
  setState(() {
    this.users = users;
  });
}
```

The CocoBASE Dart SDK provides everything you need to build robust Flutter applications with real-time capabilities, secure authentication, and seamless database operations.