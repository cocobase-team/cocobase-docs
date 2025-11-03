---
sidebar_position: 1
title: Python SDK
---

# Python SDK

The official Cocobase SDK for Python applications. Perfect for Django, Flask, FastAPI, and any Python project.

## 🚀 Features

- ✅ **Pythonic API** - Clean, intuitive Python interface
- ✅ **Type Hints** - Full type annotation support
- ✅ **Async Support** - Both sync and async operations
- ✅ **Framework Integration** - Works with Django, Flask, FastAPI
- ✅ **Modern Python** - Python 3.8+ support

## 📦 Installation

```bash
pip install cocobase
```

## 🎯 Quick Start

```python
from cocobase import Cocobase

# Initialize the client
db = Cocobase(api_key='your-api-key')

# Create a document
user = db.create_document('users', {
    'name': 'John Doe',
    'email': 'john@example.com'
})

# Query documents
users = db.list_documents('users')
print(users)
```

## Async Support

```python
import asyncio
from cocobase import AsyncCocobase

async def main():
    db = AsyncCocobase(api_key='your-api-key')

    # Create document asynchronously
    user = await db.create_document('users', {
        'name': 'Jane Doe',
        'email': 'jane@example.com'
    })

    # Query documents
    users = await db.list_documents('users')
    print(users)

asyncio.run(main())
```

## 📚 What's Next?

- [Client Setup](./client-setup) - Detailed configuration options
- [Authentication](./authentication) - User authentication
- [Collections](./collections) - Working with collections
- [Documents](./document) - Document operations
- [Query Builder](./query-builder) - Advanced queries

## 🔗 Resources

- [GitHub Repository](https://github.com/lordace-coder/cocobase-python)
- [PyPI Package](https://pypi.org/project/cocobase/)
- [Example Projects](https://github.com/cocobase/python-examples)
