# Architecture

## File Structure

```
app/
├── components/
│   ├── data-type.ts          # Shared TypeScript interfaces
│   ├── ui/                   # shadcn/ui primitives
│   ├── primitives/           # App-level shared components
│   ├── transactions/         # Transaction-specific components
│   │   ├── transactions-table.tsx
│   │   ├── transaction-form.tsx      (todo)
│   │   ├── import-wizard.tsx         (todo)
│   │   └── dummy-transactions.ts
│   └── labels/
│       ├── labels-table.tsx
│       ├── label-form.tsx            (todo)
│       └── dummy-labels.ts
├── pages/
│   └── authenticated/
│       ├── layout.tsx        # App shell (sidebar + outlet)
│       ├── dashboard.tsx
│       ├── transactions.tsx
│       ├── labels.tsx
│       └── settings.tsx
├── state/
│   └── store.ts              # Legend State global store + persistence
├── lib/                      # Utilities (cn, date helpers, csv parser, etc.)
├── routes.ts
├── root.tsx
└── app.css
docs/
├── product.md
├── data-model.md
├── tech-stack.md
├── ux-patterns.md
├── roadmap.md
└── architecture.md  ← you are here
```

## State Flow

```
User action (click, keypress, form submit)
    ↓
Component calls store mutation (e.g. store.transactions.push(...))
    ↓
Legend State reactivity → all subscribed components re-render
    ↓
persistObservable writes to localStorage (sync, automatic)
    ↓
UI is always up to date, no loading states
```

## Component Conventions

- **Pages** (`pages/`) — route-level components, own their layout
- **Feature components** (`components/transactions/`, `components/labels/`) — domain-specific, access store directly
- **Primitives** (`components/primitives/`) — shared UI (no store access)
- **shadcn/ui** (`components/ui/`) — raw primitives, never modified directly

## Store Access

Components read and write directly from `store` imported from `~/state/store`.  
No prop drilling, no context providers for data.

```ts
import { store } from "~/state/store"
import { useSelector } from "@legendapp/state/react"

// Read (reactive)
const transactions = useSelector(() => store.transactions.get())

// Write (instant, auto-persisted)
store.transactions.push(newTransaction)
```

## CSV Import Architecture

```
File input / drag-drop
    ↓
Raw CSV string
    ↓
Papa Parse → array of row objects
    ↓
Column mapping UI (user maps: date, amount, name, description)
    ↓
Transform + validate rows → Transaction[]
    ↓
store.transactions.push(...parsed)
```
