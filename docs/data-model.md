# Data Model

## Transaction

```ts
interface Transaction {
  id: string
  name: string           // merchant / payee name
  description?: string   // raw bank description or user note
  amount: number         // negative = expense, positive = income
  date: string           // ISO 8601
  labelIds: string[]
}
```

## Label

```ts
interface Label {
  id: string
  name: string
  color: string
  groupId?: string       // optional grouping
  description?: string
  numberOfTransactions: number
  lastApplied: string    // ISO 8601
  created: string        // ISO 8601
}
```

## LabelGroup (future)

```ts
interface LabelGroup {
  id: string
  name: string
  color?: string
}
```

## UserSettings

```ts
interface UserSettings {
  theme: "light" | "dark" | "system"
  currency: string       // e.g. "EUR", "USD"
}
```

## AutoLabelRule (future)

```ts
interface AutoLabelRule {
  id: string
  pattern: string        // regex or substring match on description/name
  labelIds: string[]
}
```

## SavedView (future)

```ts
interface SavedView {
  id: string
  name: string
  filters: {
    labelIds?: string[]
    dateRange?: { from: string; to: string }
    amountRange?: { min: number; max: number }
  }
}
```

---

## Amount Convention

- Expenses → negative (`-42.50`)
- Income → positive (`+3500`)
- This makes math straightforward (sum = net balance)

---

## Local Store (Legend State)

```
store
├── transactions: Transaction[]
├── labels: Label[]
└── settings: UserSettings
```

Persisted via `persistObservable` to `localStorage` keys:
- `savyy-transactions`
- `savyy-labels`
- `savyy-settings`
