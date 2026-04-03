# Labels Table — Design Spec

**Date:** 2026-04-03
**Scope:** Phase 1 — core interactive table (keyboard nav, inline editing, row creation, selection + delete, sorting)
**Target UX:** Linear-level quality

---

## File structure

```
app/
  components/
    labels/
      LabelsTable.tsx      — TanStack Table setup, orchestrates all state
      LabelRow.tsx         — row rendering, holds local draft state for inline editing
      LabelNameCell.tsx    — name cell: static display or editable input
      LabelColorCell.tsx   — color dot trigger + swatch popover
      LabelsActionBar.tsx  — bottom floating bar (selected count, clear, actions)
  routes/
    labels.tsx             — thin page: reads store, renders header + LabelsTable
  store/
    labels.ts              — rename removeLabel → deleteLabel (conventions alignment)
```

---

## State

### Legend State store
- `labelsStore.items: Label[]` — source of truth, read via `useValue()`

### TanStack Table state (local in `LabelsTable`)
- `rowSelection: Record<string, boolean>` — checked rows by id
- `sorting: SortingState` — active column + direction

### Local React state (local in `LabelsTable`)
- `focusedRowIndex: number | null` — row with keyboard focus ring
- `editingRowId: string | null` — row currently in inline edit mode
- `isCreating: boolean` — whether the temporary new-row sentinel is showing

### Local draft state (local in `LabelRow`)
- `draftName: string` — initialized from `label.name` on edit start
- `draftColor: string` — initialized from `label.color` on edit start
- Discarded on `Esc`, committed to store on `Enter` / blur

Nothing from the editing flow touches the store until the user confirms.

---

## TanStack Table

```ts
const table = useReactTable({
  data: labels,
  columns,
  state: { rowSelection, sorting },
  onRowSelectionChange: setRowSelection,
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getRowId: (row) => row.id,
})
```

### Columns

| # | Column | Sortable | Content |
|---|---|---|---|
| 1 | Name | yes | Checkbox + color dot trigger + name text/input |
| 2 | Created | yes | Formatted date, read-only |

The checkbox and color dot live inside the Name cell — no separate checkbox column.

### Sorting icons
Only the active sorted column shows an icon. `ArrowUp` for ascending, `ArrowDown` for descending. No icon on unsorted columns.

---

## Keyboard navigation

Hook: `use-labels-keyboard.ts`, wired in `LabelsTable` via `useKeyboardShortcut`.
Shortcuts are inactive when a text input is focused (no conflict with typing).

| Key | Action |
|---|---|
| `↑` / `↓` | Move `focusedRowIndex` up / down |
| `Shift+↑` / `Shift+↓` | Extend `rowSelection` range |
| `Cmd+A` | Select all rows |
| `X` | Toggle selection on focused row |
| `E` | Set `editingRowId` to focused row |
| `Enter` | Enter edit mode when not editing |
| `Esc` | Cancel edit if editing; clear `focusedRowIndex` otherwise |
| `Cmd+K` | Open command palette (only when rows are selected) |

Focused row gets a CSS `ring` class. Clicking a row sets `focusedRowIndex`. Clicking outside the table clears it.

---

## Inline editing

Triggered by `E`, `Enter`, or clicking the name cell.

### Name cell (`LabelNameCell`)
- Renders `<input>` auto-focused on edit start, pre-filled with `draftName`
- `Tab` → moves focus to color cell
- `Enter` → commits `updateLabel(id, { name: draftName, color: draftColor })`, clears `editingRowId`
- `Esc` → discards draft, clears `editingRowId`
- Blur → same as `Enter` (commits)

### Color cell (`LabelColorCell`)
- Color dot is the popover trigger, positioned left of the name text
- Clicking opens a horizontal swatch popover
- Selecting a swatch updates `draftColor` (local only, not committed yet)
- `Tab` from color cell → wraps back to name cell
- Last swatch is a rainbow gradient placeholder (full picker, out of scope)
- Active color shown with a checkmark on its swatch
- Commit happens when the row exits edit mode

### Swatch palette
10 preset colors, defined as a constant. No free hex input in this phase.

---

## Row creation

1. User clicks "New label" → `isCreating = true`
2. Sentinel row `{ id: "new", name: "", color: <first preset> }` prepended to data
3. Renders as `LabelRow` with `isEditing = true`, name input auto-focused
4. `Enter` / blur → `addLabel({ name: draftName, color: draftColor })`, `isCreating = false`
5. `Esc` → `isCreating = false`, sentinel removed, nothing saved

Clicking "New label" while `isCreating` is already true re-focuses the input (no-op otherwise).

---

## Selection + action bar

### `LabelsActionBar`
Visible when `Object.keys(rowSelection).length > 0`. Floating pill at the bottom of the page.

Layout: `[{n} selected] [X button] [⌘ Actions button]`

- **X button** — clears `rowSelection` (tooltip: "Clear selected Esc")
- **⌘ Actions button** — opens command palette (tooltip: "Open command menu ⌘ K")
- `Esc` also clears selection when not in edit mode
- `Cmd+K` also opens the command palette when rows are selected

Animates in/out with `opacity` + `translate-y` Tailwind transition.

### Command palette (`cmdk`)
- Header: `"{n} labels"` + icon
- Search input: "Type a command or search..."
- Actions (phase 1): **Delete labels** only
- Delete → `deleteLabel(id)` for each selected id → clear `rowSelection` → close palette

---

## Out of scope (this phase)
- Undo / redo (`undoRedo` from Legend State — next phase)
- Filter input
- Derived columns (transaction count, last applied)
- Merge labels
- Full hex color picker
- `Cmd+K` global command palette
