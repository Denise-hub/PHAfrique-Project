# PHAfrique Project — Firebase + Cloudinary Deployment Plan

This plan gets your Next.js app live on **Firebase** with **Cloudinary** for media and **Neon PostgreSQL** for data, using the same logic as locally. No design or core logic changes.

---

## Do you need to push to Git before starting?

| Deployment method | Push to Git first? |
|-------------------|--------------------|
| **Firebase App Hosting** (deploy from GitHub) | **Yes.** Connect the repo to Firebase; every push deploys. |
| **Firebase Hosting + Cloud Functions** (deploy from your machine with CLI) | **No.** You can deploy from your local project without pushing. You may still want to push afterward to keep the repo in sync. |

Recommendation: **push your current project to GitHub** (or your Git host) before starting. That way you have a backup, can use App Hosting later if you want, and keep one source of truth.

---

## What stays the same

- **Database:** Neon PostgreSQL (no change). Use the same `DATABASE_URL` you used for Vercel.
- **Media:** Cloudinary (already in the app). Same env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, optional `CLOUDINARY_UPLOAD_FOLDER`.
- **Auth:** NextAuth (email/password + Google). Same env vars: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- **App logic and UI:** No changes to design or core logic.

---

## Prerequisites

1. **Node.js** (v18+) and **npm** on your machine.
2. **Firebase project** — [Create one](https://console.firebase.google.com/) if you don’t have it.
3. **Billing (Blaze plan)** enabled on that project — required for Cloud Functions (SSR and API routes).
4. **Neon** — Your PostgreSQL connection string (same as before).
5. **Cloudinary** — Same cloud name, API key, secret (and optional folder).
6. **Google Cloud / NextAuth** — Same OAuth client if you use Google sign-in.

---

## Step-by-step plan

### Phase 1: Prepare the project (local)

#### Step 1.1 — Push to Git (recommended)

1. Commit all current changes.
2. Push the repo to GitHub (or your Git host).
3. Note the repo URL; you’ll use it for App Hosting or for reference.

#### Step 1.2 — Make Next.js play nicely with Firebase

Firebase runs your app on **Cloud Functions**. Your app already has:

- `output: 'standalone'` in `next.config.js` — keep it.
- API routes under `app/api/` — they will run as serverless functions.
- Dynamic pages and server components — they need a Node server, which Firebase provides via Cloud Functions.

One config change is needed so the app knows its public URL when running on Firebase (for NextAuth and links):

- In **production**, `NEXTAUTH_URL` must be your **Firebase Hosting URL** (e.g. `https://your-project-id.web.app` or your custom domain). We’ll set this in Firebase config; no need to hardcode it in the repo.

No other app logic or design changes are required.

#### Step 1.3 — (Optional) Add a Firebase-friendly env fallback

So the same code works locally and on Firebase, you can add a fallback for the auth URL when not on Vercel (e.g. use a Firebase Hosting URL from env). This is optional; setting `NEXTAUTH_URL` in Firebase is enough.

---

### Phase 2: Install Firebase CLI and log in

#### Step 2.1 — Install Firebase CLI

```bash
npm install -g firebase-tools
```

Or with npx (no global install):

```bash
npx firebase-tools --version
```

Use version **12.1.0 or later**.

#### Step 2.2 — Log in and select project

```bash
firebase login
```

Then:

```bash
firebase use --add
```

Select your Firebase project (or create one in the console first). Choose an alias (e.g. `default`).

---

### Phase 3: Initialize Firebase in the project

#### Step 3.1 — Enable web frameworks (required for Next.js)

```bash
firebase experiments:enable webframeworks
```

#### Step 3.2 — Initialize Hosting

From the **project root** (same folder as `package.json`):

```bash
firebase init hosting
```

When prompted:

1. **“Use an existing project or create a new project?”** — Use your existing Firebase project.
2. **“What do you want to use as your public directory?”** — Accept the default (e.g. `public`) or whatever the CLI suggests for a framework. For Next.js, the CLI often detects the app and may suggest something like `out` or use a preset; follow the prompts.
3. **“Configure as a single-page app (rewrite all urls to /index.html)?”** — **No** (Next.js has many routes).
4. **“Set up automatic builds and deploys with GitHub?”** — Optional. Say **Yes** if you want App Hosting–style deploys on push; **No** if you prefer to deploy from your machine with `firebase deploy`.
5. **“Do you want to use a web framework?”** — **Yes** (experimental).
6. **“Please choose the framework.”** — **Next.js**.

This creates (or updates):

- `firebase.json` — Hosting and (if applicable) Cloud Functions config.
- `.firebaserc` — Project alias.
- Possibly `firebase.json` rewrites so `/api/*` and dynamic routes hit the Next.js server.

Do **not** overwrite your `next.config.js` if the CLI asks; keep your existing config.

---

### Phase 4: Configure environment variables for production

Your app needs these in production (same as before, only the host changes):

| Variable | Where to get it | Notes |
|----------|------------------|--------|
| `DATABASE_URL` | Neon dashboard | PostgreSQL connection string (pooled). |
| `NEXTAUTH_SECRET` | Generate (e.g. 32+ random chars) | Same as you used for Vercel. |
| `NEXTAUTH_URL` | Your live URL | **After first deploy:** `https://YOUR-PROJECT-ID.web.app` (or custom domain). Set this **after** you know the Hosting URL. |
| `ADMIN_PASSWORD` | Your choice | Password for the main admin (e.g. denmaombi@gmail.com). |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | Same as before. |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | Same as before. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard | Same as before. |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard | Same as before. |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard | Same as before. |
| `CLOUDINARY_UPLOAD_FOLDER` | Optional | e.g. `phafrique`. |

**Where to set them for Firebase:**

- **If using Firebase Hosting + Cloud Functions (CLI deploy):**  
  Set these in **Firebase Console → Project → Build → Hosting** (if your UI has “Environment” or “Config”) or, for **Cloud Functions**, in **Firebase Console → Functions → your function → Environment variables / Secrets**.  
  Alternatively, use a `.env.production` file **only if** you are sure it is not committed (e.g. in `.gitignore`). Prefer Firebase Console so secrets stay off the repo.

- **If using Firebase App Hosting (GitHub):**  
  In **Firebase Console → App Hosting → your backend → Environment variables**, add each variable above. Set `NEXTAUTH_URL` after the first deploy (use the Hosting URL App Hosting gives you).

---

### Phase 5: First build and deploy

#### Step 5.1 — Build locally (sanity check)

From project root:

```bash
npm run build
```

Fix any build errors before deploying.

#### Step 5.2 — Deploy to Firebase

```bash
firebase deploy
```

This will:

- Build the Next.js app (if the CLI is configured to run the build).
- Deploy static assets to Firebase Hosting.
- Deploy server-side logic (API routes, SSR, dynamic routes) to **Cloud Functions for Firebase**.

Deployment can take several minutes the first time (Cloud Functions creation).

#### Step 5.3 — Get your live URL

After deploy, the CLI prints the Hosting URL, e.g.:

- `https://YOUR-PROJECT-ID.web.app`  
- or `https://YOUR-PROJECT-ID.firebaseapp.com`

Open that URL and test the site.

#### Step 5.4 — Set NEXTAUTH_URL and redeploy (if needed)

If you didn’t set `NEXTAUTH_URL` before (because you didn’t know the URL):

1. In Firebase Console, set **NEXTAUTH_URL** to your live URL (e.g. `https://YOUR-PROJECT-ID.web.app`).
2. In **Google Cloud Console**, update the OAuth client **Authorized redirect URIs** to include:
   - `https://YOUR-PROJECT-ID.web.app/api/auth/callback/google`
   - (and same for `.firebaseapp.com` if you use that).
3. Redeploy so the new env is picked up: `firebase deploy`.

---

### Phase 6: Database and content

- **Neon:** No change. The app already uses `DATABASE_URL`; point it to the same Neon DB you used for Vercel.
- **Seeding:** If Neon is empty, run the seed **once** from your machine (with `DATABASE_URL` pointing to Neon):

  ```bash
  set DATABASE_URL=your_neon_url
  npm run db:push
  npm run db:seed
  ```

  (Use your shell’s syntax for setting env vars; e.g. on Windows PowerShell use `$env:DATABASE_URL="..."`.)

- **Content:** All new content (News, Gallery, Opportunities, Interns, Volunteers) is created in the **admin panel on the live site**; images go to **Cloudinary** and metadata to **Neon**. No “empty sections” once you’ve added content there (or run seed and then add more via admin).

---

### Phase 7: Verify end-to-end

1. **Public site** — Home, About, Opportunities, Gallery, News, Contact. No empty sections if content exists in Neon and Cloudinary.
2. **Admin** — Log in (email/password and/or Google). Create News, upload Gallery images, create Opportunities, add Interns/Volunteers. Confirm they persist after refresh and appear on the public site.
3. **Applications** — Submit an application from the public Opportunities page; it should appear under Admin → Applications and persist in Neon.

---

## If you use Firebase App Hosting (deploy from GitHub)

1. Push the project to GitHub (if not already).
2. In **Firebase Console → Build → App Hosting**, create a new backend and connect the GitHub repo.
3. Select the repo and branch (e.g. `main`).
4. Set **build command** to `npm run build` (or the value from your `package.json`).
5. Set **output directory** per Firebase’s Next.js instructions (they may auto-detect).
6. Add all **environment variables** from the table above in App Hosting’s env config. Set `NEXTAUTH_URL` after the first deploy.
7. Save and deploy. Subsequent pushes to the connected branch will trigger new deploys.

---

## Summary checklist

- [ ] Project pushed to Git (recommended).
- [ ] Firebase CLI installed and logged in; project selected.
- [ ] `firebase experiments:enable webframeworks` run.
- [ ] `firebase init hosting` completed; Next.js chosen as framework.
- [ ] All production env vars set in Firebase (Neon, NextAuth, Cloudinary, Google OAuth).
- [ ] `NEXTAUTH_URL` set to the Firebase Hosting URL after first deploy; OAuth redirect URIs updated.
- [ ] `npm run build` succeeds locally.
- [ ] `firebase deploy` succeeds.
- [ ] Neon DB seeded (if empty); content added via live admin.
- [ ] Public site and admin tested; media on Cloudinary; no empty sections when data exists.

Using this plan, the live site runs on Firebase with the same logic as locally, media on Cloudinary, and data in Neon, without changing design or core logic.
