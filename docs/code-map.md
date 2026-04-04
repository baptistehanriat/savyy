# Code Map

The actual current state of the codebase. Updated as the project grows.

---

## App shell

| File | Role |
|---|---|
| `app/root.tsx` | HTML shell, global fonts, error boundary |
| `app/app.css` | Global styles, CSS variables, Tailwind theme tokens |
| `app/routes.ts` | Route definitions (React Router v7) |

---

## Routes

| File | Path | Notes |
|---|---|---|
| `app/routes/home.tsx` | `/` | Redirects to `/transactions` |
| `app/routes/layout.tsx` | (layout) | Auth guard + app shell (nav, logo, user menu) |
| `app/routes/login.tsx` | `/login` | Google OAuth sign-in page |
| `app/routes/auth.callback.tsx` | `/auth/callback` | OAuth callback handler |
| `app/routes/transactions.tsx` | `/transactions` | Transactions page (mock data for now) |
| `app/routes/labels.tsx` | `/labels` | Labels page |

---

## Store

| File | Exports | Notes |
|---|---|---|
| `app/store/labels.ts` | `labels$`, `addLabel`, `updateLabel`, `deleteLabel`, mappers | Syncs to Supabase `labels` table. Persisted in localStorage via Legend State. |
| `app/store/transactions.ts` | `transactions$`, `addTransaction`, `updateTransaction`, `deleteTransaction`, mappers | Syncs to Supabase `transactions` table. Persisted in IndexedDB via Legend State. |

---

## Database

| File | Role |
|---|---|
| `app/database/database.types.ts` | Auto-generated Supabase types (`supabase gen types typescript`) — do not edit manually |
| `app/database/supabase-client.ts` | Typed Supabase client singleton (`createClient<Database>`) |

---

## Components

### `components/labels/`
| File | Role |
|---|---|
| `labels-table.tsx` | Main labels table with inline editing |
| `labels-table-columns.tsx` | Column definitions |
| `label-row.tsx` | Single label row |
| `label-name-cell.tsx` | Inline-editable name cell |
| `label-color-cell.tsx` | Inline-editable color cell |
| `labels-action-bar.tsx` | Action bar (add, delete) |
| `label-colors.ts` | Color palette constants |

### `components/shortcuts/`
| File | Role |
|---|---|
| `use-navigate-shortcuts.ts` | Keyboard shortcuts for navigation (e.g. `g t` → transactions) |
| `use-labels-table-shortcut.ts` | Keyboard shortcuts scoped to the labels table |

### `components/ui/`
shadcn/ui primitives — generated, do not edit directly.

---

## Lib

| File | Role |
|---|---|
| `app/lib/utils.ts` | `cn()` (class merging) + `generateId()` (UUID v4) |
| `app/lib/use-keyboard-shortcut.ts` | Central hook for registering keyboard shortcuts |
| `app/lib/use-is-mobile.ts` | Mobile breakpoint detection |
