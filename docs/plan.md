# Furnishing Essentials â€” Development Plan (Final)

## Status Summary

- **Project type:** Full-stack e-commerce web application (furnishing products)
- **Frontend:** React + Vite + Tailwind CSS + React Router + Axios â†’ http://localhost:5173
- **Backend:** Node.js + Express.js â†’ http://localhost:5000
- **Database:** Supabase Postgres (project: cdjigtcrbfarbfisjtgu.supabase.co) â€” schema + seed run manually in the Supabase SQL Editor; backend connects via standard Postgres connection (DB_HOST/DB_PORT/5432, DB_USER=postgres)
- **Deviation from original plan:** Local MySQL was replaced by Supabase Postgres per user decision (2026-09-10). Everything else remains local: Express server, file uploads (backend/uploads), JWT+bcrypt auth with own users table, simulated payments.
- **Auth:** Own JWT auth (jsonwebtoken) + bcrypt, users table with role ('customer' | 'admin'). Seeded admin: admin@furnishing.local / (rotated per deployment — keep private). Demo customer: customer@furnishing.local / customer123.
- **Payments:** Simulated â€” cash_on_delivery + local_test_payment (test card 4111 1111 1111 1111), records stored in payments table.
- **Tracking:** shipments table; admin updates status manually; customer sees a timeline.
- **Reviews:** 1â€“5 rating, purchase-preferred (one review per user/product), admin moderation (approved/pending/hidden).
- **Coupons:** percentage/fixed, minimum order, expiry, WELCOME10 / FURNISH20 / FLAT500 seeded.

## Architecture

```
Browser (React SPA :5173)
   â”‚ REST (Axios) â€” JWT in Authorization header
   â–¼
Express API (:5000)
   â”‚ SQL via node-postgres (pg) Pool â€” parameterized queries
   â–¼
Supabase Postgres (16 tables: users, addresses, categories, products,
   product_images, carts, cart_items, wishlist, orders, order_items,
   payments, shipments, reviews, coupons, feedback, custom_design_requests)
   â–²
Local filesystem â€” backend/uploads/{products,custom-designs,categories}
   served at http://localhost:5000/uploads/*
```

## Module Status

| Module | Backend | Frontend | Notes |
|---|---|---|---|
| Foundation (server, db pool, errors, health) | done | â€” | GET /api/health |
| Auth (register/login/me/profile/password) | done | done | JWT, bcrypt, roles |
| Categories (CRUD) | done | done | admin-protected writes |
| Products (CRUD, search, filters, sort, pagination) | done | done | Multer local uploads |
| Cart / Wishlist / Addresses | done | done | per-user cart row |
| Checkout + Orders (transaction) | done | done | BEGIN/COMMIT, inventory decrement, cart clear |
| Payments (simulated) | done | done | COD + local test card |
| Tracking (shipments) | done | done | admin updates, customer timeline |
| Reviews | done | done | moderation + avg rating |
| Coupons | done | done | apply at checkout |
| Feedback | done | done | customer submit, admin manage |
| Custom design requests | done | done | local reference image upload |
| Admin dashboard (stats + all management) | done | done | charts from DB data |

## Key Implementation Notes

- Order creation runs inside a single Postgres transaction (BEGIN â†’ lock cart â†’ validate stock â†’ insert order/items/payment/shipment â†’ decrement inventory â†’ clear cart â†’ COMMIT). Failure at any step rolls back completely.
- Tax 12% of (subtotal âˆ’ discount); shipping free â‰¥ â‚¹5,000, else â‚¹99. WELCOME10 = 10% off (min order â‚¹1,000).
- Uploaded images: unique filenames (timestamp-random), stored under backend/uploads, validated type + 5MB limit, served via express.static.
- Security: helmet, express-rate-limit (auth routes + general), bcrypt (10 rounds), JWT 7d expiry, role middleware, parameterized queries throughout.
- .env holds DB password + JWT secret; .env.example committed as template.

## Run Commands

```
# 1) Database: run database/schema.sql then database/seed.sql in Supabase SQL Editor
# 2) Backend
cd backend && npm install && npm run dev      # http://localhost:5000
# 3) Frontend
cd frontend && npm install && npm run dev     # http://localhost:5173
```

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@furnishing.local | (rotated — keep private) |
| Customer | customer@furnishing.local | customer123 |
