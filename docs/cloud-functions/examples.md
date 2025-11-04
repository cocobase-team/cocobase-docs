---
sidebar_position: 3
---

# Examples

Complete working examples for common use cases.

## E-Commerce

### Product Search with Filters

```python
def main():
    # Get search parameters
    category = req.get("category")
    min_price = req.get("min_price", "0")
    max_price = req.get("max_price", "10000")
    search = req.get("search", "")
    in_stock = req.get("in_stock", "true")

    # Build filters
    filters = {
        "status": "active",
        "price_gte": min_price,
        "price_lte": max_price
    }

    if in_stock == "true":
        filters["stock_gt"] = "0"

    if category:
        filters["category_id"] = category

    # Search in name or description
    if search:
        filters["[or]name_contains"] = search
        filters["[or]description_contains"] = search

    # Query products
    products = db.query("products", **filters,
        populate=["category", "brand"],
        sort="popularity",
        order="desc",
        limit=24
    )

    return {
        "products": products["data"],
        "total": products["total"],
        "page": 1,
        "has_more": products["has_more"]
    }
```

### Shopping Cart with Product Details

```python
def main():
    user_id = req.get("user_id")

    # Get user's cart
    cart = db.find_one("carts",
        user_id=user_id,
        populate=["items.product"]  # Nested population
    )

    if not cart:
        return {"cart": {"items": [], "total": 0}}

    # Calculate totals
    total = sum(item["quantity"] * item["product"]["price"]
                for item in cart.get("items", []))

    return {
        "cart": cart,
        "total": total,
        "item_count": len(cart.get("items", []))
    }
```

### Order History

```python
def main():
    user_id = req.get("user_id")
    status = req.get("status")  # pending, shipped, delivered

    filters = {"customer_id": user_id}

    if status:
        filters["status"] = status

    orders = db.query("orders", **filters,
        populate=["products", "shipping_address"],
        sort="created_at",
        order="desc",
        limit=20
    )

    return {
        "orders": orders["data"],
        "total": orders["total"]
    }
```

## Social Media

### User Feed

```python
def main():
    user_id = req.get("user_id")
    page = int(req.get("page", "1"))
    per_page = 20

    # Get users this user follows
    following = db.get_user_relationships(user_id, "following")
    following_ids = [u["id"] for u in following["data"]]

    # Add user's own posts
    following_ids.append(user_id)

    # Build OR filter for posts from followed users
    filters = {"status": "published"}
    for idx, followed_id in enumerate(following_ids[:50]):
        filters[f"[or:authors]author_id_{idx}"] = followed_id

    # Get feed
    feed = db.query("posts", **filters,
        populate=["author", "attachments"],
        sort="created_at",
        order="desc",
        limit=per_page,
        offset=(page - 1) * per_page
    )

    return {
        "feed": feed["data"],
        "page": page,
        "has_more": feed["has_more"]
    }
```

### User Profile

```python
def main():
    profile_id = req.get("profile_id")
    viewer_id = req.get("viewer_id")  # Current user

    # Get user info
    user = db.find_user(id=profile_id, populate=["company"])

    if not user:
        return {"error": "User not found"}, 404

    # Get stats
    followers = db.get_user_relationships(profile_id, "followers")
    following = db.get_user_relationships(profile_id, "following")

    # Get user's posts
    posts = db.get_user_collections(
        profile_id, "posts",
        filters={"status": "published"},
        populate=["attachments"],
        limit=10
    )

    # Check viewer's relationship with this user
    relationship = {}
    if viewer_id and viewer_id != profile_id:
        viewer_following = db.get_user_relationships(viewer_id, "following")
        viewer_friends = db.get_user_relationships(viewer_id, "friends")

        relationship = {
            "is_following": profile_id in [u["id"] for u in viewer_following["data"]],
            "are_friends": profile_id in [u["id"] for u in viewer_friends["data"]]
        }

    return {
        "user": user,
        "stats": {
            "followers": followers["total"],
            "following": following["total"],
            "posts": posts["total"]
        },
        "recent_posts": posts["data"],
        "relationship": relationship
    }
```

### Follow/Unfollow System

```python
def main():
    action = req.get("action")
    user_id = req.get("user_id")
    target_id = req.get("target_id")

    if not user_id or not target_id:
        return {"error": "user_id and target_id required"}, 400

    if user_id == target_id:
        return {"error": "Cannot follow yourself"}, 400

    if action == "follow":
        result = db.add_user_relationship(user_id, target_id, "following")
        return {"success": True, "message": "Followed successfully"}

    elif action == "unfollow":
        result = db.remove_user_relationship(user_id, target_id, "following")
        return {"success": True, "message": "Unfollowed successfully"}

    elif action == "is_following":
        following = db.get_user_relationships(user_id, "following")
        is_following = target_id in [u["id"] for u in following["data"]]
        return {"is_following": is_following}

    elif action == "get_followers":
        return db.get_user_relationships(target_id, "followers", limit=50)

    elif action == "get_following":
        return db.get_user_relationships(target_id, "following", limit=50)

    else:
        return {"error": "Invalid action"}, 400
```

### Like/Unlike Post

```python
def main():
    action = req.get("action")
    user_id = req.get("user_id")
    post_id = req.get("post_id")

    if action == "like":
        # Check if already liked
        existing = db.find_one("likes",
            user_id=user_id,
            post_id=post_id
        )

        if existing:
            return {"error": "Already liked"}, 400

        # Create like
        like = db.create_document("likes", {
            "user_id": user_id,
            "post_id": post_id,
            "created_at": datetime.utcnow().isoformat()
        })

        return {"success": True, "like": like}

    elif action == "unlike":
        # Find and delete like
        like = db.find_one("likes",
            user_id=user_id,
            post_id=post_id
        )

        if not like:
            return {"error": "Not liked"}, 404

        db.delete_document("likes", like["id"])
        return {"success": True}

    elif action == "has_liked":
        like = db.find_one("likes",
            user_id=user_id,
            post_id=post_id
        )
        return {"has_liked": like is not None}

    elif action == "get_likes":
        likes = db.query("likes",
            post_id=post_id,
            populate=["user"],
            limit=50
        )
        return {"likes": likes["data"], "total": likes["total"]}
```

## Blog/CMS

### Blog Post Search

```python
def main():
    keyword = req.get("keyword", "")
    category = req.get("category")
    author_id = req.get("author_id")
    tags = req.get("tags", "").split(",") if req.get("tags") else []
    page = int(req.get("page", "1"))
    per_page = 20

    # Build filters
    filters = {"status": "published"}

    # Search in title or content
    if keyword:
        filters["[or:search]title_contains"] = keyword
        filters["[or:search]content_contains"] = keyword
        filters["[or:search]excerpt_contains"] = keyword

    # Filter by category
    if category:
        filters["category_id"] = category

    # Filter by author
    if author_id:
        filters["author_id"] = author_id

    # Filter by tags (any tag matches)
    if tags:
        for idx, tag in enumerate(tags):
            filters[f"[or:tags]tag_ids_{idx}"] = tag

    # Query posts
    posts = db.query("posts", **filters,
        populate=["author", "category", "tags"],
        sort="published_at",
        order="desc",
        limit=per_page,
        offset=(page - 1) * per_page
    )

    return {
        "posts": posts["data"],
        "total": posts["total"],
        "page": page,
        "total_pages": (posts["total"] + per_page - 1) // per_page
    }
```

### Related Posts

```python
def main():
    post_id = req.get("post_id")

    # Get current post
    post = db.find_one("posts", id=post_id)

    if not post:
        return {"error": "Post not found"}, 404

    # Get related posts (same category or tags)
    filters = {
        "status": "published",
        "id_ne": post_id  # Exclude current post
    }

    # Same category OR any matching tags
    if post.get("category_id"):
        filters["[or:related]category_id"] = post["category_id"]

    if post.get("tag_ids"):
        for idx, tag_id in enumerate(post["tag_ids"][:5]):
            filters[f"[or:related]tag_ids_{idx}"] = tag_id

    related = db.query("posts", **filters,
        populate=["author", "category"],
        sort="views",
        order="desc",
        limit=5
    )

    return {"related_posts": related["data"]}
```

### Post with Comments

```python
def main():
    post_id = req.get("post_id")

    # Get post
    post = db.find_one("posts",
        id=post_id,
        populate=["author", "category", "tags"]
    )

    if not post:
        return {"error": "Post not found"}, 404

    # Get comments
    comments = db.query("comments",
        post_id=post_id,
        parent_id_isnull="true",  # Top-level comments only
        populate=["author", "replies"],
        sort="created_at",
        order="asc",
        limit=50
    )

    # Get comment count
    all_comments = db.query("comments",
        post_id=post_id,
        select=["id"]
    )

    return {
        "post": post,
        "comments": comments["data"],
        "comment_count": all_comments["total"]
    }
```

## Project Management

### Task Board

```python
def main():
    project_id = req.get("project_id")
    status = req.get("status")  # todo, in_progress, done
    assignee_id = req.get("assignee_id")

    filters = {"project_id": project_id}

    if status:
        filters["status"] = status

    if assignee_id:
        filters["assignee_id"] = assignee_id

    tasks = db.query("tasks", **filters,
        populate=["assignee", "created_by", "labels"],
        sort="priority",
        order="desc",
        limit=100
    )

    # Group by status
    grouped = {
        "todo": [],
        "in_progress": [],
        "done": []
    }

    for task in tasks["data"]:
        status = task.get("status", "todo")
        if status in grouped:
            grouped[status].append(task)

    return {
        "tasks": tasks["data"],
        "grouped": grouped,
        "total": tasks["total"]
    }
```

### Team Members

```python
def main():
    team_id = req.get("team_id")

    # Get team
    team = db.find_one("teams", id=team_id)

    if not team:
        return {"error": "Team not found"}, 404

    # Get team members
    members = db.get_user_relationships(
        team_id, "members",
        populate=["role", "department"],
        limit=100
    )

    # Get team projects
    projects = db.query("projects",
        team_id=team_id,
        populate=["lead"],
        sort="created_at",
        order="desc",
        limit=20
    )

    return {
        "team": team,
        "members": members["data"],
        "member_count": members["total"],
        "projects": projects["data"],
        "project_count": projects["total"]
    }
```

## Analytics

### User Activity Dashboard

```python
def main():
    user_id = req.get("user_id")
    days = int(req.get("days", "30"))

    from datetime import datetime, timedelta

    start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

    # Get user's content
    posts = db.get_user_collections(
        user_id, "posts",
        filters={"created_at_gte": start_date}
    )

    comments = db.get_user_collections(
        user_id, "comments",
        filters={"created_at_gte": start_date}
    )

    likes = db.get_user_collections(
        user_id, "likes",
        filters={"created_at_gte": start_date}
    )

    # Get engagement on user's posts
    user_posts = db.get_user_collections(
        user_id, "posts",
        select=["id"]
    )
    post_ids = [p["id"] for p in user_posts["data"]]

    post_likes = 0
    post_comments = 0

    if post_ids:
        # Count likes on user's posts
        for post_id in post_ids[:100]:  # Limit for performance
            likes_result = db.query("likes", post_id=post_id, select=["id"])
            post_likes += likes_result["total"]

            comments_result = db.query("comments", post_id=post_id, select=["id"])
            post_comments += comments_result["total"]

    return {
        "period_days": days,
        "activity": {
            "posts_created": posts["total"],
            "comments_made": comments["total"],
            "likes_given": likes["total"]
        },
        "engagement": {
            "likes_received": post_likes,
            "comments_received": post_comments
        }
    }
```

### Popular Content

```python
def main():
    collection = req.get("collection", "posts")
    period = req.get("period", "week")  # day, week, month, all
    limit = int(req.get("limit", "10"))

    from datetime import datetime, timedelta

    filters = {"status": "published"}

    # Set date filter based on period
    if period == "day":
        start_date = (datetime.utcnow() - timedelta(days=1)).isoformat()
        filters["created_at_gte"] = start_date
    elif period == "week":
        start_date = (datetime.utcnow() - timedelta(weeks=1)).isoformat()
        filters["created_at_gte"] = start_date
    elif period == "month":
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
        filters["created_at_gte"] = start_date

    # Get popular content
    content = db.query(collection, **filters,
        populate=["author", "category"],
        sort="views",
        order="desc",
        limit=limit
    )

    return {
        "popular_content": content["data"],
        "period": period,
        "total": content["total"]
    }
```

## See Also

- [Database API Reference](./database-api.md) - Complete API documentation
- [Quick Reference](./quick-reference.md) - Quick lookup guide
- `examples/advanced_query_examples.py` - 10+ collection examples
- `examples/user_relationship_examples.py` - 10+ user relationship examples
