# Feature: Labels

## Overview

A page to view, create, edit, and delete labels. Labels are the core taxonomy of Savyy — they tag transactions and enable filtering and analytics.

This feature includes:
- The Legend State label store
- The `/labels` route and page
- The labels table with inline editing, sorting, filtering, selection, and bulk actions

Inherits all behaviors from `docs/features/table-patterns.md`.

---

## Data Model

```ts
interface Label {
  id: string       // UUID v4, generated client-side
  name: string
  color: string    // hex string, e.g. "#6366f1"
  groupId?: string // Phase 2 — unused for now
  createdAt: string // ISO 8601
}
```

Derived values (not stored, computed from `transactions$`):
- `transactionCount` — number of transactions that include this label's id in their `labelIds`
- `lastApplied` — most recent `date` among transactions with this label

---

## Store

File: `app/store/labels.ts`

```ts
export const labels$ = observable<Record<string, Label>>({})

syncObservable(labels$, {
  persist: {
    name: "labels",
    plugin: ObservablePersistIndexedDB({ databaseName: "savyy", version: 1, tableNames: ["transactions", "labels"] })
  }
})

export function addLabel(data: Omit<Label, "id" | "createdAt">): string
export function updateLabel(id: string, patch: Partial<Pick<Label, "name" | "color">>): void
export function deleteLabel(id: string): void
export function bulkDeleteLabels(ids: string[]): void
```

When a label is deleted, also remove its id from `labelIds` on all transactions (batched).

---

## Route

Path: `/labels`
File: `app/pages/authenticated/labels.tsx`

---

## Page Layout

```
[Page title: "Labels"]
[Filter input]                          [New label button]
─────────────────────────────────────────────────────────
[Labels table]
─────────────────────────────────────────────────────────
[Selection action bar — only visible when rows selected]
```

- No "New group" button for now (Phase 2 — see `docs/features/label-groups.md` when written)

---

## Table Columns

| Column | Width | Notes |
|--------|-------|-------|
| Checkbox | Fixed narrow | Hidden until hover or selected |
| Name | ~35% | Color dot + label name. Both are inline-editable. |
| Transactions | ~10% | Derived count. Right-aligned. Read-only. |
| Last applied | ~15% | Derived from transactions. Read-only. Format: `MMM YYYY` (e.g. "Mar 2025"). Shows `—` if never applied. |
| Created | ~15% | From `createdAt`. Format: `MMM YYYY`. Read-only. |
| `...` | Fixed narrow | Context menu. Shown on row hover only. |

Default sort: Name ascending.

---

## Color Dot (Inline Color Picker)

- Shown as a filled circle to the left of the label name
- Clicking the dot opens a small popover with color swatches
- Popover contains 10 preset color swatches (see palette below)
- Clicking a swatch immediately updates the label color and closes the popover
- `Escape` closes the popover without saving

### Preset color palette

```
#94a3b8  (slate)
#64748b  (slate dark)
#818cf8  (indigo)
#22d3ee  (cyan)
#34d399  (emerald)
#facc15  (yellow)
#fb923c  (orange)
#f9a8d4  (pink)
#f87171  (red)
#a78bfa  (violet)
```

> **Future feature:** Add a full hex color picker (color gradient canvas + hue slider + hex input) as an additional option in the color popover. See Linear's color picker for reference.

---

## Inline Name Editing

- Hovering the name cell reveals it as a text input
- Clicking activates editing immediately
- `Enter` or blur saves
- `Escape` cancels
- Empty name on blur reverts to previous value (no empty label names)

---

## New Label (Inline Row Creation)

- "New label" button in top-right corner (primary style)
- Clicking inserts an empty row at the top of the table
- Row has a neutral dot color (e.g. `#94a3b8`) and focuses the name input with placeholder `Label name`
- `Escape` discards the row
- Saving (Enter / blur) writes to the store and the row becomes a normal table row

---

## Context Menu (`...` per row)

Shown on row hover. Items:

| Item | Shortcut | Action |
|------|----------|--------|
| Edit label name | `E` | Focuses the inline name input on that row |
| Delete | — | Deletes the label (and removes it from all transactions). Shows a confirmation if label has ≥1 transaction. |

---

## Selection & Bulk Actions

Follows `table-patterns.md`. Bulk actions available via the selection action bar → Actions (command palette):

| Action | Behavior |
|--------|----------|
| Delete | Deletes all selected labels and removes them from all transactions. Confirmation required if any label has ≥1 transaction. |

---

## Filter

- Input placeholder: `Filter by name...`
- Filters label list client-side, case-insensitive substring match on `name`
- Empty state when no results: `No labels match "[query]"` with a "Clear filter" link

---

## Empty State (no labels at all)

Centered in table body:
```
No labels yet
Create your first label to start organizing your transactions.
[New label button]
```

---

## Keyboard Shortcuts (page-level)

| Shortcut | Action |
|----------|--------|
| `N` | Create new label (same as clicking "New label") — only when no input is focused |

---

## Out of Scope (this feature)

- Label groups (`groupId`) — see future feature `label-groups.md`
- Full hex color picker — future enhancement to color popover
- Auto-label rules — Phase 2
- Importing/exporting labels
