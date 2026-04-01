# Tech Stack

## Frontend

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 19 + TypeScript | |
| Routing | React Router v7 (framework mode) | SPA, client-side only for now |
| Bundler | Vite | HMR, fast dev |
| UI | shadcn/ui + Tailwind CSS | Component primitives, fully customizable |
| Icons | Lucide | |
| State | Legend State | Observable, reactive, built-in persistence |
| Table | TanStack Table | Headless, handles sort/filter/selection |
| Forms | TanStack Form | |
| Dates | date-fns | |

## Local-First Layer

- **Legend State** `persistObservable` → `localStorage`
- Source of truth is local; no loading states for reads
- Writes are instant; sync happens in background (future)

## Backend (future / optional)

- **Supabase** — Postgres, Auth, Row Level Security
- No custom API server; direct client SDK access

## Auth (future)

- Supabase Auth (email/password + magic link)
- React Router `AuthGuard` on protected routes
- `auth.uid() = user_id` RLS policy on all tables

## Deployment

- Vercel or Netlify (static SPA export)
- Supabase free tier

---

## Key Architecture Decisions

**SPA over SSR**: All data is local. SSR adds complexity with zero benefit until we have a real backend. React Router is used in client-only mode.

**Legend State over MobX**: Simpler API, built-in persistence plugin, more modern. MobX is heavier.

**localStorage over IndexedDB**: Sufficient for personal use (< few thousand transactions). IndexedDB adds complexity with little gain at this scale.

**Labels over categories**: Categories create artificial constraints. Labels compose freely. A transaction can be `groceries`, `organic`, `weekly` simultaneously.
