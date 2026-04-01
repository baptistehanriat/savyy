# Code Conventions

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `TransactionRow`, `LabelChip` |
| Files | kebab-case | `transaction-row.tsx`, `label-chip.tsx` |
| Observables | camelCase + `$` suffix | `transactions$`, `store$`, `isOpen$` |
| Hooks | `use` prefix, camelCase | `useKeyboardShortcut`, `useTransactionsFilter` |
| Utility functions | camelCase | `formatAmount`, `parseCSV` |
| Types/Interfaces | PascalCase | `Transaction`, `Label`, `UserSettings` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_CURRENCY`, `MAX_IMPORT_ROWS` |
| CSS variables | `--kebab-case` | `--color-primary`, `--radius-md` |

### Observable naming
Observables always end with `$` — this makes them instantly recognizable in any context and avoids collisions with plain values.

```ts
const transactions$ = observable([])    // ✅ observable
const transactions = transactions$.get() // ✅ plain array
```

---

## TypeScript

- **strict mode** always on
- No `any` — use `unknown` and narrow
- No type assertions (`as Foo`) unless provably safe
- Prefer `interface` for object shapes, `type` for unions/aliases
- Export types from `~/types/index.ts`, not scattered across files
- Co-locate component prop types with the component (not in `types/`)

```ts
// ✅
interface TransactionRowProps {
  transaction: Transaction
  onDelete: (id: string) => void
}

// ❌
const x = thing as Transaction
```

---

## React Components

- Functional components only, no class components
- One component per file (except tiny sub-components used only in that file)
- Component file = component name in PascalCase: `TransactionRow.tsx` → no, `transaction-row.tsx` → ✅
- Default export for the main component of a file
- Named exports for anything else in the file

```tsx
// transaction-row.tsx
export default function TransactionRow({ transaction }: TransactionRowProps) { ... }
```

### Reading observables in components

```tsx
// ✅ useValue for reactive reads
const transactions = useValue(transactions$)

// ✅ useValue with computation (only re-renders if result changes)
const expenseTotal = useValue(() =>
  transactions$.get().filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)
)

// ✅ observer as optimization when using many useValue calls
const Component = observer(function Component() {
  const a = useValue(store$.a)
  const b = useValue(store$.b)
  const c = useValue(store$.c)
  ...
})

// ❌ Never use direct .get() outside observer without useValue
const transactions = transactions$.get() // raw, not reactive
```

### Writing to observables

Always write via the store's mutation functions, not directly from components (except trivial local UI state).

```ts
// ✅ in component
addTransaction(formData)
deleteTransaction(id)

// ❌ in component
transactions$[id].set(...)  // bypasses any business logic in store
```

---

## Store Mutations

All mutations live in the store file next to the observable they affect.

```ts
// store/transactions.ts

export const transactions$ = observable<Record<string, Transaction>>({})

export function addTransaction(data: Omit<Transaction, "id" | "createdAt">) {
  const id = generateId()
  transactions$[id].set({ ...data, id, createdAt: new Date().toISOString() })
}

export function updateTransaction(id: string, patch: Partial<Transaction>) {
  transactions$[id].assign(patch)
}

export function deleteTransaction(id: string) {
  transactions$[id].delete()
}

export function bulkAddLabel(ids: string[], labelId: string) {
  batch(() => {
    ids.forEach(id => {
      const current = transactions$[id].labelIds.peek()
      if (!current.includes(labelId)) {
        transactions$[id].labelIds.set([...current, labelId])
      }
    })
  })
}
```

---

## File Imports

Use path aliases everywhere. Never use relative `../../../`.

```ts
// ✅
import { cn } from "~/lib/cn"
import { transactions$ } from "~/store/transactions"
import type { Transaction } from "~/types"

// ❌
import { cn } from "../../lib/cn"
```

Import order (enforced by Prettier/ESLint if added later):
1. React
2. Third-party libraries
3. Internal `~/` imports
4. Relative imports (same directory only)
5. Type imports

---

## Styling

- Tailwind utility classes only — no inline `style={{}}` except for dynamic values (e.g. chart widths)
- Use `cn()` for conditional classes
- Tailwind v4: no `tailwind.config.js` — configure via CSS variables in `app.css`
- Design tokens defined as CSS variables, consumed by Tailwind
- Dark mode via `.dark` class on `<html>` (managed by settings store)

```tsx
// ✅
<div className={cn("rounded-lg border p-4", isSelected && "bg-accent border-primary")}>

// ❌
<div style={{ borderRadius: "8px", padding: "16px" }}>
```

### Component variants
Use `class-variance-authority` (cva) for components with multiple visual states.

```ts
const buttonVariants = cva(
  "inline-flex items-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
      }
    },
    defaultVariants: { variant: "default", size: "md" }
  }
)
```

---

## Data Conventions

- **IDs**: always UUID v4 strings, generated client-side with `generateId()` from `~/lib/ids`
- **Amounts**: stored as integers in cents (e.g. `€42.50` → `4250`). Display formatting in `formatAmount()`. Negative = expense, positive = income.
- **Dates**: stored as ISO 8601 strings (`"2024-03-15"`). All date manipulation via `date-fns`.
- **Soft deletes**: items are never hard-deleted from the store directly (in sync-enabled phase). Set `deleted: true` and filter in queries.

```ts
// ✅
amount: -4250  // €42.50 expense stored as cents

// ❌
amount: -42.50 // float — precision issues
```

---

## Keyboard Shortcuts

All shortcuts go through a central `useKeyboardShortcut` hook. Never attach raw `keydown` listeners in components.

Document every shortcut in `docs/ux-patterns.md` as it's added.

```ts
// ✅
useKeyboardShortcut("cmd+k", () => openCommandPalette())
useKeyboardShortcut("cmd+n", () => openNewTransactionModal())

// ❌
window.addEventListener("keydown", (e) => {
  if (e.metaKey && e.key === "k") openCommandPalette()
})
```

---

## Comments

- Code should be self-documenting — if you need a comment, consider renaming first
- Comments explain **why**, not **what**
- No JSDoc on every function — only on non-obvious utility functions
- `// TODO:` for known gaps; `// FIXME:` for known bugs; `// HACK:` for ugly workarounds

---

## What to avoid

- No `useEffect` for data synchronization (use Legend State reactivity instead)
- No `useState` for data that belongs in the store
- No prop drilling more than 1 level deep — pass the observable or use the store directly
- No `console.log` left in committed code
- No `@ts-ignore` — fix the type or use `@ts-expect-error` with a comment
- No magic numbers — name them as constants
