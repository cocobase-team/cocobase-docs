---
sidebar_position: 3

title: Handling Authentication
---

# Authentication

Cocobase provides a complete authentication system that handles user registration, login, session management, and user profiles out of the box. No complex setup required - just simple, secure authentication that works.

## Overview

Cocobase authentication includes:

- **User Registration**: Create new user accounts with email and password
- **User Login**: Authenticate existing users
- **Session Management**: Automatic token handling and persistence
- **User Profiles**: Extensible user data with custom fields
- **Security**: Industry-standard security practices built-in

## Getting Started

### Basic Authentication Setup

```typescript
import db from "../lib/cocobase";

// Register a new user
await db.register("user@example.com", "securePassword123");
if (await db.isAuthenticated()) {
  console.log("User registered:", db.user.email);
}

// Login an existing user
await db.login("user@example.com", "securePassword123");
if (await db.isAuthenticated()) {
  console.log("User logged in:", db.user.email);
}

// Logout the current user
await db.logout();
console.log("User logged out");
```

## User Registration

> **Note:** You do not need to call `login` after `register`. The `register` method automatically logs in the user upon successful registration. Both `register` and `login` now return `null`. To access the current user, use `db.user` after registration or login. To check if a user is authenticated, use `await db.isAuthenticated()`.

The `register` method creates a new user account and automatically logs them in.

### Basic Registration

```typescript
// Simple registration with email and password
await db.register("john@example.com", "mySecurePassword");

if (db.isAuthenticated()) {
  console.log("New user created:");
  console.log("ID:", db.user.id);
  console.log("Email:", db.user.email);
  console.log("Created at:", db.user.createdAt);
}
```

### Registration with Additional Data

You can include additional user data during registration:

```typescript
// Register user with profile information
await db.register("jane@example.com", "password123", {
  name: "Jane Smith",
  role: "admin",
  department: "Engineering",
  preferences: {
    theme: "dark",
    notifications: true,
  },
});

if (db.isAuthenticated()) {
  console.log("User registered with profile:", db.user.name);
  console.log("User role:", db.user.role);
}
```

### Registration Examples

**E-commerce User Registration**

```typescript
await db.register("customer@shop.com", "password123", {
  firstName: "Alice",
  lastName: "Johnson",
  phone: "+1234567890",
  shippingAddress: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "12345",
    country: "USA",
  },
  preferences: {
    newsletter: true,
    smsUpdates: false,
  },
});

if (await db.isAuthenticated()) {
  console.log("Customer registered:", db.user.firstName);
}
```

**Team Member Registration**

```typescript
await db.register("dev@company.com", "securePass", {
  name: "Bob Developer",
  role: "developer",
  team: "frontend",
  startDate: new Date(),
  skills: ["React", "TypeScript", "Node.js"],
  manager: "manager-user-id",
});

if (db.isAuthenticated()) {
  console.log("Team member registered:", db.user.name);
}
```

**Student Registration**

```typescript
await db.register("student@university.edu", "studentPass", {
  firstName: "Sarah",
  lastName: "Wilson",
  studentId: "STU2024001",
  major: "Computer Science",
  year: "sophomore",
  courses: [],
});

if (db.isAuthenticated()) {
  console.log("Student registered:", db.user.firstName);
}
```

## User Login

The `login` method authenticates users with their email and password. It now returns `null`. Use `db.user` to access the current user after login, and `await db.isAuthenticated()` to check authentication status.

### Basic Login

```typescript
try {
  await db.login("user@example.com", "password123");

  if (db.isAuthenticated()) {
    console.log("Login successful!");
    console.log("Welcome back,", db.user.name || db.user.email);
    // Redirect to dashboard or home page
    window.location.href = "/dashboard";
  }
} catch (error) {
  console.error("Login failed:", error.message);
  // Show error message to user
}
```

### Login with Error Handling

```typescript
async function handleLogin(email, password) {
  try {
    await db.login(email, password);

    if (db.isAuthenticated()) {
      // Login successful
      return {
        success: true,
        user: db.user,
        message: "Login successful!",
      };
    } else {
      return {
        success: false,
        message: "Login failed. Please try again.",
      };
    }
  } catch (error) {
    // Handle different types of login errors
    let errorMessage = "Login failed. Please try again.";

    if (error.code === "INVALID_CREDENTIALS") {
      errorMessage = "Invalid email or password.";
    } else if (error.code === "USER_NOT_FOUND") {
      errorMessage = "No account found with this email.";
    } else if (error.code === "NETWORK_ERROR") {
      errorMessage = "Network error. Please check your connection.";
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Usage
const result = await handleLogin(email, password);
if (result.success) {
  console.log("Logged in as:", result.user.email);
} else {
  console.error(result.message);
}
```

## Session Management

Cocobase automatically handles user sessions, including token storage and persistence.

### Getting Current User

```typescript
// Get the currently logged-in user
if (db.isAuthenticated()) {
  console.log("User is logged in:", db.user.email);
} else {
  console.log("No user is logged in");
  // Redirect to login page
}
```

### Checking Authentication Status

```typescript
// Check if a user is currently authenticated
const isAuthenticated = db.isAuthenticated();

if (isAuthenticated) {
  console.log("User is authenticated");
  // Show authenticated content
} else {
  console.log("User is not authenticated");
  // Show login form
}
```

### Session Persistence

Sessions are automatically persisted across browser sessions and app restarts:

```typescript
// This works automatically - no additional code needed
// When user returns to your app, their session is restored

window.addEventListener("load", async () => {
  if (await db.isAuthenticated()) {
    console.log("Welcome back,", db.user.email);
    // User is still logged in from previous session
  }
});
```

## User Logout

The `logout` method signs out the current user and clears their session.

```typescript
// Simple logout
db.logout();
console.log("User logged out successfully");

// Logout with redirect
async function handleLogout() {
  try {
    db.logout();
    console.log("Logged out successfully");

    // Redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
}
```
