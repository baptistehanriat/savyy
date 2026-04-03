# Code Conventions

---

## Principles

These are the core values behind every convention in this file.

### This document is alive
When you introduce a new verb, prefix, suffix, or identifier pattern that isn't covered here, make a conscious decision about it and add it. The goal is that every naming choice is deliberate and recorded — not that every case is pre-specified upfront.

### Functions do one thing
Every function has a single responsibility. If a function does two things, split it. Aim for pure functions — same input always produces same output, no side effects.

```ts
// ✅ one thing
function formatAmount(cents: number): string { ... }
function filterByLabel(transactions: Transaction[], labelId: string): Transaction[] { ... }

// ❌ two things
function formatAndFilterTransactions(transactions: Transaction[], labelId: string): string[] { ... }
```

### Top-to-bottom reading
Write code in the order a human reads it: overview first, details below. The "main" function or component should be at the top of the file. Helpers and internals follow beneath.

```tsx
// ✅ reader sees the shape immediately, dives into details as needed
export function TransactionList({ transactions }: TransactionListProps) {
  const filtered = filterVisible(transactions)
  return <ul>{filtered.map(renderRow)}</ul>
}

function filterVisible(transactions: Transaction[]) { ... }
function renderRow(transaction: Transaction) { ... }

// ❌ reader must scroll to the bottom to find the entry point
function filterVisible(...) { ... }
function renderRow(...) { ... }
export function TransactionList(...) { ... }
```

### Consistency above everything
A codebase with consistent mediocre naming is easier to navigate than one with brilliant names mixed with inconsistent ones. Pick a pattern and apply it everywhere. If you change a name, change it *everywhere* — partial renames are the worst of both worlds.

```ts
// ✅ consistent verb across all mutations
addTransaction()
addLabel()
addAccount()

// ❌ mixed verbs for the same operation
createTransaction()
addLabel()
newAccount()
```

### No abbreviations
Every identifier is spelled out in full. Abbreviations save a few characters but cost comprehension.

```ts
// ✅
transactions.map((transaction) => transaction.id)
labels.filter((label) => label.color)

// ❌
transactions.map((t) => t.id)
labels.filter((l) => l.color)
```

Common exceptions: established domain acronyms everyone knows (`id`, `url`, `csv`, `api`).

### Early returns over nested conditions
Use guard clauses at the top of a function to handle edge cases. The happy path should read linearly at the bottom, not be buried inside nested blocks.

```ts
// ✅ edge cases handled upfront, happy path clear at the bottom
function processTransaction(transaction: Transaction | null) {
  if (!transaction) return
  if (!transaction.accountId) return

  // happy path
}

// ❌ happy path buried inside nested conditions
function processTransaction(transaction: Transaction | null) {
  if (transaction) {
    if (transaction.accountId) {
      // happy path buried 2 levels deep
    }
  }
}
```

### Clarity and readability over cleverness
Simple, explicit code is easier to maintain than clever compact code. If something needs a comment to explain *what* it does, rename it first.

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

### Naming consistency
Pick one verb family per operation and never mix them. Applies across the whole stack — store mutations, component handlers, API calls.

| Operation | Use | Never mix with |
|---|---|---|
| Adding items - store/data layer | `add` | `create`, `new`, `insert` |
| Adding items - UI layer | `New item` | `Create new item` `Add new item` |
| Removing items — store/data layer | `delete` | `remove`, `destroy`, `drop` |
| Removing items — UI layer | `delete` | `remove`, `destroy`, `drop` |
| Changing items — store/data layer | `update` | `modify`, `set` (except observable `.set()`) |
| Changing items — UI layer | `edit` | `modify`, `change` |
| Synchronous reads | `get` | `read`, `retrieve` |
| Async data loading | `fetch` | `load`, `get`, `pull`, `request` |
| Navigation | `navigate` | `go`, `open`, `redirect`, `push`, `route` |
| Visibility | `show` / `hide` | `reveal`/`collapse`, `display` |
| Overlay open state | `open` / `close` (boolean prop) | `show`/`hide`, `visible`, `isOpen` (base-ui convention) |
| Selection | `select` / `deselect` | `pick`, `choose`, `check`/`uncheck` |
| Initialization | `init` | `initialize`, `setup`, `bootstrap`, `prepare` |
| Resetting state | `reset` | `clear`, `empty`, `flush`, `wipe` |
| Data → display string | `format` | `render`, `display`, `stringify`, `print` |
| String → data | `parse` | `decode`, `deserialize`, `read` |
| Shape A → shape B | `map` | `transform`, `convert`, `serialize` |
| Validation (action, returns errors) | `validate` | `check`, `verify` |
| Async success callback | `onSuccess` | `onComplete`, `onDone`, `onFinish` |
| Async error callback | `onError` | `onFailure`, `onFail`, `onException` |
| Counting items | `count` | `length`, `size`, `total`, `num`, `numberOfX` |
| Sum of values | `total` | `sum`, `aggregate`, `accumulate` |
| Length of array| `length` | `size`, `total`, `num`, `numberOfX` |

> `init` is a deliberate exception to the no-abbreviations rule — universally understood and accepted.

### Event handlers
Use `on` for props (the interface), `handle` for implementations (inside the component). They naturally pair up.

```tsx
// ✅ on = prop, handle = implementation
<TransactionRow onDelete={handleDelete} onChange={handleChange} />

function handleDelete(id: string) { ... }
function handleChange(value: string) { ... }

// ❌ mixed
function onDelete() { ... }       // is this a prop or an impl?
function deleteHandler() { ... }  // suffix style, inconsistent
```

### Predicate naming
Any identifier that returns or holds a boolean uses a strict prefix based on what it expresses. This applies to variables, functions, and component props alike. Never mix these prefixes.

| Prefix | Meaning | Example |
|---|---|---|
| `is` | boolean state | `isSelected`, `isLoading`, `isDisabled` |
| `has` | existence check | `hasLabels`, `hasError`, `hasUnsavedChanges` |
| `can` | permission / capability | `canDelete`, `canEdit`, `canSubmit` |

```ts
// ✅ clear intent from the prefix alone — works for values, functions, and props
isSelected             // variable: this item is currently selected
hasLabels(transaction) // function: returns boolean
canDelete              // prop: permission check

// ✅ validate (action) vs isValid (predicate) — different roles, not competing
const errors = validateForm(formData)  // performs work, returns error details
const isValid = errors.length === 0    // boolean result
function isFormValid(data): boolean    // predicate function — is prefix applies

// ❌ mixed — reader must open the function to understand what kind of boolean this is
loading        // is it a state? a prop? an event?
isHasLabels    // redundant prefix stacking
```

### Collection naming
Plural is enough — never add redundant suffixes.

```ts
// ✅
transactions
labels
selectedIds

// ❌
transactionList
labelArray
transactionCollection
```

### ID naming
Use plain `id` for the entity's own identifier. Use `XId` (qualified) for any foreign reference.

```ts
// ✅
interface Transaction {
  id: string          // own identity — plain id
  labelIds: string[]  // foreign reference — qualified
  accountId: string   // foreign reference — qualified
}

// ❌
interface Transaction {
  transactionId: string  // redundant — you're already inside Transaction
  labels: string[]       // ambiguous — array of what? full objects? ids?
}
```

### Component suffix for list items
Use `Row` for items rendered inside a table or list layout.

```tsx
TransactionRow
LabelRow
AccountRow
```

### Avoid negative booleans
Name booleans in their positive form to avoid double negatives in conditions.

```ts
// ✅
isEnabled
isVisible
isEditable

if (isEnabled) { ... }

// ❌
isDisabled   // if (!isDisabled) reads as "not not disabled"
isHidden
isNotValid
```

Exception: native HTML attributes (`disabled`, `readOnly`) — you can't rename those.

### No abbreviations
Spell out every identifier in full. See [Principles](#principles) for examples.

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

### Avoid generic variable names
Name variables after what they actually hold. Generic names force the reader to trace back to understand the value.

```ts
// ✅
const transaction = transactions.find(...)
const total = amounts.reduce(...)
const hasError = errors.length > 0

// ❌
const data = ...
const result = ...
const item = ...
const temp = ...
const value = ...
```

### Boolean function parameters
Never pass a raw boolean argument — it's unreadable at the call site. Use a named options object instead.

```ts
// ✅ self-documenting at the call site
deleteTransaction(id, { soft: true })
updateTransaction(id, patch, { notify: true })

// ❌ what does true mean here?
deleteTransaction(id, true)
updateTransaction(id, patch, false, true)
```

### Union types vs enums
Prefer union types. Only use a const object when you need to iterate over values at runtime.

```ts
// ✅ union type — simple, no runtime artifact
type TransactionType = 'income' | 'expense'

// ✅ const object — when runtime iteration is needed
const TRANSACTION_TYPES = { INCOME: 'income', EXPENSE: 'expense' } as const

// ❌ TypeScript enum — runtime artifact, surprising behavior
enum TransactionType { Income, Expense }
```

### `null` vs `undefined`
Both are allowed but mean different things — never use them interchangeably.

- `undefined` — the field doesn't exist or was never set
- `null` — the field exists but its value is explicitly empty

```ts
interface Transaction {
  note?: string             // undefined: note may not exist at all
  clearedAt: string | null  // null: field always exists, not yet cleared
}
```

### Type suffixes
Suffix communicates what role the type plays.

| Suffix | Use | Example |
|---|---|---|
| `Props` | Component props | `TransactionRowProps` |
| `Payload` | API request body | `CreateTransactionPayload` |
| `Response` | API response shape | `TransactionResponse` |
| (none) | Domain entity | `Transaction`, `Label` |

```ts
// ✅
type CreateTransactionPayload = Omit<Transaction, "id" | "createdAt">

// ❌
ITransaction       // Hungarian notation — not TypeScript convention
TransactionType    // too generic
TransactionObject  // redundant
```

---

## React Components

- Functional components only, no class components
- One component per file (except tiny sub-components used only in that file)
- Named exports
- `async/await` only — never `.then()` / `.catch()`

```tsx
// transaction-row.tsx
export function TransactionRow({ transaction }: TransactionRowProps) { ... }
```

### Avoid spreading props
Always pass props explicitly. Spreading hides what's being passed and makes refactoring harder.

```tsx
// ✅
<TransactionRow transaction={transaction} isSelected={isSelected} onDelete={handleDelete} />

// ❌
<TransactionRow {...rowProps} />
```

### Conditional rendering
Use `&&` for show/hide. Use a ternary for either/or. Never use a ternary with `null` as one branch.

```tsx
// ✅ && for show/hide
{hasError && <ErrorMessage error={error} />}

// ✅ ternary for either/or
{isLoading ? <Spinner /> : <TransactionList transactions={transactions} />}

// ❌ ternary with null — use && instead
{hasError ? <ErrorMessage error={error} /> : null}
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
