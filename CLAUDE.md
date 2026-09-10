# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server (HMR)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # eslint . — CI runs this as a gate before build/deploy
```

There is no test runner configured in this repo (no test script, no Vitest/Jest). Don't assume one exists.

CI (`.gitea/workflows/deploy-dev.yml`) on push to `develop`: `lint` job must pass before `build` (Docker image push to the registry) and `deploy` (docker compose up on the dev host) run.

## Architecture

### Not react-router — a single `screen` string in context

There is no router library. `src/state/AppContext.jsx` holds one piece of state, `screen` (a string key like `'epHome'`, `'empContratos'`, `'adminDash'`), plus `role` and free-form `opts`. Navigation is `const { go } = useApp(); go('someScreenKey', optionalOpts)`.

`src/App.jsx` maps every screen key to a lazy-loaded page component in one big `screens` object and renders `screens[screen]`, wrapped in a single `<Suspense>`. **When adding a new screen: add the page file, add a `const X = lazy(() => import(...))` line in `App.jsx`, and add the `screenKey: <X />` entry to the `screens` map — there is no separate route config.**

Screen-key prefixes tell you which role/section a page belongs to:
- `splash`, `login`, `roleSelect`, `solicitarContrato`, `kyc*` — pre-auth / onboarding (`src/pages/auth/`)
- `admin*` — bank admin console (`src/pages/admin/`)
- `ep*` — "Empresa Pequeña" (PYME) portal (`src/pages/empresa-pequena/`), components/exports prefixed `Ep`
- `emp*` — "Empresa Contratante" (anchor company) portal (`src/pages/contratante/`), components/exports prefixed `Emp`

`AppShell` (`src/components/layout/AppShell.jsx`) is the persistent chrome (Topbar + Sidebar) every authenticated screen renders itself inside — it takes `active` (the current screen key, for sidebar highlighting) and `role`.

### Page files: one screen per file, plus a `*Shared.jsx` sibling for cross-screen bits

Every page is its own file with a **default export**, specifically so each one gets its own lazy-loaded chunk — do not go back to bundling multiple screens as named exports from one file (this was refactored away deliberately to cut bundle size; see git history for `ContratanteScreens.jsx` / `OtherScreens.jsx`).

When screens in the same folder need to share mock data, brand-color constants, or small presentational helpers (e.g. `contratanteShared.jsx` in `src/pages/contratante/`), put those in a sibling `*Shared.jsx` file that every screen imports from — never re-introduce a multi-export screens file.

If two screens in the same folder need to hand off mutable state across a `go()` navigation (e.g. "which row was clicked" before landing on a detail screen), the pattern used is a shared mutable object exported from the `*Shared.jsx` file (e.g. `contratanteState.selectedContrato`), mutated by the source screen and read by the destination screen — not React context, since these are one-shot handoffs between otherwise-unrelated lazy chunks.

### Auth: real backend OTP, session in a zustand store

`src/stores/authStore.js` (zustand + `persist` to `sessionStorage`) holds `authorized` / `isAdmin` / `session` / `adminSession`. Client (PYME/Contratante) and admin auth are **fully separate flows** with separate tokens, separate OTP endpoints, and separate refresh/logout — never conflate them.

`src/lib/authApi.js` wraps the shared Bonafide auth service's `/auth/*` and `/auth/admin/*` endpoints. `ensureValidAccessToken()` / `ensureValidAdminAccessToken()` in `authStore.js` proactively refresh (de-duped against concurrent callers) and should be awaited before any authenticated request — this app has no axios-style interceptor doing it automatically.

### Runtime config: fixed path prefixes, not build-time env vars

`src/config.ts`'s `loadConfig()` (kicked off once, unawaited, from `main.jsx`, so it resolves in parallel
with the splash screen) resolves `authUrl`/`identityUrl` as fixed same-origin path prefixes
(`/auth-service`, `/identity/api/v1`), constant across every environment: in stage/production Traefik
routes each prefix to the right backend based on the request's `Host` header (labels live in each
backend repo); locally, `vite.config.js`'s `server.proxy` forwards those same prefixes unchanged to a
single `VITE_DEV_BACKEND_URL` fronted by that same Traefik (see `.env.example`), so dev behaves
identically to prod. `apiUrl` has no prefix assigned — b-mori has no backend of its own yet, so it stays
`undefined`; callers that need it check for it explicitly. One built Docker image is reused across every
environment with no env-var injection at container start. If you add a new backend prefix, thread it
through `src/config.ts` and the matching `vite.config.js` `server.proxy` entry, not `import.meta.env`
alone.

### Styling

Tailwind v4 via `@tailwindcss/vite` — no `tailwind.config.js`; tokens are defined directly in `src/index.css` under `:root` (CSS vars used inline in JS, e.g. brand colors) and `@theme` (generates Tailwind utility classes like `text-orange`, `bg-page-bg`). When you need a new color/spacing token available as a utility class, add it to the `@theme` block, not just `:root`.

Fonts (Poppins) are self-hosted as woff2 in `src/assets/fonts/`, declared in `src/styles/fonts.css` — do not reintroduce a Google Fonts `<link>` in `index.html`.

### Images

All raster assets in `src/assets/` are WebP (converted from PNG deliberately to cut bundle weight — keep new image assets WebP too, sized close to their actual rendered dimensions rather than dropping in full-resolution originals). The one exception is the favicon (`public/isotipo-color.png`), kept as PNG for browser-icon compatibility.
