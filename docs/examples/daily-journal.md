---
sidebar_position: 2
title: Daily Journal App
---

# Daily Journal App Example

Build a daily journal application with COCOBASE to practice CRUD operations and authentication.

## Features

- User authentication (register/login)
- Create daily journal entries
- View all entries
- Edit and delete entries
- Search entries by date or content
- Rich text editing

## Project Setup

```bash
npm create vite@latest daily-journal -- --template react-ts
cd daily-journal
npm install coco_base_js
npm install
```

## Database Structure

### Collections

**users**

- id
- email
- name
- created_at

**entries**

- id
- user_id (relationship to users)
- title
- content
- mood
- date
- created_at
- updated_at

## Implementation

### 1. Initialize Cocobase

```typescript
// lib/cocobase.ts
import { Cocobase } from "coco_base_js";

export const db = new Cocobase({
  apiKey: import.meta.env.VITE_COCOBASE_API_KEY,
});
```

### 2. Authentication

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { db } from "../lib/cocobase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const isAuth = await db.isAuthenticated();
    if (isAuth) {
      setUser(db.user);
    }
    setLoading(false);
  }

  async function register(email: string, password: string, name: string) {
    await db.register(email, password, { name });
    setUser(db.user);
  }

  async function login(email: string, password: string) {
    await db.login(email, password);
    setUser(db.user);
  }

  function logout() {
    db.logout();
    setUser(null);
  }

  return { user, loading, register, login, logout };
}
```

### 3. Journal Entries Component

```typescript
// components/JournalEntries.tsx
import { useState, useEffect } from "react";
import { db } from "../lib/cocobase";
import { buildFilterQuery } from "coco_base_js";

interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string;
  date: string;
  created_at: string;
}

export function JournalEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();

    // Subscribe to real-time updates
    const connection = db.watchCollection("entries", (event) => {
      if (event.event === "create") {
        setEntries((prev) => [event.data, ...prev]);
      } else if (event.event === "update") {
        setEntries((prev) =>
          prev.map((e) => (e.id === event.data.id ? event.data : e))
        );
      } else if (event.event === "delete") {
        setEntries((prev) => prev.filter((e) => e.id !== event.data.id));
      }
    });

    return () => db.closeConnection("entries-connection");
  }, []);

  async function loadEntries() {
    const query = buildFilterQuery({
      filters: {
        user_id: db.user?.id,
      },
      sort: "date",
      order: "desc",
      limit: 50,
    });

    const response = await fetch(
      `https://api.cocobase.buzz/collections/entries/documents?${query}`,
      {
        headers: { "X-API-Key": import.meta.env.VITE_COCOBASE_API_KEY },
      }
    );

    const data = await response.json();
    setEntries(data.data || []);
    setLoading(false);
  }

  async function deleteEntry(id: string) {
    if (confirm("Delete this entry?")) {
      await db.deleteDocument("entries", id);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="entries">
      {entries.map((entry) => (
        <div key={entry.id} className="entry-card">
          <div className="entry-header">
            <h3>{entry.title}</h3>
            <span className="mood">{entry.mood}</span>
          </div>
          <p className="date">{new Date(entry.date).toLocaleDateString()}</p>
          <p className="content">{entry.content}</p>
          <div className="actions">
            <button onClick={() => editEntry(entry)}>Edit</button>
            <button onClick={() => deleteEntry(entry.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Create Entry Form

```typescript
// components/CreateEntry.tsx
import { useState } from "react";
import { db } from "../lib/cocobase";

export function CreateEntry() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("😊");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await db.createDocument("entries", {
      user_id: db.user?.id,
      title,
      content,
      mood,
      date,
      created_at: new Date().toISOString(),
    });

    // Reset form
    setTitle("");
    setContent("");
    setMood("😊");
    setDate(new Date().toISOString().split("T")[0]);
  }

  return (
    <form onSubmit={handleSubmit} className="create-entry">
      <input
        type="text"
        placeholder="Entry title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        required
      />

      <div className="form-row">
        <label>
          Mood:
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="😊">😊 Happy</option>
            <option value="😔">😔 Sad</option>
            <option value="😡">😡 Angry</option>
            <option value="😰">😰 Anxious</option>
            <option value="😌">😌 Calm</option>
            <option value="😴">😴 Tired</option>
          </select>
        </label>

        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
      </div>

      <button type="submit">Save Entry</button>
    </form>
  );
}
```

## Features to Add

- **Search**: Filter entries by content or date range
- **Tags**: Add tags to categorize entries
- **Export**: Export entries to PDF or markdown
- **Analytics**: Show mood trends over time
- **Reminders**: Daily notification to write an entry
- **Rich Text**: Add markdown or rich text support

## Next Steps

- [E-commerce Example](./e-commerce) - Build a shopping app
- [API Documentation](../api/introduction) - Learn the API
- [JavaScript SDK](../javascript/introduction) - SDK documentation
