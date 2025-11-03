---
sidebar_position: 3
title: Deployment
---

# Cloud Functions Deployment

Learn how to deploy your COCOBASE cloud functions.

## Prerequisites

- COCOBASE account with cloud functions enabled
- Node.js 18+ or Python 3.9+
- COCOBASE CLI installed

## Install the CLI

```bash
npm install -g cocobase-cli
# or
pip install cocobase-cli
```

## Initialize Your Project

```bash
cocobase init
```

This creates the following structure:

```
my-functions/
├── functions/
│   ├── hello.js
│   └── database-trigger.js
├── cocobase.json
└── package.json
```

## Function Structure

### JavaScript/TypeScript

```javascript
// functions/hello.js
export default async function handler(event, context) {
  const { name } = event.query;

  return {
    statusCode: 200,
    body: {
      message: `Hello, ${name}!`,
    },
  };
}
```

### Python

```python
# functions/hello.py
def handler(event, context):
    name = event['query'].get('name', 'World')

    return {
        'statusCode': 200,
        'body': {
            'message': f'Hello, {name}!'
        }
    }
```

## Deploy Functions

### Deploy All Functions

```bash
cocobase deploy
```

### Deploy Specific Function

```bash
cocobase deploy hello
```

### Deploy with Environment Variables

```bash
cocobase deploy --env production
```

## Environment Variables

Add environment variables in `cocobase.json`:

```json
{
  "functions": {
    "hello": {
      "handler": "functions/hello.js",
      "env": {
        "API_KEY": "your-key",
        "DEBUG": "true"
      }
    }
  }
}
```

## Function Configuration

Configure functions in `cocobase.json`:

```json
{
  "functions": {
    "api": {
      "handler": "functions/api.js",
      "memory": 512,
      "timeout": 30,
      "env": {
        "NODE_ENV": "production"
      }
    },
    "heavy-task": {
      "handler": "functions/process.js",
      "memory": 2048,
      "timeout": 300
    }
  }
}
```

### Configuration Options

- `handler` - Path to your function file
- `memory` - Memory allocation in MB (128-3008)
- `timeout` - Timeout in seconds (1-900)
- `env` - Environment variables

## Triggers

### HTTP Triggers

```javascript
// functions/api.js
export default async function handler(event, context) {
  const { method, path, body, query, headers } = event;

  if (method === "POST" && path === "/users") {
    // Create user
    return {
      statusCode: 201,
      body: { message: "User created" },
    };
  }

  return {
    statusCode: 404,
    body: { error: "Not found" },
  };
}
```

### Database Triggers

```javascript
// functions/on-user-create.js
export default async function handler(event, context) {
  const { operation, collection, document } = event;

  if (operation === "create" && collection === "users") {
    // Send welcome email
    await sendWelcomeEmail(document.email);
  }

  return { success: true };
}
```

Configure in `cocobase.json`:

```json
{
  "functions": {
    "on-user-create": {
      "handler": "functions/on-user-create.js",
      "trigger": {
        "type": "database",
        "collection": "users",
        "operation": "create"
      }
    }
  }
}
```

### Scheduled Triggers (Cron)

```javascript
// functions/daily-cleanup.js
export default async function handler(event, context) {
  // Clean up old data
  await db.deleteOldRecords();

  return { success: true };
}
```

Configure in `cocobase.json`:

```json
{
  "functions": {
    "daily-cleanup": {
      "handler": "functions/daily-cleanup.js",
      "trigger": {
        "type": "schedule",
        "schedule": "0 0 * * *"
      }
    }
  }
}
```

Cron syntax:

```
 ┌───────────── minute (0-59)
 │ ┌───────────── hour (0-23)
 │ │ ┌───────────── day of month (1-31)
 │ │ │ ┌───────────── month (1-12)
 │ │ │ │ ┌───────────── day of week (0-6)
 │ │ │ │ │
 * * * * *
```

## Testing Locally

Start local development server:

```bash
cocobase dev
```

Test your function:

```bash
curl http://localhost:3000/hello?name=World
```

## Logs

View function logs:

```bash
# All logs
cocobase logs

# Specific function
cocobase logs hello

# Follow logs
cocobase logs --follow

# Filter by level
cocobase logs --level error
```

## Monitoring

View function metrics in the dashboard:

- Invocations count
- Average duration
- Error rate
- Memory usage

## Best Practices

### 1. Keep Functions Small

```javascript
// Good: Single responsibility
export default async function sendEmail(event) {
  await mailer.send(event.body);
  return { success: true };
}

// Bad: Too many responsibilities
export default async function handler(event) {
  // Handles 10 different operations...
}
```

### 2. Handle Errors Properly

```javascript
export default async function handler(event, context) {
  try {
    const result = await processData(event.body);
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: { error: error.message },
    };
  }
}
```

### 3. Use Environment Variables

```javascript
const apiKey = process.env.API_KEY;
const debug = process.env.DEBUG === "true";
```

### 4. Optimize Cold Starts

```javascript
// Initialize outside handler for reuse
const db = new Database();

export default async function handler(event) {
  // Handler code
}
```

### 5. Set Appropriate Timeouts

```json
{
  "functions": {
    "quick-api": {
      "timeout": 10
    },
    "batch-process": {
      "timeout": 300
    }
  }
}
```

## Pricing

- **Free tier**: 100,000 invocations/month
- **Pro tier**: 1,000,000 invocations/month
- **Enterprise**: Custom limits

Additional charges:

- Compute time: $0.00001667/GB-second
- Outbound data transfer: $0.12/GB

## Next Steps

- [Database Integration](./database) - Use COCOBASE database in functions
- [Examples](../examples/sample-project) - See complete examples
- [API Reference](../api/introduction) - REST API documentation
