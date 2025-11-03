---
sidebar_position: 2
title: Installation & Setup
---

# Installation & Setup

Learn how to install and configure the Cocobase JavaScript SDK in your project.

## Prerequisites

- Node.js 14.x or higher
- npm, yarn, or pnpm package manager

## Installation

Choose your preferred package manager:

### npm

```bash
npm install cocobase
```

### Yarn

```bash
yarn add cocobase
```

### pnpm

```bash
pnpm add cocobase
```

## Configuration

### 1. Get Your API Key

1. Visit [cocobase.buzz](https://cocobase.buzz)
2. Sign in to your account
3. Navigate to your project settings
4. Copy your API key

### 2. Initialize the Client

```typescript
import { Cocobase } from "cocobase";

const db = new Cocobase({
  apiKey: "your-api-key-here",
});
```

### 3. Environment Variables (Recommended)

For security, store your API key in environment variables:

**.env**

```bash
COCOBASE_API_KEY=your-api-key-here
```

**Usage:**

```typescript
import { Cocobase } from "cocobase";

const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY,
});
```

## Framework-Specific Setup

### React / Next.js

```typescript
// lib/cocobase.ts
import { Cocobase } from "cocobase";

export const db = new Cocobase({
  apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY,
});
```

### Vue / Nuxt

```typescript
// plugins/cocobase.ts
import { Cocobase } from "cocobase";

export default defineNuxtPlugin(() => {
  const db = new Cocobase({
    apiKey: process.env.NUXT_PUBLIC_COCOBASE_API_KEY,
  });

  return {
    provide: {
      db,
    },
  };
});
```

### Node.js / Express

```typescript
// config/database.js
import { Cocobase } from "cocobase";

export const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY,
});
```

## Verify Installation

Test your setup with a simple operation:

```typescript
async function testConnection() {
  try {
    // Try to authenticate (if you have credentials)
    await db.login("test@example.com", "password");

    if (await db.isAuthenticated()) {
      console.log("✅ Connected to Cocobase!");
      console.log("User:", db.user.email);
    }
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}

testConnection();
```

Or test with a simple document operation:

```typescript
async function testConnection() {
  try {
    // Create a test document
    const result = await db.createDocument("test_collection", {
      message: "Hello, Cocobase!",
      timestamp: new Date().toISOString(),
    });

    console.log("✅ Connected to Cocobase!");
    console.log("Created document:", result);
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}

testConnection();
```

## Next Steps

Now that you have Cocobase installed and configured:

- [Authentication](./authentication) - Set up user authentication
- [CRUD Operations](./crud-operations) - Start working with data
- [Query Builder](./query-builder) - Learn advanced querying
