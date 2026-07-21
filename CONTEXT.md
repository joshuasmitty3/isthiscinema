# isthiscinema.com — project context

Context file for starting a fresh chat about this codebase. Last verified 2026-07-20.

---

## What it is

A private movie tracking app for two people (the owner and his wife). Login-protected,
no public signup. Two lists: "worth watching" and "already watched", plus movie search
backed by OMDB.

Live at **isthiscinema.com**. Repo: `joshuasmitty3/isthiscinema`.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 18.3 + TypeScript 5.6, built with Vite 5.4 |
| Routing | wouter 3.3 (not react-router) |
| Server state | @tanstack/react-query 5.60 |
| Client state | zustand 5.0 |
| Styling | Tailwind 3.4 + shadcn-style Radix components |
| Backend | Express 4.21 in TypeScript, run via `tsx` |
| Database | Neon PostgreSQL via Drizzle ORM 0.39 |
| Auth | cookie-session 2.1 (no session table) |
| External API | OMDB (posters, plot, metadata) |

Hosting: **Render** web service, auto-deploys on push to `main`. Domain registered at
Porkbun, DNS points to Render.

---

## Repo layout

```
client/
  index.html                 # Google Fonts links, favicon, theme <style> injected here at build
  public/                    # served at / — mark.png, favicon.png, apple-touch-icon.png
  src/
    App.tsx                  # auth gate + top-level routing
    main.tsx
    pages/
      Home.tsx               # the whole logged-in app: tabs + inline search input
      LoginPage.tsx
      SetupPage.tsx          # first-run account creation
      not-found.tsx
    components/
      Layout.tsx             # brand line (header) + footer wrapper
      WatchList.tsx          # "worth watching"
      WatchedList.tsx        # "already watched"
      MovieCard.tsx          # card used by WatchList
      MovieDetail.tsx        # detail modal
      SearchResults.tsx
      ReviewModal.tsx
      ErrorBoundary.tsx, ListSkeleton.tsx, MovieSkeleton.tsx
      ui/                    # 47 shadcn components, most unused
    lib/
      api.ts                 # all fetch calls
      movies.ts              # zustand store + react-query hooks
      types.ts, queryClient.ts, utils.ts, csvUtils.ts, downloadUtils.ts
    hooks/                   # use-search, use-toast, use-mobile
    utils/                   # errorHandler, logger
server/
  index.ts                   # express setup, cookie-session middleware
  routes.ts                  # every API endpoint + auth routes
  auth.ts                    # bcrypt + requireAuth
  storage.ts                 # all Drizzle queries
  db.ts, vite.ts
shared/
  schema.ts                  # Drizzle tables + shared types + StorageInterface
migrations/                  # drizzle-kit output
theme.json                   # shadcn theme — primary colour lives HERE, not in CSS
tailwind.config.ts
vite.config.ts
```

---

## Data model (`shared/schema.ts`)

```
users        id, username (unique), password (bcrypt)
movies       id, imdbId (unique), title, year, director, poster, plot,
             runtime, genre, actors
watch_list   id, userId, movieId, order (NOT NULL), createdAt
watched_list id, userId, movieId, watchedDate, review, rating
```

`movies` is a shared cache keyed by `imdbId`. The per-user lists reference it by
`movieId`. Everything user-facing is scoped by `req.session.userId`.

**About `watch_list.order`:** drag-to-reorder was removed from the UI in July 2026, but
the column was deliberately kept because it still drives ordering. Inserts compute
`max(order) + 1`; reads use `.orderBy(desc(watchList.order))`. Net effect: **newly added
movies appear at the top**. Don't drop this column without changing the read path.

---

## API surface (`server/routes.ts`)

```
POST   /api/login
POST   /api/logout
GET    /api/me
POST   /api/setup

GET    /api/movies/search
GET    /api/movies/:imdbId

GET    /api/watchlist
POST   /api/watchlist
DELETE /api/watchlist/:movieId

GET    /api/watchedlist
POST   /api/watchedlist
PUT    /api/watchedlist/:movieId/review
DELETE /api/watchedlist/:movieId

POST   /api/movies/:movieId/move-to-watched
GET    /api/export/csv
```

---

## Environment variables

Set on Render only — **there is no `.env` in the repo or on the dev machine.**

```
DATABASE_URL      Neon connection string
OMDB_API_KEY      OMDB
SESSION_SECRET    cookie-session signing
NODE_ENV
```

---

## Design system (current, post-July 2026 redesign)

- **Primary colour:** burgundy `hsl(345, 48%, 24%)` — set in `theme.json`
- **Wordmark font:** Space Grotesk, via the `font-heading` Tailwind class
- **Body font:** Inter, set as `fontFamily.sans` in `tailwind.config.ts`
- Both fonts load from Google Fonts via `<link>` in `client/index.html`
- **Copy is lowercase throughout** — "sign out", "worth watching", "already watched",
  "is this cinema?". Keep this.
- **No header bar.** There's a "brand line" at the top of `Layout.tsx`: the Bolex mark
  (40px) + wordmark on the left, sign out on the right, all sitting directly on the
  `neutral-100` page background.
- `client/public/mark.png` is a vintage Bolex camera illustration with the cream
  background alpha-knocked-out, served at 120px for a 40px slot (3× retina).
- Movie cards sit directly on the page — no `Card` wrapper. White, `rounded-lg`,
  `border-neutral-200`, `shadow-sm`.
- Use the `primary` token for accents, never hardcoded hex. Two hardcoded browns were
  removed in the redesign; don't reintroduce that pattern.

---

## Build & deploy

```
npm run dev      # tsx server/index.ts — NEEDS DATABASE_URL, won't boot without it
npm run build    # vite build + esbuild bundle of the server
npm run check    # tsc
npm run db:push  # drizzle-kit push — DESTRUCTIVE-ish, needs DATABASE_URL
```

Push to `main` → Render auto-deploys, ~2–3 minutes. There is no staging environment.

---

## Gotchas — read this before changing anything

**1. You probably can't run the app locally.**
No `.env` exists on the dev machine and `DATABASE_URL` is unset, so `npm run dev` will
fail. Don't ask the owner to paste the connection string into chat. Verify changes
another way (see below).

**2. How to verify frontend changes without a database.**
`npx vite build` proves it compiles. To actually *see* a change, build and then render
the real compiled CSS in a static harness:
- `dist/public/assets/index-*.css` is the compiled Tailwind output
- `dist/public/index.html` contains a `<style data-vite-theme>` block with the CSS
  variables — you need **both** for colours to resolve
- Write a harness HTML that pulls in the theme block + the CSS + the real component
  markup, serve it over localhost, and screenshot it
This catches real problems (a mockup won't). Note the preview browser blocks external
hosts, so Google Fonts won't load — reference local `.woff2` files in the harness instead.

**3. The theme colour is not in the CSS bundle.**
`@replit/vite-plugin-shadcn-theme-json` reads `theme.json` and injects `--primary` etc.
as an inline `<style>` in the built `index.html`. Grepping the CSS for the colour will
find nothing. To change the primary colour, edit `theme.json`.

**4. The search input is inside a tab trigger.**
In `Home.tsx` the third `TabsTrigger` uses `asChild` and contains a bare `<input>`. So
the search box *is* the third tab. This is surprising but intentional. There used to be
a `SearchBar.tsx` component — it was imported but never rendered and referenced an
undefined `useSearch`, so it was deleted. Don't recreate it; edit `Home.tsx`.

**5. Two pre-existing type errors.**
`npm run check` reports exactly 2 errors, both long-standing and unrelated to app logic:
- `server/routes.ts` — no type declarations for `json2csv`
- `server/vite.ts` — `allowedHosts: boolean` doesn't match vite's `ServerOptions`
If you see 2 errors, that's the baseline, not something you broke. More than 2 means
you broke something.

**6. Vite paths are non-obvious.**
`root` is `client/`, so `publicDir` is `client/public` (served at `/`) and build output
goes to `dist/public`. Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`.

**7. Git remote uses a machine-local SSH alias.**
The owner has two GitHub accounts. This machine's default SSH key authenticates as
`teanamedcoffee`, which lacks write access here. The remote is set to
`git@github-josh:joshuasmitty3/isthiscinema.git`, where `github-josh` is an alias in
`~/.ssh/config` pointing at a separate key. **This alias only exists on that machine** —
a clone anywhere else should use the normal `git@github.com:...` URL. Verify auth with
`ssh -T git@github-josh`; it should say "Hi joshuasmitty3!".

**8. `client/src/components/ui/` has 47 shadcn components and most are unused.**
Their presence doesn't mean they're wired up. Check before assuming.

---

## Recent work (July 2026)

One commit, `97c255c`:
- Left-aligned the search icon; deleted dead `SearchBar.tsx`
- Removed drag-to-reorder entirely (client, store, API, route, storage,
  `@hello-pangea/dnd`). Bundle 425 kB → 322 kB, 132 → 100 kB gzipped
- Removed the `Card` wrapper around both lists
- Redesigned the header: burgundy, no bar, Bolex mark, Space Grotesk
- Renamed "is it cinema?" → "is this cinema?" everywhere including the page title
- Paired Inter as the body font
- Deleted unused `Footer.tsx`

---

## Known backlog

- **Fonts load from Google Fonts.** Render-blocking third-party request; may cause a
  flash of fallback text on cold load. Fix would be self-hosting two `.woff2` files in
  `client/public/` (~70 kB).
- **The Bolex mark is small at 40px.** It's a detailed technical illustration and doesn't
  fully read at that size. An idea worth considering: use it large (200 px+) on the login
  page, where there's room, and keep the app chrome minimal.
- **The 2 type errors above.**
- No tests, no CI, no staging environment.
