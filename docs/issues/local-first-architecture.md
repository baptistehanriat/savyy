# Research: Local-First Architecture

**Status: Decision reached — use Legend State v3 + IndexedDB + Supabase sync plugin**

---

## The Question

What's the right local-first architecture that:
- Works offline (reads + writes without network)
- Handles a few thousand transactions without hitting storage limits
- Has a credible sync path to Supabase when ready
- Is proportionate for a solo side project

---

## Options Evaluated

| Tool | Offline? | Supabase? | Conflict Resolution | Complexity | Verdict |
|---|---|---|---|---|---|
| **Legend State v3** | Yes (IndexedDB) | Yes (plugin, beta) | Last-write-wins | Low | ✅ Pick this |
| **MobX + manual sync** | DIY | DIY | DIY | Medium-High | Too much plumbing |
| **PowerSync** | Yes (SQLite WASM) | Yes (official) | Last-write-wins | Medium-High | Good fallback |
| **ElectricSQL** | Read path only | Yes | N/A | Medium | Not enough |
| **Replicache/Zero** | Yes | DIY | You implement | High | Overkill |
| **RxDB** | Yes | Plugin | Yes (handlers) | Medium | Viable but heavier |

---

## Legend State v3 — Key Findings

### Persistence

- **localStorage**: 5–10 MB. Fine for settings, risky for thousands of transactions. Don't use for `transactions`.
- **IndexedDB**: Practically unlimited (50–80% of disk). Dictionary mode — each object with an `id` gets its own row. This is the right backend for `transactions` and `labels`.
- **OPFS**: Not supported.
- **Custom adapters**: Supported — implement `load()` / `save()`.

### Sync Engine

- Built-in `synced()` function: writes locally first (optimistic), queues changes, syncs to remote, merges response.
- First-party `syncedSupabase` plugin (`@legendapp/state/sync-plugins/supabase`). Supports:
  - Full CRUD, realtime subscriptions
  - Differential sync via `changesSince: 'last-sync'` (only pulls records updated since last sync)
  - Soft deletes via `fieldDeleted`
  - Infinite retry with exponential backoff
  - Fully typed against Supabase generated `Database` types

### Conflict Resolution

- **Last-write-wins** via `updated_at` timestamp. No CRDT, no three-way merge.
- For a single-user personal app: **good enough**. You won't edit the same transaction on two devices simultaneously.
- If multi-user or shared budgets ever become a goal, this is the first thing to revisit.

### Known Gotchas

- v3 is still **beta** (as of early 2026). Core reactivity is production-quality; the sync plugin is newer and has had silent-failure bugs. Manageable for a side project.
- IndexedDB schema changes require manually incrementing a `version` integer. No migration runner — you write format migrations yourself via transforms.
- Silent failures in the Supabase plugin are the main risk (GitHub issues #362, #500). Config mistakes produce no error, just no sync. Mitigation: test the sync path early.
- `isPersistLoaded` must be awaited before rendering data-dependent UI on app startup.

---

## Decision

**Use Legend State v3 with:**
- `ObservablePersistIndexedDB` for `transactions` and `labels`
- `ObservablePersistLocalStorage` for `settings` (tiny, fine)
- `syncedSupabase` with `changesSince: 'last-sync'` when adding cloud sync (Phase 5)

### Data Model Requirements for Sync (add before Phase 5)

Supabase tables need these columns for differential sync:
```sql
created_at  timestamptz  default now()
updated_at  timestamptz  default now()
deleted     boolean      default false
```
Plus a trigger to auto-update `updated_at`.

### Critical Setup Note

Key transactions by UUID from the start (not integer sequences). Use `as: 'object'` mode (default). This avoids the array-overwrite bug documented in the Expo offline-first blog post.

---

## Why Not MobX + Manual Sync

MobX itself is mature and ergonomically excellent. The problem is the sync layer — you'd need to build:
1. An IndexedDB wrapper (1 day)
2. A pending-changes queue that survives app restarts
3. Retry logic with backoff
4. Reconnect handling with diff sync (compare local vs. server timestamps)
5. Realtime subscription wiring

That's 300–500 lines of undifferentiated plumbing, easy to get subtly wrong (silent data loss on reconnect). Legend State v3's sync engine exists to replace exactly this work.

---

## Fallback: PowerSync

If Legend State v3's sync plugin produces persistent bugs:
- PowerSync has an [official Vite + React + TypeScript + Supabase template](https://github.com/powersync-community/vite-react-ts-powersync-supabase)
- Uses local SQLite via WASM — real query support, no size limits
- More infra (PowerSync service instance, Sync Rules in YAML)
- The migration path from Legend State is manageable since both use observable patterns
