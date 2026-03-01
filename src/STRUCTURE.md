# PHAfrica — Project Structure

Quick reference for navigation and naming. Logic and UI are unchanged.

## Routes (App Router)

**Public pages only:** Home, About, Programs, Portfolios, Opportunities, Contact. There is no `/projects` route; the Portfolios page lives at `/portfolios`.

| Route | Purpose |
|-------|--------|
| `/` | Home — Hero, Portfolios section, **Programs** section, Team, CTA |
| `/about` | About |
| `/contact` | Contact |
| `/programs` | **Programs** list (admin-managed program cards) |
| `/portfolios` | **Portfolios** page (Mental Health, Ethics, Environmental, Maternal) |
| `/opportunities` | Internships & volunteering |
| `/gallery` | Gallery (org images) |
| `/news` | News / updates |
| `/resources` | Resources |
| `/terms`, `/privacy` | Legal |
| `/admin/*` | Admin dashboard, CRUD for programs, portfolio projects, events, etc. |

## Naming Conventions

- **Programs** = Admin-managed initiatives/campaigns (CRUD in admin). Shown at `/programs` and in the “Our Programs” section on the home page.
- **Portfolios** = Fixed focus areas (Mental Health, Ethics, Environmental, Maternal). Shown at `/portfolios` and in the “Our Portfolios” section on the home page.
- **Projects** (in DB/admin) = Portfolio-type items managed in admin (e.g. “Portfolio” in admin nav). Public portfolios content is the fixed section above; admin “Portfolio” is the Project model.

## Components

### `components/sections/`
Reusable page sections (home and elsewhere).

- `Hero.tsx` — Home hero
- `Stats.tsx`, `AboutSection.tsx`, `Team.tsx`, `CTA.tsx` — Home sections
- **`ProgramsSection.tsx`** — “Our Programs” cards + “Learn more” → modal (uses program data)
- **`PortfolioSection.tsx`** — “Our Portfolios” cards (fixed content: Mental Health, Ethics, etc.)

### `components/program/`
Program-specific UI (single level, no deep nesting).

- `ProgramDetailModal.tsx` — Modal opened by “Learn more” on a program card

### `components/ui/`
Shared UI: `Header.tsx`, `Footer.tsx`, `ValueStrip.tsx`, etc.

### `components/modals/`
e.g. `DonationModal.tsx`

### `components/admin/`
Admin layout/shell: `AdminShell.tsx`

## Lib, API, Hooks

- `lib/` — `programs.ts`, `db.ts`, `auth.ts`, `upload.ts`, `mailer.ts`, `utils.ts`, `admin.ts`
- `app/api/` — Next.js API routes (auth, admin CRUD, contact, public data)
- `hooks/` — e.g. `useInView.ts`
- `contexts/` — e.g. `ThemeContext.tsx`

## Summary

- **Programs** → `ProgramsSection`, `ProgramDetailModal`, `/programs`, admin “Programs”.
- **Portfolios** → `PortfolioSection`, `/portfolios`, “Our Portfolios” content; admin “Portfolio” = Project model.

No unnecessary nesting; one place per concept.
