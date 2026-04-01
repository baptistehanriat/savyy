# Project Structure

```
savyy/
├── app/
│   ├── root.tsx                    # App shell: fonts, global providers, error boundary
│   ├── routes.ts                   # Route definitions
│   ├── app.css                     # Global styles, CSS variables, theme tokens
│   │
│   ├── store/                      # Legend State — single source of truth
│   │   ├── index.ts                # Re-exports everything; initializes persistence
│   │   ├── transactions.ts         # transactions$ observable + mutations
│   │   ├── labels.ts               # labels$ observable + mutations
│   │   └── settings.ts             # settings$ observable + mutations
│   │
│   ├── types/                      # Shared TypeScript interfaces (no logic)
│   │   └── index.ts                # Transaction, Label, LabelGroup, UserSettings
│   │
│   ├── lib/                        # Pure utilities — no React, no store access
│   │   ├── cn.ts                   # cn() helper (clsx + tailwind-merge)
│   │   ├── format.ts               # formatAmount, formatDate, formatRelativeDate
│   │   ├── csv.ts                  # parseCSV, mapColumns, validateRow
│   │   └── ids.ts                  # generateId (uuid wrapper)
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-keyboard-shortcut.ts
│   │   ├── use-command-palette.ts
│   │   └── use-transactions-filter.ts
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives — generated, rarely edited
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── primitives/             # App-level shared components (no store access)
│   │   │   ├── page-header.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── kbd.tsx             # Keyboard shortcut badge
│   │   │   └── amount.tsx          # Formatted amount with color
│   │   │
│   │   ├── layout/                 # App shell components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── nav.tsx
│   │   │   └── theme-switch.tsx
│   │   │
│   │   ├── transactions/           # Transaction feature components
│   │   │   ├── transactions-table.tsx
│   │   │   ├── transaction-row.tsx
│   │   │   ├── transaction-form.tsx
│   │   │   ├── transaction-filters.tsx
│   │   │   └── transaction-selection-bar.tsx
│   │   │
│   │   ├── labels/                 # Label feature components
│   │   │   ├── labels-table.tsx
│   │   │   ├── label-form.tsx
│   │   │   ├── label-chip.tsx      # Inline label badge
│   │   │   └── label-combobox.tsx  # Autocomplete label picker
│   │   │
│   │   ├── import/                 # CSV import wizard
│   │   │   ├── import-wizard.tsx
│   │   │   ├── file-drop-zone.tsx
│   │   │   ├── column-mapper.tsx
│   │   │   └── import-preview.tsx
│   │   │
│   │   ├── analytics/              # Charts (Phase 4)
│   │   │   └── ...
│   │   │
│   │   └── command-palette/        # cmd+k
│   │       ├── command-palette.tsx
│   │       └── command-palette-store.ts
│   │
│   └── pages/
│       ├── login.tsx
│       └── authenticated/
│           ├── layout.tsx          # Auth guard + app shell
│           ├── dashboard.tsx
│           ├── transactions.tsx
│           ├── transactions.$id.tsx
│           ├── labels.tsx
│           ├── analytics.tsx
│           └── settings.tsx
│
├── public/
├── docs/                           # All project documentation
├── package.json
├── tsconfig.json
├── vite.config.ts
└── react-router.config.ts
```

---

## Key Structural Rules

### `store/` — state only
- Each file owns one domain (transactions, labels, settings)
- Mutations are co-located with the observable they affect
- No React imports — pure Legend State
- `store/index.ts` is the only public entry point

```ts
// store/transactions.ts
export const transactions$ = observable(syncedIndexedDB({ ... }))
export function addTransaction(tx: Omit<Transaction, "id">) {
  transactions$[generateId()].set({ ...tx, id: generateId() })
}
export function deleteTransaction(id: string) {
  transactions$[id].delete()
}
```

### `lib/` — zero dependencies on React or store
Everything in `lib/` is a pure function. Testable in isolation. No imports from `~/store`, no hooks.

### `components/ui/` — hands off
Never edit files here directly. If shadcn generates something that needs tweaking, copy it to `components/primitives/` and modify there.

### `components/primitives/` — no store access
Primitives receive everything via props. They don't know about the store. This keeps them reusable and testable.

### `components/[feature]/` — can access store directly
Feature components (transactions, labels, import) read/write the store directly. No prop drilling for data. Props are for layout/behavior overrides only.

### `pages/` — thin
Pages are layout containers. They own the page-level layout, set the document title, render the right feature components. Logic lives in components and the store.
