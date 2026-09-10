# Furnishing Essentials

A full-stack e-commerce application for furnishing products (homes, offices, hotels, villas, restaurants, cafeterias).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + React Router + Axios |
| Backend | Node.js + Express.js |
| Database | Supabase Postgres (accessed via standard Postgres connection from the local Express backend) |
| Auth | JWT + bcrypt (own `users` table) |
| File storage | Local filesystem (`backend/uploads/`) |
| Payments | Cash on Delivery + local simulated payment |

> Note: The original plan targeted local MySQL. The database now runs on Supabase (Postgres). All application code runs locally; the backend connects to Postgres over the standard connection string, which preserves raw SQL, transactions (checkout), and the seeded admin account.

## Project Structure

```
furnishing-essentials/
├── frontend/            # React + Vite app (localhost:5173)
├── backend/             # Express API (localhost:5000)
│   ├── src/
│   │   ├── config/      # DB pool, env
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # auth, errors, upload
│   │   ├── routes/      # Express routers
│   │   ├── services/    # Business logic
│   │   ├── validators/  # Input validation
│   │   ├── utils/       # Helpers
│   │   └── app.js
│   ├── uploads/         # Local images (products/, custom-designs/)
│   ├── server.js
│   └── .env
├── database/            # schema.sql + seed.sql (run in Supabase SQL Editor)
└── docs/                # plan.md
```

## Setup

### 1. Database (Supabase)

**Option A — via the app (recommended, no SQL Editor needed):**

1. Create the tables: run the contents of `database/schema.sql` once in the Supabase **SQL Editor**
2. Set your DB password in `backend/.env` (`DB_PASSWORD=...`) — from Supabase Dashboard → Project Settings → Database
3. Seed everything: `cd backend && npm run seed`

**Option B — fully manual:**

1. Run `database/schema.sql` in the Supabase SQL Editor
2. Run `database/fix-identity.sql` (allows seed inserts on identity columns)
3. Run `database/seed.sql`

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit DB values
npm run dev
```

Backend runs at http://localhost:5000 — verify with http://localhost:5000/api/health

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@furnishing.local | admin123 |
| Customer | customer@furnishing.local | customer123 |

## Key Endpoints

- `GET /api/health`
- `POST /api/auth/register` / `POST /api/auth/login`
- `GET /api/products` (search, category, minPrice, maxPrice, material, sort, page)
- `GET/POST/PUT/DELETE /api/cart` + items
- `POST /api/orders` (checkout — DB transaction)
- `GET /api/orders/:id/tracking` (timeline)
- Admin: `/api/admin/*` (stats, users, orders, payments, shipments, reviews, coupons, feedback, custom requests)

Payments are simulated: Cash on Delivery or local test card 4111 1111 1111 1111. No real money is transferred.
