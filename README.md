# PHAfrique Project

A modern website and admin CMS for **PHAfrique Project** (Public Health en Afrique), built with Next.js 14, React, and TypeScript. The platform supports public health programs, internships and volunteering, and role-based content management.

---

## What It Does

- **Public site**: Programs, portfolios, opportunities (internships & volunteering), gallery, contact, and key content pages.
- **Admin panel** (`/admin`): Secure, role-based CMS to manage images, events (news), programs, projects, opportunities, applications, interns/volunteers, and content keys.
- **Applications**: Visitors can apply for internships or volunteer roles; admins review and accept/reject, and can add accepted applicants as interns/volunteers on the site.

---

## Key Features

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Animated hero, scroll-reveal sections, dark mode, mobile-responsive
- Admin: role-based access (e.g. SUPER_ADMIN, CO_FOUNDER, SOCIAL_MEDIA_MANAGER, NEWSLETTER_MANAGER)
- Internships & volunteering: list opportunities, submit applications, manage interns/volunteers and their profiles
- Backend: Prisma + PostgreSQL (Neon), NextAuth (credentials + Google OAuth for admin), REST APIs for admin CRUD and public read

---

## Tech Stack

| Area        | Technology                    |
|------------|-------------------------------|
| Framework  | Next.js 14 (App Router)       |
| Language   | TypeScript                    |
| Styling    | Tailwind CSS                  |
| Database   | PostgreSQL (Neon, pooled connection) |
| Auth       | NextAuth.js                   |
| Deployment | Vercel (or Node.js standalone)   |

---

## Installation

### Prerequisites

- **Node.js** 18+ and **npm**

### Steps

1. **Clone and enter the project**  
   (If you rename the root folder, use `PHAfrique-Project` for consistency.)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment**
   - Copy `env.example` to `.env`
   - **Required:** `DATABASE_URL` (Neon PostgreSQL pooled URL), `NEXTAUTH_URL` (e.g. `http://localhost:3000`), `NEXTAUTH_SECRET`
   - **Admin (email/password):** `ADMIN_EMAIL`, and either `ADMIN_PASSWORD` (plain) or `ADMIN_PASSWORD_HASH` (bcrypt). For the default super-admin (denmaombi@gmail.com), `ADMIN_PASSWORD` is used on first login.
   - **Google login (admin):** Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Add redirect URI `http://localhost:3000/api/auth/callback/google` for local; only admin users in the DB can sign in with Google.
   - **Image uploads:** Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (and optional `CLOUDINARY_UPLOAD_FOLDER`) so uploads go to Cloudinary; only URLs are stored in the database.

4. **Database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
   `db:seed` adds sample programs, projects, opportunities, and content keys. Use a Neon PostgreSQL connection string for `DATABASE_URL` (no SQLite in production).

5. **Run locally**
   ```bash
   npm run dev
   ```
   - Site: [http://localhost:3000](http://localhost:3000)  
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

   **If you see "localhost refused to connect" or ERR_CONNECTION_REFUSED:**  
   The dev server is not running. From the project root run `npm run dev` and wait until you see "Ready in …" before opening http://localhost:3000. On Windows PowerShell use `npm run dev` (no `&&`); the script is already configured for port 3000.

---

## Build for Production

```bash
npm run build
npm start
```

Uses Next.js `standalone` output; run `npm start` on the server.

---

## Folder Structure

```
PHAfrique-Project/
├── public/                 # Static assets (images, logos, uploads at runtime)
├── prisma/
│   ├── schema.prisma       # Data models (Program, Project, Opportunity, Application, Participant, etc.)
│   ├── seed.js             # Seed script
│   └── dev.db              # (Optional local SQLite; production uses Neon) |
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API routes (auth, admin, public)
│   │   ├── admin/          # Admin UI (login, dashboard, CRUD pages)
│   │   ├── about, contact, opportunities, gallery, …  # Public pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         # React components (ui, admin, sections)
│   ├── contexts/          # React context (e.g. theme)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # DB, auth, admin helpers, mailer, upload
│   ├── types/              # TypeScript declarations (e.g. next-auth)
│   └── styles/             # Global CSS
├── middleware.ts           # Protects /admin, redirects to /admin/login
├── next.config.js
├── package.json
├── env.example
└── README.md
```

---

## Scripts

| Script                | Description                    |
|-----------------------|--------------------------------|
| `npm run dev`         | Start dev server (port 3000)  |
| `npm run build`       | Production build               |
| `npm start`           | Run production server         |
| `npm run db:generate` | Generate Prisma client        |
| `npm run db:push`     | Sync schema to PostgreSQL (Neon) |
| `npm run db:seed`     | Seed database                  |

---

## Deployment

- **Node.js hosting**: Build with `npm run build`, then run `npm start`. Ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set in production; use HTTPS.
- **Environment**: Provide all required variables from `env.example` (no secrets in this repo). Keep `.env` out of version control.
- **Database**: Run `npx prisma generate` and `npx prisma db push` (and optionally `db:seed`) on the server or in your deploy pipeline.

### Deploy to Vercel

This project is ready for [Vercel](https://vercel.com). No GitHub Pages deployment.

**Steps**

1. **Import** the repo at [vercel.com](https://vercel.com) (sign in with GitHub).
2. **Environment variables** — set these in Vercel (Settings → Environment Variables). Use the same names as in `env.example`:

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `NEXTAUTH_URL` | Yes | Your live URL, e.g. `https://your-app.vercel.app` (Vercel sets this automatically; override if using a custom domain) |
   | `NEXTAUTH_SECRET` | Yes | e.g. `openssl rand -base64 32` — keep secret |
   | `DATABASE_URL` | Yes | Neon PostgreSQL pooled connection string. Do not use SQLite in production. |
   | `CLOUDINARY_CLOUD_NAME` | Yes (for uploads) | From Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | Yes (for uploads) | From Cloudinary dashboard |
   | `CLOUDINARY_API_SECRET` | Yes (for uploads) | From Cloudinary dashboard |
   | `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` | For admin login | For email/password admin login (super-admin) |
   | `GOOGLE_CLIENT_ID` | For Google login | From [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Add redirect URI `https://your-app.vercel.app/api/auth/callback/google` |
   | `GOOGLE_CLIENT_SECRET` | For Google login | From same OAuth client |
   | `ADMIN_EMAIL` | Optional | Default admin email |
   | SMTP_* | Optional | For application status emails |

3. **Deploy.** After the first deploy, run your database migrations (e.g. Prisma) in the Vercel project or via your DB provider. Seed admin users (`npm run db:seed`) or create them via the app so that Google sign-in works for those emails.

**Post-deploy:** Admin at `https://your-app.vercel.app/admin`, Google login and email/password login both work for users in the admin list. All images, APIs, and features mirror local.

**Other hosts** (Netlify, Railway, Render): Use the same env vars; ensure Node.js and a persistent database are supported.

---

## License

© PHAfrique Project. All rights reserved.
