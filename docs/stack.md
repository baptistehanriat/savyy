# Frontend Stack

## Core

| Library | Version | Role | Notes |
|---|---|---|---|
| `react` | ^19.1 | UI framework | Concurrent mode, React Compiler ready |
| `react-dom` | ^19.1 | DOM renderer | |
| `typescript` | ^5.9 | Type safety | strict mode |
| `vite` | ^7.x | Bundler + dev server | Fast HMR, SPA mode |
| `react-router` | ^7.9 | Routing | Client-only SPA mode (no SSR) |

## Styling & UI

| Library | Version | Role | Notes |
|---|---|---|---|
| `tailwindcss` | ^4.x | Utility CSS | CSS-first config (no tailwind.config.js) |
| `shadcn` (CLI) | ^4.x | Component scaffolding | Components live in `app/components/ui/` |
| `@base-ui/react` | ^1.3 | Unstyled primitives | Used by shadcn under the hood; use directly for complex interactive components |
| `class-variance-authority` | ^0.7 | Variant styling | Used inside `ui/` components |
| `tailwind-merge` | ^3.x | Class merging | `cn()` utility |
| `clsx` | ^2.x | Conditional classes | Part of `cn()` |
| `lucide-react` | ^0.5xx | Icons | |
| `motion` | ^12.x | Animation | **Not installed yet** — `npm install motion` |
| `geist` (font) | ^1.5 | Typography | Variable font, already configured |

## State & Data

| Library | Version | Role | Notes |
|---|---|---|---|
| `@legendapp/state` | **^3.x beta** | State + persistence + sync | **Currently v2 — must upgrade** |
| `@tanstack/react-table` | ^8.x | Headless table | Sort, filter, selection, virtualization |
| `@tanstack/react-form` | ^1.x | Form state | **Not installed yet** |

## Utilities

| Library | Version | Role | Notes |
|---|---|---|---|
| `date-fns` | ^4.x | Date manipulation | **Not installed yet** — `npm install date-fns` |
| `papaparse` | ^5.x | CSV parsing | **Not installed yet** — `npm install papaparse @types/papaparse` |
| `uuid` | ^13.x | ID generation | Already installed |

## Dev Tools

| Library | Version | Role |
|---|---|---|
| `prettier` | ^3.x | Code formatting |
| `@react-router/dev` | ^7.x | React Router CLI |
| `@tailwindcss/vite` | ^4.x | Tailwind Vite plugin |
| `vite-tsconfig-paths` | ^5.x | Path aliases (`~/`) |

---

## Install commands for missing packages

```bash
# Upgrade Legend State to v3 beta
npm install @legendapp/state@beta

# New dependencies
npm install motion date-fns papaparse
npm install @tanstack/react-form

# Types
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
| framer-motion | Renamed to `motion` — same package |
| IndexedDB (raw) | Legend State's IndexedDB plugin handles this |
| next.js | SSR is unnecessary for a local-first SPA |
