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
- `applications` — job applications from the Careers page (public submit; admin
  list / preview / download / status / delete).

List endpoints return only *live* content (published / open / active) to the
public, but return **everything** when called with an admin token, so the
dashboard can manage drafts and closed items. Uploaded images are stored on disk
and served from `/uploads/*`.

## What the frontend consumes

- **Public pages** read the API live (no redeploy to change content):
  - `/announcements` — published announcements.
  - `/careers` — open roles with an on-site application form (optional CV upload).
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

**First admin:** on an empty database the seed creates `admin@qalibrated.co.ke`
(override with `SEED_ADMIN_EMAIL`) using `SEED_ADMIN_PASSWORD`, or a random
password printed once in the backend logs. There is no default password.

## Deploy notes

- **Production (VPS):** always use the committed `docker-compose.prod.yml` with
  the existing project name, so the same containers and data volumes are reused:
  `docker compose -p qslsite -f docker-compose.prod.yml up -d --build`.
  Settings live in `./.env` next to it (`chmod 600`, never committed):
  `JWT_SECRET` (random, 64 hex chars — `openssl rand -hex 32`), the three
  `NEXT_PUBLIC_*` URLs, plus the mail settings below. Quote any value containing
  `#`, which otherwise starts a comment.
- **Security:** there is no public sign-up — admins create accounts under
  Dashboard → Users. Login is rate-limited per IP and per account; the API only
  accepts browser requests from `CORS_ORIGINS`; the frontend container runs
  read-only code with dropped privileges and memory/CPU limits.

- `NEXT_PUBLIC_API_BASE_URL` is read by the **browser**, so in production it must
  be a public URL the visitor can reach (e.g. `https://api.qalibrated.co.ke/api`).
  Point your gateway/reverse proxy for that host at the `backend` service on
  `:5000`, and the main site host at the `frontend` service on `:3000`.
- The backend keeps its SQLite database and uploaded images in the
  `backend_data` and `backend_uploads` volumes — persist these across rebuilds.
- To move to PostgreSQL later, change the `datasource` provider in
  `backend/prisma/schema.prisma` to `postgresql` and set `DATABASE_URL` — no
  application code changes are needed.
- **Job applications.** Every role on `/careers` (plus a general application)
  opens an application form — personal details, education, experience & skills,
  availability — saved straight to the database. A CV is optional; when attached
  it is stored *privately* in `CV_DIR` (default `./data/cvs`, i.e. inside
  the `backend_data` volume — never under the public `/uploads`). Admins view them
  in the dashboard under **Applications** (full details + CV preview): PDFs and images preview inline,
  Word (.docx) files are rendered to HTML for preview. To keep storage small,
  images are resized and re-encoded as WebP, PDFs are optimised with Ghostscript
  (installed in the backend image), and PDF/DOCX files are gzip-compressed at
  rest. Uploads are limited to 5 MB (PDF, DOCX, JPG, PNG) and 5 per IP per 10 min.
- **Application alerts** go to `RECRUITMENT_EMAIL` (default
  `recruitment@qalibrated.com`) — an alert with the applicant's details and a
  link to `DASHBOARD_URL`, not the CV itself. Configure either `RESEND_API_KEY`
  or SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional
  `SMTP_SECURE`), plus `MAIL_FROM` (a sender on a verified domain). With neither
  set, the alert is only logged and applications are still saved.
- **Set a strong `JWT_SECRET`** in production; never ship the example value.
