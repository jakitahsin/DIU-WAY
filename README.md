# DIU WAY — Together on the Way.

> Your Campus. Your Friends. Your Ride.

DIU WAY is a commute board for a group of friends at **Daffodil International University**.
Everyone posts their weekly bus times (to campus and back home, Saturday–Thursday), and the
crew can see who is riding when, search by any mix of filters, and check
**"Who's going today?"** in Bangladesh time.

**Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Supabase
(Postgres + Auth + RLS) · React Hook Form + Zod · Lucide icons · Sonner toasts · Vercel-ready.

---

## Features

| Page | What it does |
|---|---|
| `/` Home | Hero on a real DIU campus photo, **live stats from the database** (friends registered, going today, returning today, most popular bus today), how-it-works, today preview |
| `/today` | **Who's Going Today?** and **Who's Coming Back Today?** — riders grouped by bus slot, using the `Asia/Dhaka` day. On Friday it shows Saturday's plan |
| `/friends` | **Our Travel Crew** — every member with a weekly summary; search, sort (A→Z, Z→A, most days, department), filter by department and day, member count |
| `/find` | **Find Friends** — combined server-side filters: name (autocomplete), department, day(s), going time, returning time. Results count, clear filters, loading / empty / error states. Filters live in the URL, so a search can be shared |
| `/my-schedule` | Profile (name + department, with "Other" → normalised, de-duplicated custom departments) and a 6-day schedule builder with toggles and tappable time slots. Save / Update, clear week, remove me |
| `/login` | Email + password sign-in, account creation, or passwordless **magic link** |

Other details: dark mode, mobile bottom tab bar, skeleton loading, toasts, keyboard-friendly
controls (skip link, focus rings, `role="switch"`/`radio`, Esc closes menus and dialogs),
reduced-motion support, view transitions.

### Bus slots

* Going to university: **7:00 AM, 8:30 AM, 10:00 AM, 12:00 PM**
* Returning home: **11:15 AM, 1:20 PM, 3:00 PM, 4:20 PM, 6:10 PM**

Times are stored as 24h strings (`"16:20"`) with database `CHECK` constraints and shown as
`4:20 PM`. Either time of a day may be left blank, but not both.

---

## Project structure

```
diu-way/
├─ supabase/
│  ├─ migrations/20261123000000_init.sql   # schema, indexes, RLS, RPC functions
│  └─ seed/
│     ├─ dev-sample-data.sql                # 14 fictional students — DEV ONLY
│     └─ remove-sample-data.sql             # wipes the sample data again
├─ src/
│  ├─ proxy.ts                              # session refresh + route protection (Next 16 "proxy")
│  ├─ app/
│  │  ├─ layout.tsx, page.tsx, globals.css  # shell, home, design tokens
│  │  ├─ today/ friends/ find/ my-schedule/ login/
│  │  ├─ auth/callback/route.ts             # magic link + email confirmation
│  │  └─ actions/ auth.ts, schedule.ts      # server actions
│  ├─ components/
│  │  ├─ Navbar, NavbarClient, Footer, Logo, ThemeToggle, HeroSection, StatsGrid
│  │  ├─ FriendCard, ScheduleCard, TimeBadge, DepartmentBadge, Avatar, TodayBoard
│  │  ├─ EmptyState, LoadingSkeleton, ConfirmationDialog, PageHeader, SetupNotice
│  │  ├─ filters/ SearchBar, DepartmentFilter, DayFilter, TimeFilter
│  │  ├─ schedule/ ScheduleEditor, ProfileForm, WeeklyScheduleForm
│  │  └─ ui/Button
│  └─ lib/
│     ├─ constants.ts  date.ts  validation.ts  types.ts  data.ts  cn.ts
│     └─ supabase/ env.ts  server.ts  proxy.ts
└─ .env.example
```

---

## Database design

```
auth.users ──1:1── profiles ──n:1── departments
                      │
                      └──1:n── weekly_schedules  (unique: user_id + day_of_week)
```

* **departments** — `name`, `long_name`, `slug` (normalised, **unique**), `aliases[]`,
  `is_custom`. Seeded with CSE, SWE, Entrepreneur, Pharmacy, NFE. Typing "software engineering",
  "Computer Science & Engineering", "eee " or "EEE" resolves to the same row, so custom
  departments never turn into unsearchable duplicates, and everyone can pick them afterwards.
* **profiles** — one row per auth user (`id` = `auth.users.id`), so editing never creates
  duplicates. `is_sample` marks dev seed rows.
* **weekly_schedules** — one row per user per day; `CHECK`s on day and times; at least one
  time required.
* Indexes: trigram + lower-case on `full_name`, `department_id`, `day_of_week`,
  `(day, going_time)`, `(day, returning_time)`, `user_id`.

**RPC functions**

| Function | Security | Purpose |
|---|---|---|
| `save_my_schedule(name, dept_id, custom_dept, schedule jsonb)` | invoker (RLS applies) | Upserts the caller's profile and whole week in **one transaction**; removes days you switched off |
| `resolve_department(name)` | definer, signed-in only | Finds a department by normalised name/alias or creates a custom one |
| `get_commute_stats(day)` | definer, public | Returns **counts only** for the home page (no names) |

### Row Level Security

* Signed-in members can **read** all profiles, departments and schedules.
* Members can **insert/update/delete only their own** profile and schedule rows
  (`auth.uid() = id` / `auth.uid() = user_id`) — nobody can write as someone else.
* Departments have no direct write policy; they are created only through `resolve_department`.
* Visitors who are not signed in have **no table access**; they only see the aggregate stats.
* The app uses only the public URL + publishable (anon) key. **No service-role key anywhere.**

---

## Supabase setup (≈5 minutes)

1. Create a free project at [supabase.com](https://supabase.com) → **New project**
   (region: Singapore is closest to Dhaka).
2. **SQL Editor → New query** → paste all of
   `supabase/migrations/20261123000000_init.sql` → **Run**.
   (With the Supabase CLI instead: `supabase link` then `supabase db push`.)
3. **Authentication → Sign In / Providers → Email**: keep it enabled.
   * For a quick start with friends you may turn **Confirm email** off — then "Create account"
     signs people in immediately. Leave it on if you prefer verified emails.
4. **Authentication → URL Configuration**
   * **Site URL**: `http://localhost:3000` while developing, your Vercel URL in production.
   * **Redirect URLs**: add `http://localhost:3000/auth/callback` and
     `https://YOUR-APP.vercel.app/auth/callback`.
5. **Project Settings → API keys**: copy the **Project URL** and the **publishable key**
   (`sb_publishable_…`, or the legacy `anon` key). Never copy the `service_role`/secret key
   into this app.

> Supabase's built-in email sender is rate-limited (a few emails per hour). For a bigger
> group, add your own SMTP under **Authentication → Emails → SMTP settings**, or turn off
> email confirmation and use password sign-in.

---

## Local development

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local        # Windows PowerShell: Copy-Item .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Open http://localhost:3000, create an account, and fill in **My Schedule**.

Useful scripts: `npm run lint`, `npm run build`, `npm start`.

### Sample data (development only)

Use a **separate dev Supabase project** for this — never the one your friends use.

1. Run the migration on the dev project.
2. SQL Editor → run `supabase/seed/dev-sample-data.sql`. It adds 14 fictional students
   (emails `@sample.diuway.test`, no password, cannot sign in) with varied departments —
   including custom ones (EEE, Civil Engineering, BBA, Multimedia and Creative Technology) —
   days and times. Rows are flagged `profiles.is_sample = true`.
3. Sign up with your own email to view them.
4. Remove everything with `supabase/seed/remove-sample-data.sql`.

The seed lives outside `supabase/migrations/`, so `supabase db push` never sends it to
production.

---

## Deploy to Vercel

1. Push the project to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo (framework: Next.js, defaults OK).
3. **Environment Variables** (Production + Preview):
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   * `NEXT_PUBLIC_SITE_URL` = `https://YOUR-APP.vercel.app`
4. Deploy.
5. Back in Supabase → **Authentication → URL Configuration**: set **Site URL** to the Vercel
   URL and add `https://YOUR-APP.vercel.app/auth/callback` to **Redirect URLs**.
6. Share the link with the crew. 🚌

---

## Images

Campus photos are loaded from the official site, `daffodilvarsity.edu.bd/images/…`
(building, aerial and student-life shots) through `next/image`, allowed in
`next.config.ts → images.remotePatterns`. If DIU moves these files, replace the URLs in
`src/lib/constants.ts → CAMPUS_IMAGES` (or drop your own photos in `public/` and point to
them). Photos © Daffodil International University. DIU WAY is an independent student
project, not an official DIU service.
