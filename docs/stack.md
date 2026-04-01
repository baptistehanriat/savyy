# Frontend Stack

## Core

| Library | Version | Role | Notes |
|---|---|---|---|
| `react` | ^19.2 | UI framework | Concurrent mode, React Compiler ready |
| `react-dom` | ^19.2 | DOM renderer | |
| `typescript` | ^5.9 | Type safety | strict mode |
| `vite` | ^7.x | Bundler + dev server | Fast HMR, SPA mode |
| `react-router` | ^7.13 | Routing | Client-only SPA mode (no SSR) |

## Styling & UI

| Library | Version | Role | Notes |
|---|---|---|---|
| `tailwindcss` | ^4.2 | Utility CSS | CSS-first config (no tailwind.config.js) |
| `shadcn` (CLI) | ^4.x | Component scaffolding | Components live in `app/components/ui/` |
| `@base-ui/react` | ^1.3 | Unstyled primitives | Used by shadcn under the hood; use directly for complex interactive components |
| `class-variance-authority` | ^0.7 | Variant styling | Used inside `ui/` components |
| `tailwind-merge` | ^3.x | Class merging | `cn()` utility |
| `clsx` | ^2.x | Conditional classes | Part of `cn()` |
| `lucide-react` | ^1.7 | Icons | |
| `motion` | ^12.x | Animation | **Not installed yet** — `npm install motion` |
| `@fontsource-variable/geist` | ^5.x | Typography | Variable font |

## State & Data

| Library | Version | Role | Notes |
|---|---|---|---|
| `@legendapp/state` | ^3.0.0-beta | State + persistence + sync | Local-first observable store; IndexedDB persistence; Supabase sync in Phase 5 |
| `@tanstack/react-table` | ^8.x | Headless table | Handles sort, filter, selection state. Headless = we own the DOM, enabling custom keyboard nav and inline editing. **Not installed yet** |
| `@tanstack/react-virtual` | ^3.x | Row virtualization | Only renders visible rows in the DOM. Without it, 500 transactions = 500 DOM nodes. With it, only ~20 rows exist at any time regardless of dataset size. **Not installed yet** |
| `@tanstack/react-form` | ^1.x | Form state | **Not installed yet** |

## Utilities

| Library | Version | Role | Notes |
|---|---|---|---|
| `date-fns` | ^4.x | Date manipulation | **Not installed yet** — `npm install date-fns` |
| `papaparse` | ^5.x | CSV parsing | **Not installed yet** — `npm install papaparse @types/papaparse` |

## Dev Tools

| Library | Version | Role |
|---|---|---|
| `@react-router/dev` | ^7.13 | React Router CLI + typegen |
| `@tailwindcss/vite` | ^4.x | Tailwind Vite plugin |
| `vite-tsconfig-paths` | ^5.x | Path aliases (`~/`) |

---

## Still to install

```bash
npm install motion date-fns papaparse
npm install @tanstack/react-table @tanstack/react-virtual @tanstack/react-form
npm install -D @types/papaparse
```

---

## What we are NOT using (and why)

| Library | Why not |
|---|---|
| MobX | Legend State handles state + sync — MobX would require building the sync layer manually |
| Zustand / Jotai | No built-in persistence or sync story |
| React Query / SWR | Legend State's sync engine replaces this for our use case |
| Zod | Would add weight; TanStack Form handles validation; TypeScript covers most cases |
| Radix UI (direct) | shadcn wraps it; use shadcn components instead of raw Radix |
| framer-motion | Renamed to `motion` — same package, install as `motion` |
| IndexedDB (raw) | Legend State's IndexedDB plugin handles this |
| Next.js | SSR is unnecessary for a local-first SPA |
