# PlusDate Backend API Documentation

## Overview

The backend exposes a JSON REST-like API for the PlusDate Telegram Mini App.

Base API prefix:

```text
/api
```

Authentication:

- public endpoints: login, payment webhooks, Telegram webhooks, healthcheck;
- protected endpoints: require `Authorization: Bearer <token>`.

Content type:

```http
Content-Type: application/json
Accept: application/json
```

---

## Public Endpoints

### Authentication

#### `POST /api/login`

Authenticates a user using Telegram init data.

Example request:

```json
{
  "query": "user=%7B...%7D&auth_date=..."
}
```

Example response:

```json
{
  "token": "plain_text_access_token"
}
```

### Webhooks

- `POST /api/telegram/webhook`
- `POST /api/telegram/moderation/webhook`
- `POST /api/stripe/webhook`
- `POST /api/tribute/webhook`

### Healthcheck

#### `GET /api/healthcheck`

Response:

```json
{
  "status": "ok"
}
```

---

## Protected Endpoints

## User

- `GET /api/me`
- `GET /api/user/{id}`
- `GET /api/user/shared/{id}`
- `POST /api/user/profile`
- `PUT /api/user/search/preferences`
- `GET /api/user/likes`
- `GET /api/user/swipes`
- `GET /api/user/stats`
- `GET /api/user/matches`
- `POST /api/user/onboard`
- `POST /api/user/moderation`
- `DELETE /api/user/account`
- `POST /api/user/block`
- `POST /api/user/unblock`

### Example: update search preferences

#### `PUT /api/user/search/preferences`

Request example:

```json
{
  "city_id": 12,
  "include_nearby": true,
  "from_age": 18,
  "to_age": 30,
  "gender": "female",
  "search_for": "relations",
  "eye_color": ["green"],
  "with_video": true,
  "with_premium": false
}
```

Success response example:

```json
{
  "user_id": 123,
  "city_id": 12,
  "include_nearby": true,
  "from_age": 18,
  "to_age": 30,
  "gender": "female",
  "search_for": "relations",
  "eye_color": ["green"],
  "with_video": true,
  "with_premium": false
}
```

Validation error example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "from_age": ["The from age field must be at least 18."]
  }
}
```

## Feed

- `GET /api/feed/profiles`
- `POST /api/feed/swipe`
- `POST /api/feed/swipe/revert`
- `DELETE /api/feed/match`
- `PUT /api/feed/match/view`
- `POST /api/likes/respond`

### Example: swipe profile

#### `POST /api/feed/swipe`

Request:

```json
{
  "profile_id": 456,
  "action": "like"
}
```

Success response:

```json
{
  "success": true
}
```

## Chat

- `POST /api/chat`
- `GET /api/chat`
- `GET /api/chat/{chat_id}/message`
- `POST /api/chat/message`
- `PUT /api/chat/message`
- `GET /api/chat/recent`

### Example: send message

#### `POST /api/chat/message`

Request:

```json
{
  "chat_id": 45,
  "message": "Hello"
}
```

## Storage

- `POST /api/storage/file/photo`
- `POST /api/storage/file/video`
- `DELETE /api/storage/file`
- `PATCH /api/storage/files/order`

## Dictionary

- `GET /api/dictionary/cities`
- `GET /api/dictionary/countries`
- `GET /api/dictionary/activities`
- `GET /api/dictionary/hobbies`

## Presence

- `GET /api/users/presence`

## Reports

- `POST /api/reports`

## Payment

- `GET /api/payment/subscription`
- `POST /api/payment/subscription/cancel`
- `POST /api/payment/subscribe`
- `POST /api/payment/telegram/invoice`
- `POST /api/payment/tribute`

## Moderation

- `GET /api/moderation/user-profile/photos`

## Admin

- `POST /api/admin/create-bot`
- `GET /api/admin/swipe-config`
- `PUT /api/admin/swipe-config`
- `POST /api/admin/swipe-config/reset`
- `DELETE /api/admin/user/{user_id}`
- `POST /api/admin/premium/grant`
- `POST /api/admin/premium/revoke`
- `GET /api/admin/profiles`
- `PUT /api/admin/users/{id}/status`
- `GET /api/moderation/user`
- `PUT /api/moderation/status`
- `PUT /api/admin/user`

---

## Error Handling

The backend returns JSON responses for business errors and validation failures.

Typical status codes:

- `200 OK`
- `204 No Content`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

Business exceptions are handled through a centralized `ApiException` implementation.

---

## Source of Truth

The authoritative route definitions are stored in:

- [routes/api.php](./routes/api.php)
