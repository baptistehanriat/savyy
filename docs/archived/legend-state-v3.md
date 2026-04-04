# Legend State v3 — Reference Notes

Source: https://legendapp.com/open-source/state/v3/llms-full.txt (read 2026-04-01)

---

## Critical: v2 → v3 API Changes

The current `store.ts` uses the **v2 API** and must be rewritten.

| v2 (current — broken) | v3 (correct) |
|---|---|
| `configureObservablePersistence` | `configureSynced` |
| `persistObservable` | `syncObservable` |
| `useSelector` | `useValue` |
| `computed(() => ...)` | plain function `() => ...` inside observable |
| `observer` + `.get()` | `useValue(obs$)` |
| `.state` on observable | `syncState(obs$)` |

---

## Core Patterns

### Reading state in React

```tsx
// ✅ v3 — correct, React Compiler compatible
import { useValue } from "@legendapp/state/react"
const transactions = useValue(store$.transactions)

// ✅ also correct — computed selector, only re-renders if result changes
const total = useValue(() => store$.transactions.get().reduce(...))

// ❌ deprecated — breaks React Compiler
const Component = observer(() => {
  const t = store$.transactions.get()
})
```

`observer` still exists as a performance optimization (batches multiple `useValue` calls into one hook) but is no longer the default pattern.

### Writing state

```ts
// All writes are instant + auto-persisted
store$.transactions.push(newTx)
store$.transactions[id].labels.set([...])
store$.labels[id].name.set("food")

// Batch multiple writes to prevent N re-renders
import { batch } from "@legendapp/state"
batch(() => {
  parsedRows.forEach(row => store$.transactions.push(row))
})
```

### Computed values (v3 style)

```ts
const store$ = observable({
  transactions: [] as Transaction[],
  // ✅ v3: plain function, auto-recomputes when deps change
  totalExpenses: () =>
    store$.transactions.get()
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0),
})
```

---

## Persistence Setup (v3)

### localStorage (for settings only — small data)

```ts
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage"
import { syncObservable } from "@legendapp/state/sync"

syncObservable(store$.settings, {
  persist: { name: "savyy-settings", plugin: ObservablePersistLocalStorage }
})
```

### IndexedDB (for transactions + labels)

```ts
import { ObservablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb"
import { syncObservable } from "@legendapp/state/sync"

const idbPlugin = ObservablePersistIndexedDB({
  databaseName: "savyy",
  version: 1,
  tableNames: ["transactions", "labels"]
})

syncObservable(store$.transactions, {
  persist: { name: "transactions", plugin: idbPlugin }
})
syncObservable(store$.labels, {
  persist: { name: "labels", plugin: idbPlugin }
})
```

Each object in the arrays **must have a unique `id` field** — already the case in our data model.

Schema migrations: increment `version` when the shape changes. Write data transforms manually via `transform: { load, save }`.

### Waiting for persistence to load

```tsx
import { syncState } from "@legendapp/state/sync"
import { useValue } from "@legendapp/state/react"

function App() {
  const isLoaded = useValue(syncState(store$.transactions).isLoaded)
  if (!isLoaded) return <LoadingScreen />
  return <Main />
}
```

---

## Supabase Sync (Phase 5)

Requirements before enabling:
1. Add columns to Supabase tables: `created_at timestamptz`, `updated_at timestamptz`, `deleted boolean default false`
2. Add trigger to auto-update `updated_at`

```ts
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase"
import { configureSynced } from "@legendapp/state/sync"

const sync = configureSynced(syncedSupabase, {
  supabase,
  changesSince: "last-sync",
  fieldUpdatedAt: "updated_at",
  fieldDeleted: "deleted",
  persist: { plugin: idbPlugin, retrySync: true },
  retry: { infinite: true },
  waitFor: isAuthenticated$,  // don't sync until authed
})

const transactions$ = observable(sync({
  collection: "transactions",
  persist: { name: "transactions" }
}))
```

---

## Useful Utilities

```ts
// Merge deep object into observable (preserves listeners — use for CSV import)
import { mergeIntoObservable } from "@legendapp/state"
mergeIntoObservable(store$.transactions, importedData)

// Undo/redo (free, attach to any observable)
import { undoRedo } from "@legendapp/state/helpers/undoRedo"
const { undo, redo } = undoRedo(store$.transactions, { limit: 50 })

// Track history of changes
import { trackHistory } from "@legendapp/state/helpers/trackHistory"
const history = trackHistory(store$.transactions)

// Mark large objects as opaque (no deep reactivity — use for raw parsed data)
import { ObservableHint } from "@legendapp/state"
observable({ rawCsvData: ObservableHint.opaque(parsedRows) })
```

---

## Fine-Grained Reactivity Components

```tsx
import { Memo, Show, For } from "@legendapp/state/react"

// Memo: self-updating element, parent does NOT re-render
<Memo>{() => <span>{store$.count.get()}</span>}</Memo>

// Show: conditional render without parent re-render
<Show if={store$.isLoaded}><Table /></Show>

// For: optimized list render (each item in its own tracking context)
<For each={store$.transactions} item={TransactionRow} />
// With optimized mode (reuses React nodes on sort/swap):
<For each={store$.transactions} item={TransactionRow} optimized />
```

---

## Reactive DOM Props

```tsx
import { $React } from "@legendapp/state/react-web"

// Reactive input — no re-render on parent
<$React.input $value={store$.searchQuery} />
<$React.div $className={() => store$.theme.get() === "dark" ? "dark" : "light"} />
```

---

## Debugging

```ts
import { useTraceListeners, useTraceUpdates } from "@legendapp/state/react"

function Component() {
  useTraceListeners("MyComponent")   // logs all tracked observables
  useTraceUpdates("MyComponent")     // logs what triggered each re-render
}
```
