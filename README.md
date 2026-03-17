# 🛒 E-Commerce Backend API

A production-ready e-commerce REST API built with Node.js and Express. Features a full seller/buyer marketplace, real-time support chat, background job processing, distributed caching, and robust auth — all in a clean monolithic architecture before a planned microservices migration.

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Caching Strategy](#caching-strategy)
- [Queue System](#queue-system)
- [Real-time (Socket.io)](#real-time-socketio)
- [Auth & Security](#auth--security)
- [Roadmap](#roadmap)

---

## Features

- **Multi-role system** — customers, sellers, and admins with role-based access control
- **Product marketplace** — full CRUD with image uploads (up to 10 images per product), categories, stock management, and seller dashboards
- **Order management** — order placement, status tracking, and seller-side order views
- **Wishlist** — per-user persistent wishlists
- **Reviews** — purchase-gated reviews (only verified buyers can review)
- **Real-time support chat** — Socket.io powered chatrooms with typing indicators, read receipts, and admin assignment queue
- **Distributed caching** — Valkey (Redis-compatible) with cache-stampede prevention via distributed locking
- **Background jobs** — BullMQ queues for email delivery and Cloudinary image deletion with exponential backoff retry
- **Auth** — JWT access + refresh token rotation, token blacklisting on logout, email/password change flows with magic links
- **Rate limiting** — per-IP and per-user rate limiters for login, registration, forgot password, and email change
- **Admin panel** — user management (ban, suspend, strike), product/review moderation, order inspection

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Cache | Valkey (via valkey-glide) |
| Queue broker | Valkey / Redis (via ioredis + BullMQ) |
| Real-time | Socket.io |
| Media storage | Cloudinary |
| Email | Nodemailer + Gmail OAuth2 |
| Auth | JWT (access + refresh tokens) |
| File uploads | Multer |
| Security | Helmet, express-mongo-sanitize, rate-limiter-flexible |

> **Note on two Redis clients:** `valkey-glide` is used for all application-level cache and auth operations. `ioredis` is used exclusively for BullMQ, which requires the ioredis API. They point to the same Valkey instance on different databases.

---

## Architecture Overview

```
Client
  │
  ▼
Express App (app.js)
  ├── REST API Routes
  │     ├── /api/users        → auth, profile, wishlist, orders
  │     ├── /api/products     → product catalog
  │     ├── /api/seller       → seller dashboard, stock, orders
  │     ├── /api/categories   → product categories
  │     ├── /api/reviews      → product reviews
  │     ├── /api/admin        → admin operations
  │     └── /api/chat         → support chatrooms
  │
  └── Socket.io Server
        ├── Auth middleware (JWT)
        ├── Room handlers    → join/leave chatrooms
        ├── Message handlers → send/receive messages
        └── Typing handlers  → typing indicators

Background (worker.js — separate process)
  ├── Email Worker     → registration, password reset, email change
  └── Cloudinary Worker → async image deletion
```

The app runs as **two separate processes**:
- `index.js` — the main API + Socket.io server
- `worker.js` — BullMQ background workers for email and media cleanup

---

## Project Structure

```
src/
├── config/
│   ├── cloudinary.config.js
│   ├── database.config.js
│   ├── email.config.js
│   └── valkey.config.js
│
├── controllers/
│   ├── admin.controllers.js
│   ├── category.controllers.js
│   ├── chat.controllers.js
│   ├── product.controllers.js
│   ├── review.controllers.js
│   ├── seller.controllers.js
│   └── user.controllers.js
│
├── middlewares/
│   ├── auth.middleware.js       ← JWT verification + role check
│   ├── blacklist.middleware.js  ← token blacklist check
│   ├── multer.middleware.js     ← file upload config
│   └── rateLimiter.middleware.js
│
├── models/
│   ├── category.model.js
│   ├── chatroom.model.js
│   ├── message.model.js
│   ├── order.model.js
│   ├── product.model.js
│   ├── review.model.js
│   ├── user.model.js
│   └── wishlist.model.js
│
├── queues/
│   ├── index.js                 ← Queue instances (BullMQ)
│   ├── producers/
│   │   ├── cloudinary.producer.js
│   │   └── email.producer.js
│   └── processors/
│       ├── cloudinary.processor.js
│       └── email.processor.js
│
├── routes/
│   ├── admin.routes.js
│   ├── category.routes.js
│   ├── chat.routes.js
│   ├── product.routes.js
│   ├── review.routes.js
│   ├── seller.routes.js
│   └── user.routes.js
│
├── services/
│   ├── chatroom.service.js
│   ├── cloudinary.service.js
│   ├── email.service.js
│   ├── message.service.js
│   └── valkey.service.js
│
├── socket/
│   ├── index.js                 ← Socket.io init
│   ├── handlers/
│   │   ├── message.handlers.js
│   │   ├── room.handlers.js
│   │   └── typing.handlers.js
│   └── middlewares/
│       └── socketAuth.js
│
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   ├── cacheKeys.js
│   ├── calculateDate.js
│   ├── calculateRemainingTTL.js
│   ├── extractPublicId.js
│   └── options.js
│
├── app.js                       ← Express app setup
├── index.js                     ← Main server entry point
└── worker.js                    ← Background worker entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Valkey or Redis instance
- Cloudinary account
- Gmail account with OAuth2 credentials

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/E-commerce-backend.git
cd E-commerce-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Fill in your values in .env
```

### Running

```bash
# Development (API server)
npm run dev

# Development (background workers) — run in a separate terminal
npm run dev:worker

# Production
npm start
npm run start:worker
```

---

## Environment Variables

```env
# App
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000
APP_NAME=YourAppName

# MongoDB
MONGODB_URI=mongodb://localhost:27017
DB_NAME=ecommerce

# Valkey / Redis
VALKEY_HOST=localhost
VALKEY_PORT=6379

# JWT
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d
EMAIL_CHANGE_TOKEN_SECRET=your_email_change_secret
EMAIL_CHANGE_TOKEN_EXPIRY=15m
PASSWORD_RESET_TOKEN_SECRET=your_password_reset_secret
PASSWORD_RESET_TOKEN_EXPIRY=15m

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail OAuth2
EMAIL_USER=your@gmail.com
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_gmail_refresh_token
```

---

## API Reference

### Auth & Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register-user` | — | Register with optional avatar upload |
| POST | `/login-user` | — | Login, returns access + refresh tokens |
| POST | `/logout-user` | ✓ | Logout, blacklists current token |
| POST | `/refresh-tokens` | — | Rotate access token using refresh token |
| POST | `/forgot-password` | — | Send password reset magic link |
| POST | `/verify-password-reset` | — | Reset password via magic link token |
| POST | `/change-password` | ✓ | Change password (requires current password) |
| POST | `/request-email-change` | ✓ | Send email change verification link |
| GET | `/verify-email-change` | — | Confirm email change via token |
| GET | `/me` | ✓ | Get current user profile (cached) |
| POST | `/update-avatar` | ✓ | Update avatar (old image deleted async) |
| POST | `/change-fullname` | ✓ | Update display name |
| PATCH | `/change-username` | ✓ | Change username (requires password) |
| GET | `/check-username` | — | Check username availability |
| GET | `/me/get-wishlist` | ✓ | Get wishlist with populated products |
| POST | `/add-to-wishlist` | ✓ | Add product to wishlist |
| POST | `/remove-from-wishlist` | ✓ | Remove product from wishlist |
| GET | `/me/get-orders` | ✓ | Get order history |
| GET | `/me/reviews` | ✓ | Get all reviews by current user |

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all products (filter, sort, paginate) |
| GET | `/:productId` | — | Get product by ID (cached) |
| GET | `/seller/:sellerId` | — | Get products by seller (cached) |
| POST | `/create` | ✓ Seller | Create product with up to 10 images |
| PATCH | `/update/:productId` | ✓ Seller | Update product details or images |
| DELETE | `/delete/:productId` | ✓ Seller | Delete product (images removed async) |

### Seller Dashboard — `/api/seller`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/my-products` | ✓ Seller | Filtered view of own products |
| PATCH | `/update-stock/:productId` | ✓ Seller | Add, subtract, or set stock quantity |
| GET | `/my-orders` | ✓ Seller | Orders containing seller's products |
| GET | `/get-stats` | ✓ Seller | Revenue, top products, order breakdowns |

### Categories — `/api/categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | All categories (cached 12h) |
| GET | `/:categoryId` | — | Single category (cached 12h) |
| POST | `/create` | ✓ Admin | Create category |
| PATCH | `/update/:categoryId` | ✓ Admin | Update category |
| DELETE | `/delete/:categoryId` | ✓ Admin | Delete category |

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/product/:productId` | — | Get reviews for a product |
| POST | `/create/:productId` | ✓ | Create review (must have purchased) |
| PATCH | `/update/:reviewId` | ✓ | Update own review |
| DELETE | `/delete/:reviewId` | ✓ | Delete own review |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | ✓ Admin | List users with filters |
| GET | `/users/:userId` | ✓ Admin | Get user by ID |
| DELETE | `/users/:userId` | ✓ Admin | Delete user + all their data (transaction) |
| PATCH | `/users/:userId/role` | ✓ Admin | Change user role |
| PATCH | `/users/:userId/status` | ✓ Admin | Ban, suspend, strike, or reactivate user |
| PATCH | `/products/:productId` | ✓ Admin | Update any product |
| DELETE | `/products/:productId` | ✓ Admin | Delete any product |
| DELETE | `/reviews/:reviewId` | ✓ Admin | Delete any review |
| GET | `/orders/:orderId` | ✓ Admin | Get any order |

### Chat — `/api/chat`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chatrooms` | ✓ | Create support chatroom |
| GET | `/chatrooms` | ✓ | Get own chatrooms with unread counts |
| GET | `/chatrooms/:id/messages` | ✓ | Paginated message history |
| PATCH | `/chatrooms/:id/read` | ✓ | Mark messages as read |
| PATCH | `/chatrooms/:id/assign` | ✓ Admin | Assign chatroom to self |
| PATCH | `/chatrooms/:id/close` | ✓ Admin | Close chatroom |
| GET | `/admin/chatrooms` | ✓ Admin | All chatrooms with filters |

---

## Caching Strategy

Valkey is used for three distinct purposes:

**Application cache** — product pages, seller product lists, user profiles, and categories are cached with TTL. Cache keys follow a consistent pattern defined in `utils/cacheKeys.js`.

**Cache stampede prevention** — `getWithLock` in `valkey.service.js` implements a distributed lock pattern. When a cache miss occurs under high concurrency, only one request hits the database while others wait briefly and read from cache. This prevents the thundering herd problem.

**Token blacklisting** — on logout, the access token is stored in Valkey with a TTL equal to its remaining validity. Every authenticated request checks this blacklist via `blacklist.middleware.js`.

**Rate limiting** — `rate-limiter-flexible` uses Valkey as its store for sliding window counters per IP and per user.

---

## Queue System

BullMQ is used for two async job types, processed by the separate `worker.js` process:

**Email queue** — handles registration emails, password reset links, and email change verification. All jobs retry up to 5 times with exponential backoff (1s, 2s, 4s, 8s, 16s).

**Cloudinary queue** — handles image deletion after product updates, product deletion, user deletion, and avatar changes. Deletes are intentionally async so the API response isn't blocked by Cloudinary's API.

Both queues use `ioredis` on database 1 of the Valkey instance, keeping queue data separate from application cache.

---

## Real-time (Socket.io)

Connections are authenticated via JWT passed in `socket.handshake.auth.token`.

On connection:
- User joins their personal room `user:{userId}` for notifications
- Admins additionally join `admins:queue` for new chatroom alerts
- User's `isOnline` status is updated in the database

**Events (client → server):**

| Event | Payload | Description |
|---|---|---|
| `join_chatrooms` | `{ chatroomId, page }` | Join a chatroom room, marks messages read, returns history |
| `leave_chatroom` | `{ chatroomId }` | Leave a chatroom room |
| `send_message` | `{ chatroomId, content, messageType }` | Send a message |
| `typing` | `{ chatroomId }` | Broadcast typing indicator |
| `stop_typing` | `{ chatroomId }` | Broadcast stopped typing |

**Events (server → client):**

| Event | Description |
|---|---|
| `unread_summary` | Sent on connect with unread counts per chatroom |
| `new_chatroom` | Sent to `admins:queue` when a user opens a support ticket |
| `chatroom_assigned` | Sent to user when admin takes their chatroom |
| `chatroom_closed` | Sent to all parties when chatroom is closed |
| `message_history` | Response to `join_chatrooms` with paginated messages |
| `message_sent` | Confirmation to sender |
| `new_message` | Broadcast to chatroom |
| `new_message_notification` | Sent to recipient's personal room |
| `user_typing` | Broadcast to chatroom |
| `user_stopped_typing` | Broadcast to chatroom |

---

## Auth & Security

- **Access tokens** expire in 15 minutes. **Refresh tokens** expire in 7 days and are rotated on every use.
- On logout, the access token is **blacklisted in Valkey** for its remaining TTL — there's no way to reuse it even if intercepted.
- On password or username change, **all sessions are invalidated** by nullifying the refresh token.
- **Helmet** sets secure HTTP headers on all responses.
- **Rate limiting** protects login (10 attempts per IP / 5 per user per 10 min), registration (10 per IP per 15 min), forgot password (1 per user per hour), and email change (1 per user per 24 hours).
- Admin suspension/ban immediately **clears the user's refresh token**, forcing logout on next request.

---

## Roadmap

- [ ] Order placement controller (core checkout flow)
- [ ] Elasticsearch integration for product search
- [ ] Payment gateway integration
- [ ] Microservices migration (user, product, order, chat services)
- [ ] gRPC inter-service communication
- [ ] API gateway with centralised JWT validation
- [ ] Kubernetes deployment manifests
- [ ] Admin analytics dashboard (revenue stats, platform metrics)
- [ ] Seller application/approval workflow
- [ ] Report system for users and content
