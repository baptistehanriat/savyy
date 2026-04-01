# How Legend State v3 Works

## The mental model

Legend State is **both your state layer and your persistence layer**. There's no separate "fetch on mount, put in state" cycle. The observable IS the data — it loads from IndexedDB on startup, you read and write it directly, and it persists automatically in the background.

```
IndexedDB (disk)
    ↕ auto-sync via syncObservable
Observable (memory)
    ↕ useValue() hook
React Component (UI)
```

No loading states for reads. No `useEffect` to fetch. No reducers. Writes are instant.

---

## The store

Observables live in `app/store/`. Each domain gets its own file.

```ts
// app/store/transactions.ts
import { observable } from "@legendapp/state"
import { syncObservable } from "@legendapp/state/sync"
import { ObservablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb"
import type { Transaction } from "~/types"

export const transactions$ = observable<Record<string, Transaction>>({})

syncObservable(transactions$, {
  persist: {
    name: "transactions",
    plugin: ObservablePersistIndexedDB({
      databaseName: "savyy",
      version: 1,
      tableNames: ["transactions", "labels"]
    })
  }
})

// Mutations live here, not in components
export function addTransaction(data: Omit<Transaction, "id">) { ... }
export function deleteTransaction(id: string) { ... }
```

Store shape is `Record<string, Transaction>` (keyed by id), not an array. This is the v3 pattern for collections — faster lookups, cleaner updates, no index shifting.

---

## Reading in components

`useValue()` is the **only** way to read observables in React. It subscribes the component and re-renders only when the value actually changes.

```tsx
import { useValue } from "@legendapp/state/react"
import { transactions$ } from "~/store/transactions"

function TransactionList() {
  const transactions = useValue(transactions$)
  // transactions is a plain Record<string, Transaction> — just use it
  return Object.values(transactions).map(t => <Row key={t.id} transaction={t} />)
}
```

For derived/computed values — same hook, pass a function:

```tsx
// Only re-renders if the computed result changes
const totalExpenses = useValue(() =>
  Object.values(transactions$.get())
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0)
)
```

---

## Writing from components

Components call store mutation functions. Never write to the observable directly from a component.

```tsx
import { addTransaction, deleteTransaction } from "~/store/transactions"

function TransactionRow({ id }: { id: string }) {
  return <button onClick={() => deleteTransaction(id)}>Delete</button>
}
```

Writes are **synchronous and instant** — the UI updates immediately, IndexedDB persists in the background.

---

## Waiting for the store to load

On first mount, IndexedDB needs a tick to hydrate the observable. Gate your UI on it:

```tsx
import { syncState } from "@legendapp/state/sync"
import { useValue } from "@legendapp/state/react"

function App() {
  const isLoaded = useValue(syncState(transactions$).isLoaded)
  if (!isLoaded) return <Spinner />
  return <Main />
}
```

After the first load it's instant on every subsequent visit — the observable hydrates before the first render completes.

---

## Optimizing renders with `For`

For lists, use `For` instead of `.map()`. Each row gets its own tracking context — the parent never re-renders when a row changes.

```tsx
import { For } from "@legendapp/state/react"

<For each={transactions$} item={TransactionRow} />
```

---

## Future: Supabase sync

When ready to add cloud sync, swap the `syncObservable` config. Nothing else changes in components or mutations.

```ts
syncObservable(transactions$, syncedSupabase({
  supabase,
  collection: "transactions",
  changesSince: "last-sync",
  persist: { name: "transactions", plugin: idbPlugin, retrySync: true },
  retry: { infinite: true }
}))
```

Offline changes queue automatically and sync when reconnected.

---

## Rules

- **Observables end in `$`** — `transactions$`, `labels$`, `isOpen$`
- **Read with `useValue()`** — never `.get()` at component top level
- **Write via store mutations** — never from components directly
- **Batch bulk writes** — `batch(() => rows.forEach(...))` prevents N re-renders
- **No `useEffect` for data** — Legend State reactivity replaces it
