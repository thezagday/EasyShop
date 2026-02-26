# User Features

## Overview

Registered users have access to personalized features that enhance their shopping experience:
- **Personal AI Context**: Customize AI recommendations based on dietary preferences and restrictions
- **Activity History**: View all past queries, routes, and purchases
- **Statistics**: Track spending and route metrics over time
- **Personal Collections**: Create and manage custom product lists

## 3.1 User Context (AI Preferences)

### Description
Users can set personal preferences that influence AI assistant recommendations. This context is combined with shop context to provide highly personalized product suggestions.

### Examples
```
Избегай молочки, так как у меня непереносимость лактозы
```
```
Предпочитаю органические продукты, избегаю глютен
```
```
Вегетарианец, не ем мясо и рыбу
```

### API Endpoints

#### Get User Context
```http
GET /api/user/context
Authorization: Bearer {token}
```

**Response:**
```json
{
  "userContext": "Избегай молочки, так как у меня непереносимость лактозы"
}
```

#### Update User Context
```http
PUT /api/user/context
Authorization: Bearer {token}
Content-Type: application/json

{
  "userContext": "Избегай молочки и глютен"
}
```

**Response:**
```json
{
  "success": true,
  "userContext": "Избегай молочки и глютен"
}
```

### How It Works

When user makes AI request with `userId` parameter:
```http
POST /api/ai
Content-Type: application/json

{
  "shopId": 1,
  "message": "Нужны продукты на завтрак",
  "userId": 42
}
```

The AI prompt combines:
1. **Shop context**: "Это органик-магазин с фермерскими продуктами"
2. **User context**: "Избегай молочки, так как у меня непереносимость лактозы"

Result: AI recommends breakfast items excluding dairy products.

## 3.2 Activity History

### Description
All user interactions are tracked in `user_activity` table:
- AI queries
- Generated routes
- Distance and time metrics
- Cost tracking
- Purchased items

### API Endpoint

```http
GET /api/user/history?shopId={shopId}&limit={limit}
Authorization: Bearer {token}
```

**Query Parameters:**
- `shopId` (optional): Filter by specific shop
- `limit` (optional, default 50, max 100): Number of records

**Response:**
```json
{
  "history": [
    {
      "id": 123,
      "query": "Нужны продукты на неделю",
      "shopId": 1,
      "shopTitle": "Пятёрочка",
      "routeCategories": ["Молочные", "Овощи", "Хлеб"],
      "routeDistance": 450,
      "routeTime": 6,
      "routeCost": "1250.50",
      "purchasedItems": [
        {"title": "Молоко", "price": "85.00"},
        {"title": "Хлеб", "price": "45.00"}
      ],
      "createdAt": "2026-02-25T14:30:00+03:00"
    }
  ],
  "total": 1
}
```

### Data Structure

**UserActivity Entity Fields:**
- `query` - User's original AI query
- `routeCategories` - Array of visited category names
- `routeDistanceMeters` - Total route distance in meters
- `routeTimeMinutes` - Estimated route time in minutes
- `routeCost` - Total cost of purchased items (DECIMAL 10,2)
- `purchasedItems` - JSON array of items with prices
- `createdAt` - Timestamp

## 3.3 Personal Collections

### Description
Users can create custom product collections that appear in the shop's collection list. Each collection belongs to a specific shop and user.

### API Endpoints

#### List User Collections
```http
GET /api/user/collections?shopId={shopId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "collections": [
    {
      "id": 1,
      "title": "Мой завтрак",
      "description": "Продукты для завтрака на неделю",
      "emoji": "🍳",
      "active": true,
      "shopId": 1,
      "commodities": [
        {"id": 10, "title": "Яйца"},
        {"id": 15, "title": "Хлеб"}
      ],
      "commodityCount": 2
    }
  ],
  "total": 1
}
```

#### Create Collection
```http
POST /api/user/collections
Authorization: Bearer {token}
Content-Type: application/json

{
  "shopId": 1,
  "title": "Мой завтрак",
  "description": "Продукты для завтрака",
  "emoji": "🍳",
  "active": true,
  "sortOrder": 0
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "collection": {
    "id": 1,
    "title": "Мой завтрак",
    "description": "Продукты для завтрака",
    "emoji": "🍳",
    "active": true,
    "shopId": 1
  }
}
```

#### Update Collection
```http
PATCH /api/user/collections/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Обновленное название",
  "active": false
}
```

#### Delete Collection
```http
DELETE /api/user/collections/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true
}
```

#### Add Commodity to Collection
```http
POST /api/user/collections/{id}/commodities
Authorization: Bearer {token}
Content-Type: application/json

{
  "commodityId": 42
}
```

#### Remove Commodity from Collection
```http
DELETE /api/user/collections/{id}/commodities/{commodityId}
Authorization: Bearer {token}
```

### Access Control
- Users can only manage their own collections
- Attempting to modify another user's collection returns `403 Forbidden`
- Shop-wide collections (created by admin, `user_id = NULL`) are read-only for users

## 3.4 Spending Statistics

### Description
Track total and average spending across all routes for analytics and budgeting.

### API Endpoint

```http
GET /api/user/stats?shopId={shopId}
Authorization: Bearer {token}
```

**Query Parameters:**
- `shopId` (optional): Filter statistics by specific shop

**Response:**
```json
{
  "totalRoutes": 15,
  "totalDistanceMeters": 6750,
  "totalTimeMinutes": 90,
  "totalCost": "18750.25",
  "averageDistanceMeters": 450,
  "averageTimeMinutes": 6,
  "averageCost": "1250.02"
}
```

### Metrics Explained
- **totalRoutes**: Number of completed routes (where `routeDistanceMeters` is not null)
- **totalDistanceMeters**: Sum of all route distances
- **totalTimeMinutes**: Sum of all route times
- **totalCost**: Sum of all purchases (formatted as string with 2 decimals)
- **averageDistanceMeters**: Average distance per route
- **averageTimeMinutes**: Average time per route
- **averageCost**: Average spending per route

### Use Cases
1. **Budget tracking**: Monitor how much you typically spend per shopping trip
2. **Route optimization**: See if using EasyShop reduces your walking distance over time
3. **Time savings**: Track minutes saved compared to unoptimized shopping
4. **Shop comparison**: Compare stats between different shops

## Database Schema

### User Table
```sql
ALTER TABLE user ADD user_context LONGTEXT DEFAULT NULL;
```

### ProductCollection Table
```sql
ALTER TABLE product_collection ADD user_id INT DEFAULT NULL;
ALTER TABLE product_collection ADD CONSTRAINT FK_F92E371AA76ED395 
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE;
CREATE INDEX IDX_F92E371AA76ED395 ON product_collection (user_id);
```

### UserActivity Table
```sql
ALTER TABLE user_activity ADD route_cost NUMERIC(10, 2) DEFAULT NULL;
ALTER TABLE user_activity ADD purchased_items JSON DEFAULT NULL;
```

Migration: `migrations/Version20260225130000.php`

## Security

All endpoints require authentication via `#[IsGranted('ROLE_USER')]`.

Users can only access their own:
- Context
- History
- Collections
- Statistics

## Frontend Integration Example

```javascript
// Update user preferences
async function updateUserContext(context) {
  const response = await fetch('/api/user/context', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userContext: context })
  });
  return response.json();
}

// Get spending stats
async function getStats(shopId) {
  const response = await fetch(`/api/user/stats?shopId=${shopId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

// Create collection
async function createCollection(shopId, title) {
  const response = await fetch('/api/user/collections', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ shopId, title, emoji: '📝' })
  });
  return response.json();
}
```

## Best Practices

1. **User Context**: Keep it concise (2-3 sentences), focus on restrictions/preferences
2. **Collections**: Use descriptive titles and emojis for better UX
3. **Cost Tracking**: Update `routeCost` and `purchasedItems` when user completes purchase
4. **Privacy**: Never expose one user's data to another user
5. **Performance**: Use `limit` parameter for history queries to avoid large responses
