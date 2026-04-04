# Architecture

## Philosophy: Local-First

Savyy is local-first. The browser is the primary database. Supabase is a sync target, not a dependency.

- Every read hits IndexedDB or localStorage — zero network latency
- Every write is instant and optimistic — UI never waits for a server
- The app works fully offline — Supabase sync resumes automatically when back online

---

## Storage

Each domain is persisted in the most appropriate local store:

| Domain | Storage | Why |
|---|---|---|
| Labels | localStorage | Small metadata, synchronous access, needed everywhere |
| Transactions | IndexedDB | Potentially large, async non-blocking reads/writes |

Both are managed automatically by Legend State persist plugins — no manual storage code.

---

## Sync

Legend State's `syncedSupabase` plugin sits between the local store and Supabase:

```
Local store (IndexedDB / localStorage)
    ↕  Legend State syncedSupabase plugin
Supabase (Postgres)
    └── Row Level Security enforces user_id = auth.uid()
```

The plugin handles:
- Initial data fetch from Supabase on first load
- Pushing local changes to Supabase in the background
- Retry on failure
- Conflict resolution

---

## Data Flow

```
User action
    ↓
Store mutation (addLabel, deleteTransaction, ...)
    ↓
Legend State writes to local storage immediately
    ↓
UI re-renders — no loading state, no waiting
    ↓ (background, when online)
Legend State syncs to Supabase
```

Reads never touch the network. Writes never wait for the network.

---

## Store Design

Each domain store exposes:
- A **private observable** wrapping `syncedSupabase` — owns persistence and sync
- A **public computed** (`labels$`, `transactions$`) — maps raw DB rows to domain types
- **Public mutations** (`addLabel`, `updateLabel`, ...) — the only way to write

```
Component
  ├── reads via  → labels$ (computed, mapped, reactive)
  └── writes via → addLabel(...) (mutation, generates id, sets user_id)
                        ↓
                  private labelsStore (Legend State observable)
                        ↓
                  localStorage  →  Supabase
```

Components never access the raw store or DB types directly.

---

## Auth

Supabase handles authentication entirely (Google OAuth, session management, token refresh). The app never manages tokens manually. Sessions are persisted in localStorage by the Supabase JS client.

Row Level Security on every Supabase table ensures users can only access their own data — even if the client-side auth check were bypassed, the database rejects unauthorized reads and writes.
