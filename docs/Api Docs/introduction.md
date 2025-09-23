---

sidebar_position: 1
---
# API Documentation

## Using the Collections API Without Client Libraries

Welcome to the Cocobase API documentation! This guide will help you integrate with our Collections API directly using HTTP requests when client libraries aren't available for your programming language.

## Getting Started

### Base URL

```
https://futurebase.vercel.app
```

### Authentication

All API requests require an `x-api-key` header for authentication:

```
x-api-key: your-api-key-here
```

### Content Type

All request bodies should be sent as JSON with the appropriate content type header:

```
Content-Type: application/json
```

## Collections Management

### Create a Collection

Create a new collection to organize your documents.

**Endpoint:** `POST /collections/`

**Headers:**

- `x-api-key: your-api-key`
- `Content-Type: application/json`

**Request Body:**

```json
{
  "name": "My Collection",
  "description": "A collection for storing user documents",
  "metadata": {
    "category": "user-data",
    "version": "1.0"
  }
}
```

**Response (201):**

```json
{
  "id": "col_abc123",
  "name": "My Collection",
  "description": "A collection for storing user documents",
  "created_at": "2024-07-04T10:30:00Z",
  "updated_at": "2024-07-04T10:30:00Z",
  "metadata": {
    "category": "user-data",
    "version": "1.0"
  }
}
```

#### Example Implementation

**Python:**

```python
import requests
import json

def create_collection(api_key, name, description=None, metadata=None):
    url = "https://api.Cocobase.com/collections/"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    payload = {"name": name}
    if description:
        payload["description"] = description
    if metadata:
        payload["metadata"] = metadata

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Failed to create collection: {response.status_code}")

# Usage
collection = create_collection(
    api_key="your-api-key",
    name="My Collection",
    description="A collection for storing user documents"
)
```

**JavaScript/Node.js:**

```javascript
async function createCollection(
  apiKey,
  name,
  description = null,
  metadata = null
) {
  const url = "https://api.Cocobase.com/collections/";
  const headers = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  const payload = { name };
  if (description) payload.description = description;
  if (metadata) payload.metadata = metadata;

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (response.status === 201) {
    return await response.json();
  } else {
    throw new Error(`Failed to create collection: ${response.status}`);
  }
}

// Usage
const collection = await createCollection(
  "your-api-key",
  "My Collection",
  "A collection for storing user documents"
);
```

**cURL:**

```bash
curl -X POST "https://api.Cocobase.com/collections/" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Collection",
    "description": "A collection for storing user documents",
    "metadata": {
      "category": "user-data",
      "version": "1.0"
    }
  }'
```

### Update a Collection

Modify an existing collection's properties.

**Endpoint:** `PATCH /collections/{collection_id}`

**Headers:**

- `x-api-key: your-api-key`
- `Content-Type: application/json`

**Request Body:**

```json
{
  "name": "Updated Collection Name",
  "description": "Updated description",
  "metadata": {
    "category": "updated-category",
    "version": "2.0"
  }
}
```

**Response (200):**

```json
{
  "id": "col_abc123",
  "name": "Updated Collection Name",
  "description": "Updated description",
  "created_at": "2024-07-04T10:30:00Z",
  "updated_at": "2024-07-04T11:45:00Z",
  "metadata": {
    "category": "updated-category",
    "version": "2.0"
  }
}
```

### Delete a Collection

Remove a collection and all its documents.

**Endpoint:** `DELETE /collections/{collection_id}`

**Headers:**

- `x-api-key: your-api-key`

**Response (204):** No content

## Document Management

### Create a Document

Add a new document to a collection.

**Endpoint:** `POST /collections/documents`

**Headers:**

- `x-api-key: your-api-key`
- `Content-Type: application/json`

**Query Parameters:**

- `collection` (optional): Collection ID to add the document to

**Request Body:**

```json
{
  "title": "My Document",
  "content": "This is the document content",
  "metadata": {
    "author": "John Doe",
    "tags": ["important", "draft"]
  }
}
```

**Response (200):**

```json
{
  "id": "doc_xyz789",
  "title": "My Document",
  "content": "This is the document content",
  "collection_id": "col_abc123",
  "created_at": "2024-07-04T12:00:00Z",
  "updated_at": "2024-07-04T12:00:00Z",
  "metadata": {
    "author": "John Doe",
    "tags": ["important", "draft"]
  }
}
```

#### Example Implementation

**Python:**

```python
def create_document(api_key, title, content, collection_id=None, metadata=None):
    url = "https://api.Cocobase.com/collections/documents"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    params = {}
    if collection_id:
        params["collection"] = collection_id

    payload = {
        "title": title,
        "content": content
    }
    if metadata:
        payload["metadata"] = metadata

    response = requests.post(url, headers=headers, params=params, json=payload)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to create document: {response.status_code}")
```

### List Documents

Retrieve all documents in a collection.

**Endpoint:** `GET /collections/{collection_id}/documents`

**Headers:**

- `x-api-key: your-api-key`

**Query Parameters:**

- `limit` (optional): Maximum number of documents to return (1-1000, default: 100)
- `offset` (optional): Number of documents to skip (default: 0)

**Response (200):**

```json
{
  "documents": [
    {
      "id": "doc_xyz789",
      "title": "My Document",
      "content": "This is the document content",
      "collection_id": "col_abc123",
      "created_at": "2024-07-04T12:00:00Z",
      "updated_at": "2024-07-04T12:00:00Z",
      "metadata": {
        "author": "John Doe",
        "tags": ["important", "draft"]
      }
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

### Get a Specific Document

Retrieve a single document by its ID.

**Endpoint:** `GET /collections/{collection_id}/documents/{document_id}`

**Headers:**

- `x-api-key: your-api-key`

**Response (200):**

```json
{
  "id": "doc_xyz789",
  "title": "My Document",
  "content": "This is the document content",
  "collection_id": "col_abc123",
  "created_at": "2024-07-04T12:00:00Z",
  "updated_at": "2024-07-04T12:00:00Z",
  "metadata": {
    "author": "John Doe",
    "tags": ["important", "draft"]
  }
}
```

### Update a Document

Modify an existing document's content or metadata.

**Endpoint:** `PATCH /collections/{collection_id}/documents/{document_id}`

**Headers:**

- `x-api-key: your-api-key`
- `Content-Type: application/json`

**Request Body:**

```json
{
  "title": "Updated Document Title",
  "content": "Updated document content",
  "metadata": {
    "author": "Jane Smith",
    "tags": ["updated", "final"]
  }
}
```

### Delete a Document

Remove a document from a collection.

**Endpoint:** `DELETE /collections/{collection_id}/documents/{document_id}`

**Headers:**

- `x-api-key: your-api-key`

**Response (200):** Success confirmation

## Error Handling

### Common HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **204**: No content (successful deletion)
- **400**: Bad request (invalid parameters)
- **401**: Unauthorized (invalid API key)
- **404**: Resource not found
- **422**: Validation error

### Error Response Format

```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Best Practices

### 1. Handle Rate Limits

Implement exponential backoff when you receive rate limit errors:

```python
import time
import random

def make_request_with_retry(request_func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return request_func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e

            # Exponential backoff with jitter
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            time.sleep(wait_time)
```

### 2. Validate Input Data

Always validate your data before sending requests:

```python
def validate_collection_data(name, description=None):
    if not name or len(name.strip()) == 0:
        raise ValueError("Collection name is required")

    if description and len(description) > 1000:
        raise ValueError("Description must be less than 1000 characters")
```

### 3. Use Pagination for Large Datasets

When listing documents, use pagination to avoid timeouts:

```python
def get_all_documents(api_key, collection_id, batch_size=100):
    all_documents = []
    offset = 0

    while True:
        response = list_documents(api_key, collection_id, batch_size, offset)
        documents = response.get('documents', [])

        if not documents:
            break

        all_documents.extend(documents)
        offset += batch_size

        # Break if we've retrieved all documents
        if len(documents) < batch_size:
            break

    return all_documents
```

### 4. Implement Proper Error Handling

Always handle potential errors gracefully:

```python
def safe_api_call(api_func, *args, **kwargs):
    try:
        return api_func(*args, **kwargs)
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
        return None
    except Exception as e:
        print(f"API error: {e}")
        return None
```

## Complete Example: Document Management System

Here's a complete example that demonstrates how to build a simple document management system:

```python
import requests
import json
from datetime import datetime

class CocobaseClient:
    def __init__(self, api_key, base_url="https://api.Cocobase.com"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json"
        }

    def create_collection(self, name, description=None, metadata=None):
        url = f"{self.base_url}/collections/"
        payload = {"name": name}

        if description:
            payload["description"] = description
        if metadata:
            payload["metadata"] = metadata

        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()

    def create_document(self, title, content, collection_id=None, metadata=None):
        url = f"{self.base_url}/collections/documents"
        params = {}

        if collection_id:
            params["collection"] = collection_id

        payload = {
            "title": title,
            "content": content
        }
        if metadata:
            payload["metadata"] = metadata

        response = requests.post(url, headers=self.headers, params=params, json=payload)
        response.raise_for_status()
        return response.json()

    def list_documents(self, collection_id, limit=100, offset=0):
        url = f"{self.base_url}/collections/{collection_id}/documents"
        params = {"limit": limit, "offset": offset}

        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()

# Usage example
client = CocobaseClient("your-api-key")

# Create a collection
collection = client.create_collection(
    name="My Project Documents",
    description="Documents for my awesome project",
    metadata={"project": "awesome-app", "version": "1.0"}
)

# Create a document in the collection
document = client.create_document(
    title="Project Overview",
    content="This document outlines the project requirements...",
    collection_id=collection["id"],
    metadata={"type": "overview", "priority": "high"}
)

# List all documents in the collection
documents = client.list_documents(collection["id"])
print(f"Found {documents['total']} documents")
```

## File Upload

### Upload a File

Upload files to the Cocobase platform for storage and processing.

**Endpoint:** `POST /files/upload-file`

**Headers:**

- `x-api-key: your-api-key`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**

- `file`: The file to upload (binary data)
- `filename` (optional): Custom filename for the uploaded file
- `metadata` (optional): JSON string containing file metadata

**Response (200):**

```json
{
  "id": "file_abc123",
  "filename": "document.pdf",
  "original_filename": "my-document.pdf",
  "size": 1024576,
  "content_type": "application/pdf",
  "upload_date": "2024-07-04T14:30:00Z",
  "url": "https://files.Cocobase.com/file_abc123",
  "metadata": {
    "category": "document",
    "uploaded_by": "user123"
  }
}
```

#### Example Implementation

**Python (using requests):**

```python
import requests

def upload_file(api_key, file_path, filename=None, metadata=None):
    url = "https://api.Cocobase.com/files/upload-file"
    headers = {
        "x-api-key": api_key
    }

    with open(file_path, 'rb') as file:
        files = {'file': file}
        data = {}

        if filename:
            data['filename'] = filename
        if metadata:
            data['metadata'] = json.dumps(metadata)

        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        return response.json()

# Usage
file_info = upload_file(
    api_key="your-api-key",
    file_path="./documents/report.pdf",
    filename="monthly-report.pdf",
    metadata={"category": "report", "month": "july"}
)
```

**JavaScript/Node.js (using FormData):**

```javascript
const fs = require("fs");
const FormData = require("form-data");

async function uploadFile(apiKey, filePath, filename = null, metadata = null) {
  const url = "https://api.Cocobase.com/files/upload-file";
  const form = new FormData();

  // Add file to form
  form.append("file", fs.createReadStream(filePath));

  // Add optional fields
  if (filename) {
    form.append("filename", filename);
  }
  if (metadata) {
    form.append("metadata", JSON.stringify(metadata));
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`Upload failed: ${response.status}`);
  }
}

// Usage
const fileInfo = await uploadFile(
  "your-api-key",
  "./documents/report.pdf",
  "monthly-report.pdf",
  { category: "report", month: "july" }
);
```

**Browser JavaScript (using FormData):**

```javascript
async function uploadFile(apiKey, fileInput, filename = null, metadata = null) {
  const url = "https://api.Cocobase.com/files/upload-file";
  const formData = new FormData();

  // Add file from input element
  formData.append("file", fileInput.files[0]);

  // Add optional fields
  if (filename) {
    formData.append("filename", filename);
  }
  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
    },
    body: formData,
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`Upload failed: ${response.status}`);
  }
}

// Usage with file input
const fileInput = document.getElementById("file-input");
const fileInfo = await uploadFile(
  "your-api-key",
  fileInput,
  "custom-filename.pdf",
  { category: "upload", source: "web" }
);
```

**cURL:**

```bash
curl -X POST "https://api.Cocobase.com/files/upload-file" \
  -H "x-api-key: your-api-key" \
  -F "file=@/path/to/your/file.pdf" \
  -F "filename=custom-name.pdf" \
  -F 'metadata={"category": "document", "uploaded_by": "user123"}'
```

**Python (with progress tracking):**

```python
import requests
from requests_toolbelt.multipart.encoder import MultipartEncoder, MultipartEncoderMonitor

def upload_file_with_progress(api_key, file_path, filename=None, metadata=None):
    url = "https://api.Cocobase.com/files/upload-file"
    headers = {"x-api-key": api_key}

    def create_callback(encoder):
        def callback(monitor):
            progress = (monitor.bytes_read / monitor.len) * 100
            print(f"Upload progress: {progress:.1f}%")
        return callback

    fields = {'file': (filename or file_path, open(file_path, 'rb'))}

    if filename:
        fields['filename'] = filename
    if metadata:
        fields['metadata'] = json.dumps(metadata)

    encoder = MultipartEncoder(fields=fields)
    monitor = MultipartEncoderMonitor(encoder, create_callback(encoder))

    headers['Content-Type'] = monitor.content_type

    response = requests.post(url, headers=headers, data=monitor)
    response.raise_for_status()
    return response.json()
```

### File Upload Best Practices

**1. File Size Limits**

- Maximum file size: 1.7MB per file
- Compress images/videos before upload if they exceed this limit

**2. Supported File Types**

- Images: JPG, JPEG, PNG, GIF, WEBP, SVG
- Videos: MP4, MOV, AVI, MKV, WEBM

**3. Error Handling**

```python
def safe_upload_file(api_key, file_path, **kwargs):
    try:
        return upload_file(api_key, file_path, **kwargs)
    except requests.exceptions.RequestException as e:
        if hasattr(e, 'response') and e.response is not None:
            if e.response.status_code == 413:
                raise Exception("File too large. Maximum size is 1.7MB.")
            elif e.response.status_code == 415:
                raise Exception("Unsupported file type. Only images and videos are supported.")
            else:
                raise Exception(f"Upload failed: {e.response.status_code}")
        else:
            raise Exception(f"Network error: {e}")
```

**4. File Size Validation**

```python
import os

def validate_file_before_upload(file_path):
    # Check file size
    file_size = os.path.getsize(file_path)
    max_size = 1.7 * 1024 * 1024  # 1.7MB in bytes

    if file_size > max_size:
        raise ValueError(f"File size ({file_size/1024/1024:.2f}MB) exceeds limit (1.7MB)")

    # Check file type
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
                         '.mp4', '.mov', '.avi', '.mkv', '.webm'}

    file_extension = os.path.splitext(file_path)[1].lower()
    if file_extension not in allowed_extensions:
        raise ValueError(f"Unsupported file type: {file_extension}")

    return True

# Usage
try:
    validate_file_before_upload("./image.jpg")
    file_info = upload_file(api_key, "./image.jpg")
except ValueError as e:
    print(f"Validation error: {e}")
```

## Support

If you encounter any issues while using the Cocobase API, please:

1. Check the error response for detailed information
2. Verify your API key is correct and has proper permissions
3. Ensure your request format matches the examples provided
4. Contact our support team with specific error details

Happy coding with Cocobase! 🦕
