# Clean Code

Universal coding principles applied across the entire codebase. 
---

## Principles

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

### No abbreviations
Every identifier is spelled out in full. Abbreviations save a few characters but cost comprehension.

```ts
// ✅
transactions.map((transaction) => transaction.id)

// ❌
transactions.map((t) => t.id)
```

Common exceptions: established domain acronyms everyone knows (`id`, `url`, `csv`, `api`). `init` is also a deliberate exception — universally understood.

### Early returns over nested conditions
Use guard clauses at the top of a function to handle edge cases. The happy path should read linearly at the bottom.

```ts
// ✅
function processTransaction(transaction: Transaction | null) {
  if (!transaction) return
  if (!transaction.accountId) return
  // happy path
}

// ❌
function processTransaction(transaction: Transaction | null) {
  if (transaction) {
    if (transaction.accountId) {
      // buried 2 levels deep
    }
  }
}
```

### Clarity over cleverness
Simple, explicit code is easier to maintain than clever compact code. If something needs a comment to explain *what* it does, rename it first.


### Boolean function parameters
Never pass a raw boolean argument — it's unreadable at the call site.

```ts
// ✅
deleteTransaction(id, { soft: true })

// ❌
deleteTransaction(id, true)
```

---

## TypeScript

- **Strict mode** always on
- No `any` — use `unknown` and narrow
- No type assertions (`as Foo`) unless provably safe
- Prefer `interface` for object shapes, `type` for unions/aliases
- `async/await` only — never `.then()` / `.catch()`



### Union types vs enums
Prefer union types. Only use a const object when you need to iterate over values at runtime.

```ts
// ✅
type Currency = 'EUR' | 'USD'

// ❌
enum Currency { EUR, USD }
```

### `null` vs `undefined`
- `undefined` — the field doesn't exist or was never set
- `null` — the field exists but its value is explicitly empty

```ts
interface Transaction {
  note?: string             // undefined: may not exist
  clearedAt: string | null  // null: exists, not yet set
}
```

### Type suffixes

| Suffix | Use | Example |
|---|---|---|
| `Props` | Component props | `TransactionRowProps` |
| `Payload` | API request body | `CreateTransactionPayload` |
| `Response` | API response shape | `TransactionResponse` |
| (none) | Domain entity | `Transaction`, `Label` |

---

## React Components

- Functional components only
- One component per file (except tiny sub-components used only in that file)
- Named exports only

### Avoid spreading props
Always pass props explicitly.

```tsx
// ✅
<TransactionRow transaction={transaction} isSelected={isSelected} onDelete={handleDelete} />

// ❌
<TransactionRow {...rowProps} />
```

### Conditional rendering

```tsx
// ✅ && for show/hide
{hasError && <ErrorMessage error={error} />}

// ✅ ternary for either/or
{isLoading ? <Spinner /> : <TransactionList transactions={transactions} />}

// ❌ ternary with null
{hasError ? <ErrorMessage error={error} /> : null}
```

---

## Comments

- Code should be self-documenting — if you need a comment, consider renaming first
- Comments explain **why**, not **what**
- No JSDoc on every function — only on non-obvious utilities
- `// TODO:` for known gaps · `// FIXME:` for known bugs · `// HACK:` for workarounds

---

## What to avoid


- Avoid prop drilling more than 1 level deep
- Avoid `console.log` in committed code
- Avoid `@ts-ignore` — use `@ts-expect-error` with a comment if truly needed
- Avoid hardcoding numbers. If you hardcode a number and its meaning isn't immediately obvious from context, give it a name. 
