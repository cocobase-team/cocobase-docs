---

title: Project Setup
slug: /getting-started
sidebar_position: 2
-------------------

# Project Setup

Get your Cocobase project up and running in minutes. This guide covers everything from initial setup to advanced configuration options.

## Prerequisites

Before starting, ensure you have:

* Node.js 16.x or higher
* npm, yarn, or pnpm package manager
* A modern code editor (VS Code recommended)

## Creating Your First Project

### 1. Sign Up and Create Project

1. Visit [cocobase.buzz](https://cocobase.buzz) and create your account
2. Click "Create New Project" in your dashboard
3. Choose your project name and region
4. Copy your API key from the project settings

### 2. Installation

Install the Cocobase SDK in your project:

```bash
# Using npm
npm install cocobase

# Using yarn
yarn add cocobase

# Using pnpm
pnpm add cocobase
```

### CDN Installation (Browser Only)

If you prefer using Cocobase directly in the browser without installing packages, use the CDN version:

```html
<script type="module">
  import { Cocobase } from "https://unpkg.com/cocobase/dist/index.js";

  const db = new Cocobase({ apiKey: "your-api-key" });

  // Your code here
</script>
```

> **Note:** CDN installation is ideal for quick demos, prototypes, or static HTML projects. For production apps, we recommend installing via npm/yarn/pnpm.

### 3. Basic Configuration

Create a new file to initialize Cocobase:

```typescript
// lib/cocobase.ts
import { Cocobase } from "cocobase";

const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY, // Your API key
});

export default db;
```

### 4. Environment Variables

Create a `.env.local` file in your project root:

```env
COCOBASE_API_KEY=your_api_key_here
COCOBASE_PROJECT_ID=your_project_id_here
```

## Next Steps

Now that your project is set up, you're ready to:

1. [Learn about CRUD operations →](./crud-operations)
2. [Implement authentication →](./authentication)
3. [Explore real-time features →](./realtime)
4. [Set up file storage →](./file-storage)

## Troubleshooting

### Common Issues

**API Key Issues**

* Ensure your API key is correct and not expired
* Check that environment variables are properly loaded
* Verify your project ID matches your dashboard

**Network Issues**

* Check your internet connection
* Verify firewall settings allow HTTPS requests
* Ensure your region is correctly configured

**TypeScript Issues**

* Install type definitions: `npm install @types/node`
* Enable strict mode in tsconfig.json for better type safety
* Use generic types for better IntelliSense

Need help? Join our [Discord community](https://discord.gg/cocobase) or contact support at [hello@cocobase.buzz](mailto:hello@cocobase.buzz).
