# Collections API

Collections are dynamic data storage containers. Think of them as tables in a traditional database, but with flexible schemas.

**Base URL:** `https://api.cocobase.buzz/collections`

**Authentication:** Requires `x-api-key` header

---

## Table of Contents

1. [List Collections](#list-collections)
2. [Get Collection Details](#get-collection-details)
3. [Create Document](#create-document)
4. [List Documents](#list-documents)
5. [Get Document](#get-document)
6. [Update Document](#update-document)
7. [Delete Document](#delete-document)
8. [Query Parameters](#query-parameters)
9. [Relationships](#relationships)
10. [File Uploads](#file-uploads)

---

## List Collections

Get all collections in your project.

### Endpoint

```http
GET /collections
```

### Request

```bash
curl -X GET "https://api.cocobase.buzz/collections" \
  -H "x-api-key: your-api-key"
```

### Response

```json
[
  {
    "id": "col_abc123",
    "name": "products",
    "created_at": "2025-11-04T10:00:00Z"
  },
  {
    "id": "col_def456",
    "name": "orders",
    "created_at": "2025-11-04T11:00:00Z"
  }
]
```

---

## Get Collection Details

Get information about a specific collection.

### Endpoint

```http
GET /collections/{collection_name}
```

### Request

```bash
curl -X GET "https://api.cocobase.buzz/collections/products" \
  -H "x-api-key: your-api-key"
```

### Response

```json
{
  "id": "col_abc123",
  "name": "products",
  "created_at": "2025-11-04T10:00:00Z",
  "document_count": 42
}
```

---

## Create Document

Add a new document to a collection. Supports JSON data and file uploads.

### Endpoint

```http
POST /collections/{collection_name}
```

### Basic Creation (JSON)

```bash
curl -X POST "https://api.cocobase.buzz/collections/products" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "category": "electronics",
    "in_stock": true,
    "tags": ["computer", "portable"]
  }'
```

### With File Uploads

```bash
curl -X POST "https://api.cocobase.buzz/collections/products" \
  -H "x-api-key: your-api-key" \
  -F 'data={"name":"Laptop","price":999.99}' \
  -F "image=@laptop.jpg" \
  -F "manual=@manual.pdf"
```

### JavaScript Example

```javascript
// Basic creation
const response = await fetch(
  "https://api.cocobase.buzz/collections/products",
  {
    method: "POST",
    headers: {
      "x-api-key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Laptop",
      price: 999.99,
      category: "electronics",
    }),
  }
);

// With file uploads
const formData = new FormData();
formData.append(
  "data",
  JSON.stringify({
    name: "Laptop",
    price: 999.99,
  })
);
formData.append("image", imageFile);
formData.append("manual", pdfFile);

const response = await fetch(
  "https://api.cocobase.buzz/collections/products",
  {
    method: "POST",
    headers: {
      "x-api-key": "your-api-key",
    },
    body: formData,
  }
);
```

### Response

```json
{
  "id": "doc_xyz789",
  "collection_id": "col_abc123",
  "data": {
    "name": "Laptop",
    "price": 999.99,
    "category": "electronics",
    "in_stock": true,
    "tags": ["computer", "portable"],
    "image": "https://storage.cocobase.buzz/files/image_abc123.jpg",
    "manual": "https://storage.cocobase.buzz/files/manual_def456.pdf"
  },
  "created_at": "2025-11-04T12:00:00Z",
  "updated_at": "2025-11-04T12:00:00Z"
}
```

---

## List Documents

Query documents from a collection with filtering, sorting, and pagination.

### Endpoint

```http
GET /collections/{collection_name}/documents
```

### Basic Query

```bash
curl -X GET "https://api.cocobase.buzz/collections/products/documents" \
  -H "x-api-key: your-api-key"
```

### With Filters

```bash
# Filter by exact match
curl -X GET "https://api.cocobase.buzz/collections/products/documents?category_eq=electronics" \
  -H "x-api-key: your-api-key"

# Filter by price range
curl -X GET "https://api.cocobase.buzz/collections/products/documents?price_gte=500&price_lte=1500" \
  -H "x-api-key: your-api-key"

# Filter by text search
curl -X GET "https://api.cocobase.buzz/collections/products/documents?name_contains=laptop" \
  -H "x-api-key: your-api-key"
```

### With Sorting

```bash
# Sort by price (ascending)
curl -X GET "https://api.cocobase.buzz/collections/products/documents?sort_by=price&sort_order=asc" \
  -H "x-api-key: your-api-key"

# Sort by created_at (descending)
curl -X GET "https://api.cocobase.buzz/collections/products/documents?sort_by=created_at&sort_order=desc" \
  -H "x-api-key: your-api-key"
```

### With Pagination

```bash
# Get 20 items per page
curl -X GET "https://api.cocobase.buzz/collections/products/documents?limit=20&offset=0" \
  -H "x-api-key: your-api-key"

# Get page 2
curl -X GET "https://api.cocobase.buzz/collections/products/documents?limit=20&offset=20" \
  -H "x-api-key: your-api-key"
```

### Response

```json
{
  "documents": [
    {
      "id": "doc_xyz789",
      "collection_id": "col_abc123",
      "data": {
        "name": "Laptop",
        "price": 999.99,
        "category": "electronics"
      },
      "created_at": "2025-11-04T12:00:00Z",
      "updated_at": "2025-11-04T12:00:00Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

---

## Get Document

Get a single document by ID.

### Endpoint

```http
GET /collections/{collection_name}/documents/{document_id}
```

### Request

```bash
curl -X GET "https://api.cocobase.buzz/collections/products/documents/doc_xyz789" \
  -H "x-api-key: your-api-key"
```

### Response

```json
{
  "id": "doc_xyz789",
  "collection_id": "col_abc123",
  "data": {
    "name": "Laptop",
    "price": 999.99,
    "category": "electronics",
    "in_stock": true
  },
  "created_at": "2025-11-04T12:00:00Z",
  "updated_at": "2025-11-04T12:00:00Z"
}
```

---

## Update Document

Update an existing document. Supports partial updates and file uploads.

### Endpoint

```http
PUT /collections/{collection_name}/documents/{document_id}
```

### Basic Update (JSON)

```bash
curl -X PUT "https://api.cocobase.buzz/collections/products/documents/doc_xyz789" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 899.99,
    "in_stock": false
  }'
```

### With File Uploads

```bash
curl -X PUT "https://api.cocobase.buzz/collections/products/documents/doc_xyz789" \
  -H "x-api-key: your-api-key" \
  -F 'data={"price":899.99}' \
  -F "image=@new_laptop_image.jpg"
```

### JavaScript Example

```javascript
// Basic update
const response = await fetch(
  "https://api.cocobase.buzz/collections/products/documents/doc_xyz789",
  {
    method: "PUT",
    headers: {
      "x-api-key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price: 899.99,
      in_stock: false,
    }),
  }
);

// With file upload
const formData = new FormData();
formData.append("data", JSON.stringify({ price: 899.99 }));
formData.append("image", newImageFile);

const response = await fetch(
  "https://api.cocobase.buzz/collections/products/documents/doc_xyz789",
  {
    method: "PUT",
    headers: {
      "x-api-key": "your-api-key",
    },
    body: formData,
  }
);
```

### Response

```json
{
  "id": "doc_xyz789",
  "collection_id": "col_abc123",
  "data": {
    "name": "Laptop",
    "price": 899.99,
    "category": "electronics",
    "in_stock": false,
    "image": "https://storage.cocobase.buzz/files/new_image_abc123.jpg"
  },
  "created_at": "2025-11-04T12:00:00Z",
  "updated_at": "2025-11-04T14:30:00Z"
}
```

---

## Delete Document

Delete a document from a collection.

### Endpoint

```http
DELETE /collections/{collection_name}/documents/{document_id}
```

### Request

```bash
curl -X DELETE "https://api.cocobase.buzz/collections/products/documents/doc_xyz789" \
  -H "x-api-key: your-api-key"
```

### Response

```json
{
  "message": "Document deleted successfully",
  "id": "doc_xyz789"
}
```

---

## Query Parameters

### Filter Operators

| Operator     | Description               | Example                              |
| ------------ | ------------------------- | ------------------------------------ |
| `_eq`        | Equal to                  | `?price_eq=999.99`                   |
| `_ne`        | Not equal to              | `?category_ne=electronics`           |
| `_gt`        | Greater than              | `?price_gt=500`                      |
| `_gte`       | Greater than or equal     | `?price_gte=500`                     |
| `_lt`        | Less than                 | `?price_lt=1000`                     |
| `_lte`       | Less than or equal        | `?price_lte=1000`                    |
| `_contains`  | Contains substring        | `?name_contains=laptop`              |
| `_icontains` | Case-insensitive contains | `?name_icontains=LAPTOP`             |
| `_in`        | Value in list             | `?category_in=electronics,computers` |
| `_isnull`    | Is null/not null          | `?description_isnull=true`           |

### Pagination

| Parameter | Type    | Default | Max | Description         |
| --------- | ------- | ------- | --- | ------------------- |
| `limit`   | integer | 50      | 500 | Items per page      |
| `offset`  | integer | 0       | -   | Items to skip       |
| `count`   | boolean | true    | -   | Include total count |

### Sorting

| Parameter    | Type   | Description      |
| ------------ | ------ | ---------------- |
| `sort_by`    | string | Field to sort by |
| `sort_order` | string | `asc` or `desc`  |

### Performance Optimization

```bash
# Skip count calculation (faster for large datasets)
curl -X GET "https://api.cocobase.buzz/collections/products/documents?offset=20&count=false" \
  -H "x-api-key: your-api-key"
```

---

## Relationships

Link documents across collections using relationship fields.

### Define Relationships

```bash
# Create product with category relationship
curl -X POST "https://api.cocobase.buzz/collections/products" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "category_id": "doc_cat_123"
  }'
```

### Populate Relationships

```bash
# Get product with category details
curl -X GET "https://api.cocobase.buzz/collections/products/documents?populate=category" \
  -H "x-api-key: your-api-key"
```

### Response with Populated Relationship

```json
{
  "documents": [
    {
      "id": "doc_xyz789",
      "data": {
        "name": "Laptop",
        "category_id": "doc_cat_123",
        "category": {
          "id": "doc_cat_123",
          "data": {
            "name": "Electronics",
            "slug": "electronics"
          }
        }
      }
    }
  ]
}
```

### Filter by Relationship

```bash
# Get products where category name is "Electronics"
curl -X GET "https://api.cocobase.buzz/collections/products/documents?category.name_eq=Electronics&populate=category" \
  -H "x-api-key: your-api-key"
```

---

## File Uploads

### Supported File Types

- **Images**: jpg, jpeg, png, gif, webp, svg
- **Documents**: pdf, doc, docx, txt, csv
- **Archives**: zip, tar, gz
- **Other**: Any file type (max 50MB per file)

### Upload Multiple Files

```bash
curl -X POST "https://api.cocobase.buzz/collections/products" \
  -H "x-api-key: your-api-key" \
  -F 'data={"name":"Laptop","price":999.99}' \
  -F "image=@laptop.jpg" \
  -F "thumbnail=@laptop_thumb.jpg" \
  -F "manual=@manual.pdf" \
  -F "specs=@specs.csv"
```

### File URLs in Response

```json
{
  "id": "doc_xyz789",
  "data": {
    "name": "Laptop",
    "price": 999.99,
    "image": "https://storage.cocobase.buzz/files/image_abc123.jpg",
    "thumbnail": "https://storage.cocobase.buzz/files/thumb_def456.jpg",
    "manual": "https://storage.cocobase.buzz/files/manual_ghi789.pdf",
    "specs": "https://storage.cocobase.buzz/files/specs_jkl012.csv"
  }
}
```

### Replace Files on Update

```bash
# Old image is automatically deleted
curl -X PUT "https://api.cocobase.buzz/collections/products/documents/doc_xyz789" \
  -H "x-api-key: your-api-key" \
  -F "image=@new_laptop_image.jpg"
```

### File Storage Details

- **Provider**: Backblaze B2
- **Max Size**: 50MB per file
- **CDN**: Automatic CDN distribution
- **Lifecycle**: Files are deleted when document is deleted

---

## Complete Examples

### E-commerce Product Catalog

```javascript
// 1. Create products
const products = [
  { name: "Laptop", price: 999.99, category: "electronics", stock: 5 },
  { name: "Mouse", price: 29.99, category: "electronics", stock: 50 },
  { name: "Desk", price: 299.99, category: "furniture", stock: 10 },
];

for (const product of products) {
  await fetch("https://api.cocobase.buzz/collections/products", {
    method: "POST",
    headers: {
      "x-api-key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
}

// 2. Query products
const response = await fetch(
  "https://api.cocobase.buzz/collections/products/documents?" +
    "category_eq=electronics&" +
    "price_lte=1000&" +
    "sort_by=price&" +
    "sort_order=asc",
  {
    headers: { "x-api-key": "your-api-key" },
  }
);

const { documents, total } = await response.json();

// 3. Update stock
await fetch(
  "https://api.cocobase.buzz/collections/products/documents/doc_xyz789",
  {
    method: "PUT",
    headers: {
      "x-api-key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stock: 4 }),
  }
);
```

### Blog with Images

```javascript
// Create blog post with image
const formData = new FormData();
formData.append(
  "data",
  JSON.stringify({
    title: "My First Post",
    content: "Lorem ipsum...",
    author: "John Doe",
    published: true,
  })
);
formData.append("featured_image", imageFile);
formData.append("thumbnail", thumbnailFile);

const response = await fetch(
  "https://api.cocobase.buzz/collections/blog_posts",
  {
    method: "POST",
    headers: {
      "x-api-key": "your-api-key",
    },
    body: formData,
  }
);

// Query published posts
const posts = await fetch(
  "https://api.cocobase.buzz/collections/blog_posts/documents?" +
    "published_eq=true&" +
    "sort_by=created_at&" +
    "sort_order=desc&" +
    "limit=10",
  {
    headers: { "x-api-key": "your-api-key" },
  }
);
```

---

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Invalid query parameter: price_invalid"
}
```

### 404 Not Found

```json
{
  "detail": "Collection 'products' not found"
}
```

### 413 Payload Too Large

```json
{
  "detail": "File size exceeds 50MB limit"
}
```

### 422 Validation Error

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

---

## Performance Tips

1. **Skip count on pagination**: Add `&count=false` when you don't need total count
2. **Use indexes**: Fields used in filters are automatically indexed
3. **Limit results**: Use reasonable `limit` values (default: 50, max: 500)
4. **Populate wisely**: Only populate relationships you need
5. **Cache aggressively**: Documents don't change unless you update them

---

## Rate Limits

- **Free Plan**: 1,000 requests/hour
- **Pro Plan**: 10,000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699027200
```
