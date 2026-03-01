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
- Backend: Prisma + SQLite, NextAuth (credentials + optional Google OAuth), REST APIs for admin CRUD and public read

---

## Tech Stack

| Area        | Technology                    |
|------------|-------------------------------|
| Framework  | Next.js 14 (App Router)       |
| Language   | TypeScript                    |
| Styling    | Tailwind CSS                  |
| Database   | SQLite (Prisma ORM)           |
| Auth       | NextAuth.js                   |
| Deployment | Node.js (standalone output)   |

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
   - Set `DATABASE_URL` (e.g. `file:./dev.db`; path is relative to `prisma/`)
   - Set `NEXTAUTH_URL` (e.g. `http://localhost:3000`) and `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`)
   - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (bcrypt). Generate hash:  
     `node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD', 10))"`
   - Optional: Google OAuth, SMTP (see `env.example`)

4. **Database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
   `db:seed` adds sample programs, projects, opportunities, and content keys.

5. **Run locally**
   ```bash
   npm run dev
   ```
   - Site: [http://localhost:3000](http://localhost:3000)  
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

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
│   └── dev.db              # SQLite DB (created by db push)
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
| `npm run db:push`     | Sync schema to SQLite          |
| `npm run db:seed`     | Seed database                  |

---

## Deployment

- **Node.js hosting**: Build with `npm run build`, then run `npm start`. Ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set in production; use HTTPS.
- **Environment**: Provide all required variables from `env.example` (no secrets in this repo). Keep `.env` out of version control.
- **Database**: Run `npx prisma generate` and `npx prisma db push` (and optionally `db:seed`) on the server or in your deploy pipeline.

### GitHub Pages (static snapshot)

A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) builds a **static export** and deploys it to GitHub Pages on every push to `main`. The site will be at:

**https://denise-hub.github.io/PHAfrique-Project/**

- **Custom domain error:** If GitHub shows *"The custom domain 'phafrique' is not properly formatted"*, fix it in **Settings → Pages**:
  - Either **clear the custom domain** (leave it empty) to use the default `*.github.io` URL above, or  
  - Enter a **full domain**, e.g. `www.phafrique.com` or `phafrique.com` (not just `phafrique`). You must own the domain and add the DNS records GitHub shows.
- **Build and deployment:** Under **Source**, keep **GitHub Actions** selected. The "Next.js" workflow runs automatically on push to `main`.
- **Limitation:** GitHub Pages serves static files only. The deployed site is a static snapshot (no admin login, no API, no live database). For the full app with admin and database, use a Node.js host (e.g. [Vercel](https://vercel.com), Netlify, or your own server).

---

## License

© PHAfrique Project. All rights reserved.
