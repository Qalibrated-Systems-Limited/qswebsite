# Qalibrated website platform — frontend + backend

This repository is the **primary** Qalibrated Systems website. It is split into
two cleanly separated, independently deployable apps:

| Part          | Path        | Stack                                   | Port |
| ------------- | ----------- | --------------------------------------- | ---- |
| **Frontend**  | repo root   | Next.js 15 (App Router), Tailwind       | 3000 |
| **Backend**   | `./backend` | Express + Prisma (SQLite), JWT auth     | 5000 |

The frontend is the marketing site **plus** an admin dashboard. The backend is a
content API that stores and serves the site's dynamic content.

## What the backend provides

A REST API under `/api`:

- `auth` — `POST /auth/login`, `POST /auth/register` → returns a JWT.
- `users` — admin-only user management.
- `products` — products/services (image upload).
- `announcements` — news & updates (image upload).
- `ads` — banner / sidebar / popup promotions (image upload).
- `careers` — job openings.

List endpoints return only *live* content (published / open / active) to the
public, but return **everything** when called with an admin token, so the
dashboard can manage drafts and closed items. Uploaded images are stored on disk
and served from `/uploads/*`.

## What the frontend consumes

- **Public pages** read the API live (no redeploy to change content):
  - `/announcements` — published announcements.
  - `/careers` — open roles (with an apply-by-email flow).
  - Products pages read `/products`.
- **Admin dashboard** (`/dashboard`, sign in at `/login`) manages Products,
  Announcements, Careers, Ads and Users. Content is created/edited/deleted here
  and appears on the site immediately.

The API base URL is configured at runtime via `window.ENV.API_BASE_URL`
(`public/config.js`, filled by `scripts/docker-entrypoint.sh` from
`NEXT_PUBLIC_API_BASE_URL`) — so one frontend image can point at any backend.

## Run it locally

```bash
# Backend
cd backend
cp .env.example .env          # set a JWT_SECRET
npm install
npm run build                 # prisma generate + tsc
npm run prisma:push           # create the SQLite schema
npm run seed                  # seed admin + sample content
npm start                     # API on http://localhost:5000

# Frontend (in another terminal, from repo root)
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api npm run dev   # site on :3000
```

Or the whole stack with Docker:

```bash
docker compose up -d --build   # site :3000, API :5000
```

**Default admin (change the password after first login):**
`admin@qalibrated.co.ke` / `Admin123!`

## Deploy notes

- `NEXT_PUBLIC_API_BASE_URL` is read by the **browser**, so in production it must
  be a public URL the visitor can reach (e.g. `https://api.qalibrated.co.ke/api`).
  Point your gateway/reverse proxy for that host at the `backend` service on
  `:5000`, and the main site host at the `frontend` service on `:3000`.
- The backend keeps its SQLite database and uploaded images in the
  `backend_data` and `backend_uploads` volumes — persist these across rebuilds.
- To move to PostgreSQL later, change the `datasource` provider in
  `backend/prisma/schema.prisma` to `postgresql` and set `DATABASE_URL` — no
  application code changes are needed.
- **Set a strong `JWT_SECRET`** in production; never ship the example value.
