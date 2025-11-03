---
sidebar_position: 1
title: JavaScript/TypeScript SDK
---

# JavaScript/TypeScript SDK

The official Cocobase SDK for JavaScript and TypeScript applications. Works with Node.js, React, Vue, Angular, Next.js, and all modern JavaScript frameworks.

## 🚀 Features

- ✅ **Full TypeScript Support** - Native TypeScript with excellent type inference
- ✅ **Framework Agnostic** - Works with any JavaScript framework
- ✅ **Modern API** - Promise-based async/await interface
- ✅ **Lightweight** - Minimal bundle size impact
- ✅ **Browser & Node.js** - Works in both environments

## 📦 Installation

```bash
npm install cocobase
# or
yarn add cocobase
# or
pnpm add cocobase
```

## 🎯 Quick Start

```typescript
import { Cocobase } from "cocobase";

// Initialize the client
const db = new Cocobase({
  apiKey: "your-api-key",
});

// Create a document
await db.createDocument("users", {
  name: "John Doe",
  email: "john@example.com",
});

// Query documents
const users = await db.listDocuments("users");
console.log(users);
```

## 📚 What's Next?

- [Installation & Setup](./installation) - Detailed setup instructions
- [Authentication](./authentication) - User authentication and management
- [CRUD Operations](./crud-operations) - Create, read, update, and delete data
- [Query Builder](./query-builder) - Advanced querying capabilities

## 🔗 Resources

- [GitHub Repository](https://github.com/lordace-coder/coco_base_js)
- [NPM Package](https://www.npmjs.com/package/cocobase)
- [Example Projects](https://github.com/cocobase/examples)
