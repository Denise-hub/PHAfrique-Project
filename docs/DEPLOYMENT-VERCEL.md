# Vercel + Neon + Cloudinary Deployment

This project is deployed **only** on **Vercel** with **Neon PostgreSQL** and **Cloudinary** for images. No Firebase, no Cloud Run, no local SQLite in production.

---

## Environment variables (Vercel)

Set in **Vercel → Project → Settings → Environment Variables** (Production). Do **not** put these in `next.config.js`; they are read at runtime from `process.env` only.

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Neon PostgreSQL **pooled** connection string (`postgresql://...?sslmode=require`) |
| `NEXTAUTH_URL` | Yes | `https://your-app.vercel.app` (or your custom domain) |
| `NEXTAUTH_SECRET` | Yes | e.g. `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Yes (for admin) | Plain password for main admin (e.g. denmaombi@gmail.com) |
| `CLOUDINARY_CLOUD_NAME` | Yes (for uploads) | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes (for uploads) | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Yes (for uploads) | From Cloudinary dashboard |
| `GOOGLE_CLIENT_ID` | For Google login | OAuth client; redirect URI `https://your-app.vercel.app/api/auth/callback/google` |
| `GOOGLE_CLIENT_SECRET` | For Google login | From same OAuth client |

---

## One-time database setup

1. Create a Neon project and get the **pooled** connection string.
2. Locally (or in a one-off script), run:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   DATABASE_URL="postgresql://..." npm run db:seed
   ```
   Use the **same** Neon URL you set in Vercel so production and seed data match.

---

## Image uploads

- **POST /api/upload** — Admin-only. Accepts `multipart/form-data` with field `file`. Uploads to Cloudinary (signed, server-side secret) and returns `{ url }` (Cloudinary `secure_url`). Store only this URL in Neon (Prisma); no local file or base64 in the database.
- Admin flows (Gallery, News, Programs, etc.) can either upload via **POST /api/upload** then save the returned URL to the resource, or continue to send the file to the resource API (e.g. POST /api/admin/images), which uses the same Cloudinary upload and stores only the URL.

---

## Verify

- Admin login at `https://your-app.vercel.app/admin` (email/password and/or Google).
- Admin can create News, Gallery, Opportunities, Interns, Volunteers, Programs, Portfolios; images go to Cloudinary; only URLs are stored in Neon.
- Public pages fetch from Neon; if the DB is empty, APIs return empty arrays and the UI does not crash.
