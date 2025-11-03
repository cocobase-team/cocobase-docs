---
sidebar_position: 3
title: E-commerce App
---

# E-commerce Application Example

Build a complete e-commerce application with COCOBASE featuring product management, shopping cart, and order processing.

## Features

- Product catalog with categories
- Shopping cart functionality
- User authentication
- Order management
- Product search and filtering
- Real-time inventory updates

## Database Structure

### Collections

**products**

- id
- name
- description
- price
- category_id (relationship to categories)
- images
- inStock
- quantity
- created_at

**categories**

- id
- name
- slug
- description

**cart_items**

- id
- user_id (relationship to users)
- product_id (relationship to products)
- quantity
- added_at

**orders**

- id
- user_id (relationship to users)
- items
- total
- status (pending, processing, shipped, delivered)
- shipping_address
- created_at

## Implementation

### 1. Product Listing

```typescript
import { buildFilterQuery } from "coco_base_js";

async function getProducts(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}) {
  const queryFilters: any = {};

  if (filters.category) {
    queryFilters["category.slug"] = filters.category;
  }

  if (filters.minPrice) {
    queryFilters.price_gte = filters.minPrice;
  }

  if (filters.maxPrice) {
    queryFilters.price_lte = filters.maxPrice;
  }

  if (filters.inStock) {
    queryFilters.inStock = true;
  }

  const query = buildFilterQuery({
    filters: queryFilters,
    populate: "category",
    sort: "name",
    order: "asc",
    limit: 50,
  });

  const response = await fetch(
    `https://api.cocobase.buzz/collections/products/documents?${query}`,
    {
      headers: { "X-API-Key": process.env.COCOBASE_API_KEY },
    }
  );

  return await response.json();
}
```

### 2. Shopping Cart

```typescript
// hooks/useCart.ts
import { useState, useEffect } from "react";
import { db } from "../lib/cocobase";
import { buildFilterQuery } from "coco_base_js";

export function useCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (db.isAuthenticated()) {
      loadCart();
      subscribeToCartChanges();
    }
  }, []);

  async function loadCart() {
    const query = buildFilterQuery({
      filters: {
        user_id: db.user?.id,
      },
      populate: "product",
    });

    const response = await fetch(
      `https://api.cocobase.buzz/collections/cart_items/documents?${query}`,
      {
        headers: { "X-API-Key": process.env.COCOBASE_API_KEY },
      }
    );

    const data = await response.json();
    setItems(data.data || []);
    setLoading(false);
  }

  function subscribeToCartChanges() {
    db.watchCollection("cart_items", (event) => {
      if (event.data.user_id === db.user?.id) {
        loadCart();
      }
    });
  }

  async function addToCart(productId: string, quantity: number = 1) {
    // Check if item already in cart
    const existing = items.find((item) => item.product_id === productId);

    if (existing) {
      await db.updateDocument("cart_items", existing.id, {
        quantity: existing.quantity + quantity,
      });
    } else {
      await db.createDocument("cart_items", {
        user_id: db.user?.id,
        product_id: productId,
        quantity,
        added_at: new Date().toISOString(),
      });
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await db.updateDocument("cart_items", itemId, { quantity });
    }
  }

  async function removeFromCart(itemId: string) {
    await db.deleteDocument("cart_items", itemId);
  }

  async function clearCart() {
    await Promise.all(
      items.map((item) => db.deleteDocument("cart_items", item.id))
    );
  }

  const total = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return {
    items,
    loading,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
```

### 3. Checkout Process

```typescript
// components/Checkout.tsx
import { useState } from "react";
import { db } from "../lib/cocobase";
import { useCart } from "../hooks/useCart";

export function Checkout() {
  const { items, total, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();

    // Create order
    const order = await db.createDocument("orders", {
      user_id: db.user?.id,
      items: items.map((item) => ({
        product_id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total,
      status: "pending",
      shipping_address: shippingAddress,
      created_at: new Date().toISOString(),
    });

    // Clear cart
    await clearCart();

    // Redirect to order confirmation
    window.location.href = `/orders/${order.id}`;
  }

  return (
    <form onSubmit={handleCheckout}>
      <h2>Shipping Address</h2>

      <input
        type="text"
        placeholder="Street Address"
        value={shippingAddress.street}
        onChange={(e) =>
          setShippingAddress({
            ...shippingAddress,
            street: e.target.value,
          })
        }
        required
      />

      <input
        type="text"
        placeholder="City"
        value={shippingAddress.city}
        onChange={(e) =>
          setShippingAddress({
            ...shippingAddress,
            city: e.target.value,
          })
        }
        required
      />

      {/* More address fields... */}

      <div className="order-summary">
        <h3>Order Summary</h3>
        {items.map((item) => (
          <div key={item.id}>
            <span>
              {item.product.name} x {item.quantity}
            </span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="total">
          <strong>Total:</strong>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>

      <button type="submit">Place Order</button>
    </form>
  );
}
```

### 4. Product Search

```typescript
// hooks/useProductSearch.ts
import { useState, useEffect } from "react";
import { buildFilterQuery } from "coco_base_js";

export function useProductSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchProducts();
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  async function searchProducts() {
    setLoading(true);

    const query = buildFilterQuery({
      filters: {
        name__or__description_contains: searchTerm,
        inStock: true,
      },
      populate: "category",
      limit: 20,
    });

    const response = await fetch(
      `https://api.cocobase.buzz/collections/products/documents?${query}`,
      {
        headers: { "X-API-Key": process.env.COCOBASE_API_KEY },
      }
    );

    const data = await response.json();
    setResults(data.data || []);
    setLoading(false);
  }

  return { searchTerm, setSearchTerm, results, loading };
}
```

## Features to Add

- **Payment Integration**: Add Stripe or PayPal
- **Reviews**: Product reviews and ratings
- **Wishlist**: Save products for later
- **Inventory Management**: Admin dashboard for stock
- **Promotions**: Discount codes and sales
- **Order Tracking**: Real-time order status updates
- **Email Notifications**: Order confirmations and updates

## Next Steps

- [Sample Project](./sample-project) - See more examples
- [JavaScript SDK](../javascript/introduction) - Full SDK documentation
- [API Reference](../api/introduction) - REST API docs
