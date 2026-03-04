## PHAfrique Project

A Next.js site and admin console for **PHAfrique Project (Public Health en Afrique)**.  
The public site presents programmes, opportunities, news, and a media gallery; the admin panel provides a secure CMS for managing all content.

---

## 1. Overview

- **Public site**
  - Programmes, portfolios, opportunities (internships and volunteering)
  - News and events
  - Gallery and core content sections
- **Admin panel** (`/admin`)
  - Role‑based access (SUPER_ADMIN, CO_FOUNDER, SOCIAL_MEDIA_MANAGER, NEWSLETTER_MANAGER)
  - Manage images, captions, programmes, projects, opportunities, applications, participants and content keys
  - All uploaded images are stored in Cloudinary and referenced by URL in the database

Tech stack: **Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Prisma, Neon PostgreSQL, NextAuth, Cloudinary**, deployed on **Vercel**.

---

## 2. Installation and local setup

### Prerequisites

- Node.js **18+**
- An empty **Neon PostgreSQL** database
-

### Steps

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create environment file**

   ```bash
   cp env.example .env
   ```

   Minimum variables to set for local development:

   - `DATABASE_URL` – Neon connection string  
   - `NEXTAUTH_URL` – e.g. `http://localhost:3000`  
   - `NEXTAUTH_SECRET` – any random string  
   - `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`) – password for the super‑admin  
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – Cloudinary credentials

3. **Prepare the database**

   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

   The seed script creates:

   - Initial admin users (including the super‑admin email)  
   - Sample programmes, portfolios, opportunities and content keys

4. **Run the development server**

   ```bash
   npm run dev
   ```

   - Public site: `http://localhost:3000`  
   - Admin panel: `http://localhost:3000/admin`

---

## 3. Production build and deployment

### Build locally

```bash
npm run build
npm start
```

The app uses Next.js `standalone` output; `npm start` runs the production server.

### Deploying on Vercel

1. Import the repository into Vercel.
2. In **Project → Settings → Environment Variables**, configure the same keys you use locally (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Cloudinary variables, admin password, and optional Google OAuth keys).
3. Trigger a deployment (Vercel will also run `prisma generate` during the build).
4. Run migrations and seed (if needed) against the Neon database you connected to `DATABASE_URL`.

The production admin panel is available at:

- `https://<your-domain>/admin`

Only emails present in the `AdminUser` table can sign in.

---

## 4. Useful scripts

| Script                | Purpose                                              |
|-----------------------|------------------------------------------------------|
| `npm run dev`         | Start the development server on port 3000           |
| `npm run build`       | Create a production build                            |
| `npm start`           | Run the production server                            |
| `npm run db:generate` | Generate the Prisma client                           |
| `npm run db:push`     | Push the Prisma schema to the configured database   |
| `npm run db:seed`     | Seed admin users and sample content                  |

---

© PHAfrique Project. All rights reserved.
