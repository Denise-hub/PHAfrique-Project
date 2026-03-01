# Admin panel – database setup

If you see **Access Denied**, **login failure**, **Internal Server Error**, or **"Database error"** when creating admins:

1. **From the project root** (where `package.json` and `.env` are), run:

   ```bash
   npm run db:setup
   npm run db:seed
   ```

   - `db:setup`: runs `prisma generate` → `prisma db push` → sync script (adds `displayName` / `imageUrl` to `AdminUser`).
   - `db:seed`: creates admin users, including **denmaombi@gmail.com** as SUPER_ADMIN. Without this, no one can sign in (Google or credentials).

2. **Ensure `.env` has** (SQLite):

   ```
   DATABASE_URL="file:./dev.db"
   ```

   The path is relative to the `prisma/` folder, so `./dev.db` = `prisma/dev.db`.

3. **Sign-in options for denmaombi@gmail.com** (SUPER_ADMIN):

   - **Google sign-in**: After `db:seed`, sign in with Google using denmaombi@gmail.com; no password needed.
   - **Email/password**: Set the password for denmaombi@gmail.com (one-time). **Option A** – from the app (recommended):
     - Ensure `.env` has `ADMIN_PASSWORD=YourPassword` (same password you will type on the login form).
     - With the dev server running, run in a terminal:  
       `curl -X POST http://localhost:3000/api/admin/set-super-admin-password -H "x-setup-secret: YOUR_NEXTAUTH_SECRET"`  
       (replace `YOUR_NEXTAUTH_SECRET` with the value of `NEXTAUTH_SECRET` from your `.env`).
     - Then sign in with that email and password.  
   **Option B** – Node script: add `ADMIN_PASSWORD=YourPassword` to `.env`, then run `npm run db:set-super-admin-password`.

4. **Restart the dev server** after DB changes:

   ```bash
   npm run dev
   ```

Then open `/admin/login` and sign in with denmaombi@gmail.com (Google or email/password).

**If Google still shows “Access Denied”** for denmaombi@gmail.com, ensure that email is in the DB:

```bash
npm run db:ensure-super-admin
```

This creates or updates only that user to role SUPER_ADMIN without re-running the full seed.
