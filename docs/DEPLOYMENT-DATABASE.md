# Production database and “missing data” — root cause and fix

This document explains why the **live site** can show empty Gallery, News, Opportunities, Interns, and Volunteers even though they appear **locally**, and how to fix it permanently.

---

## 1. Why the live site cannot “access previously existing data”

**The data was never in the repository.**

- The **repository (Git)** contains only **code**: pages, components, API routes, Prisma schema, and the **seed script** (`prisma/seed.js`). It does **not** contain the actual rows for Gallery images, News items, Interns, or Volunteers.
- Those rows live in a **database**. Your app has **two separate databases**:
  - **Local:** whatever `DATABASE_URL` points to on your machine (e.g. SQLite `file:./prisma/dev.db`).
  - **Production:** whatever `DATABASE_URL` is set to in **Vercel** (e.g. Neon PostgreSQL).

So:

- Data you add **locally** is stored in your **local** database only. It is **not** in Git and **not** in Neon.
- The live site **only** reads from the **production** database (Neon). So it can never “fetch what was already there” from the repo — that content only existed in your local DB.

If the live site “previously” showed that data, it was either:

- Data you had added **on the live site** (which was then lost when uploads failed before Cloudinary was set), or  
- You were looking at **localhost** (local DB), not the deployed URL.

---

## 2. Is the production database (Neon) empty?

**Partly.** It depends on what has been run against Neon:

- **Schema:** When you deploy, Vercel runs `prisma generate` and usually `prisma db push` (or migrations) against the **production** `DATABASE_URL`. So Neon has the **tables**.
- **Seed script:** If your build or deploy runs `npm run db:seed` (or similar) **using the production `DATABASE_URL`**, then Neon gets exactly what the seed creates:
  - Admin users  
  - Programs  
  - Projects  
  - One opportunity (e.g. “internship-program”)  
  - Content keys (contact_phone, contact_email, contact_address)  

The seed script **does not** create:

- **Image** (Gallery)  
- **Event** (News)  
- **Participant** (Interns, Volunteers)  
- **Application**  

So in a typical setup, Neon will have **Programs and Projects** (and the one seeded opportunity), but **Gallery, News, Interns, and Volunteers will be empty** until someone adds them via the **production** admin or you import data into Neon.

---

## 3. Is the project pointing to a different database in production?

**No.** The app always uses **one** database per environment:

- **Code:** `prisma/schema.prisma` has `url = env("DATABASE_URL")`. There is no other URL in the code.
- **Local:** `.env` (or your shell) sets `DATABASE_URL` (e.g. SQLite or Neon).
- **Production:** **Vercel** sets `DATABASE_URL` in **Project → Settings → Environment Variables** for the Production environment. Whatever you put there is what the live site uses. So:
  - If `DATABASE_URL` in Vercel is your **Neon** connection string, then production uses **Neon**.
  - The live site cannot “point” to your local SQLite file; it only sees Vercel’s env.

So production is not “incorrectly pointing” to another DB — it is pointing to exactly the database you configured in Vercel (almost certainly Neon). The issue is that **that** database (Neon) simply doesn’t have the Gallery/News/Interns/Volunteers rows, because they were never added there.

---

## 4. How to verify production database and contents

Use the **database diagnostic** endpoint (after deploying):

- **URL:**  
  `https://ph-afrique-project.vercel.app/api/debug/db-diagnostic?key=YOUR_NEXTAUTH_SECRET`  
  (Replace `YOUR_NEXTAUTH_SECRET` with the exact value of `NEXTAUTH_SECRET` in Vercel.)

- **What it returns:**
  - **database.urlHint** — e.g. `"Neon PostgreSQL"` or `"SQLite (local file)"`, so you see which type of DB is in use.
  - **database.redacted** — a short hint of `DATABASE_URL` (not the full secret).
  - **counts** — row counts for `Image`, `Event`, `Opportunity`, `Participant`, `Application`, `Program`, `Project`, `AdminUser`.

So you can confirm:

1. **Which DATABASE_URL production uses** — you’ll see “Neon PostgreSQL” if Vercel’s `DATABASE_URL` is a Neon URL.
2. **Whether Neon actually has records** — e.g. if `Image` and `Event` are 0, that’s why Gallery and News are empty.

---

## 5. What to do to fix it permanently

**A. Ensure production uses Neon and has schema**

- In **Vercel → Project → Settings → Environment Variables**, set **Production** `DATABASE_URL` to your **Neon** connection string (starts with `postgresql://` or `postgres://`, and usually contains `neon.tech`).
- Redeploy so the app runs with that URL. The build will run Prisma against Neon and create/update tables.

**B. Populate content on production**

You have two options:

1. **Add content via the live admin (recommended now that Cloudinary is set)**  
   - Log in to the **production** admin.  
   - Add Gallery images, News items, Opportunities, Interns, Volunteers (and Applications) there.  
   - They are stored in **Neon** and will persist. No more “disappearing on refresh” if uploads succeed (Cloudinary is configured).

2. **One-time migration from local to Neon**  
   - Export the relevant tables from your **local** database (e.g. SQLite).  
   - Import those rows into **Neon** (e.g. with custom scripts or Prisma).  
   - After that, the live site will show that data because it’s reading from Neon.

**C. Keep Cloudinary configured in production**

- With **CLOUDINARY_CLOUD_NAME**, **CLOUDINARY_API_KEY**, and **CLOUDINARY_API_SECRET** set in Vercel for Production, image uploads (Gallery, News, profile pictures, etc.) go to Cloudinary and the returned URLs are saved in Neon. So data stays persistent and the live site will keep showing it.

---

## 6. Short answers to your questions

| Question | Answer |
|----------|--------|
| Why can’t the live site access “previously existing” data? | That data lives in your **local** database, not in the repo. The live site only reads from the **production** database (Neon). |
| Is the production DB (Neon) empty? | Tables exist. Seed data (programs, projects, one opportunity, admin users, content keys) may exist. **Gallery, News, Interns, Volunteers are not seeded**, so they are usually **empty** until you add them on production or migrate from local. |
| Is the project pointing to a different DB in production? | No. Production uses **only** the `DATABASE_URL` set in Vercel (Neon). |
| How to fix it permanently? | (1) Set Production `DATABASE_URL` in Vercel to Neon. (2) Keep Cloudinary set in Vercel. (3) Add content via the **production** admin, or one-time migrate from local into Neon. (4) Use `/api/debug/db-diagnostic?key=NEXTAUTH_SECRET` to confirm which DB is used and what counts are in it. |

Once production `DATABASE_URL` points to Neon, Cloudinary is set, and content is created (or migrated) in Neon, the live site will reliably fetch and persist that data.
