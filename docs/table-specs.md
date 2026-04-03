# Table Specs

Target UX: Linear-level quality.

---

## Keyboard navigation

- `↑` / `↓` — move focus between rows
- `Shift+↑` / `Shift+↓` — extend selection (range select)
- `Cmd+A` — select all rows
- `X` — toggle selection on focused row
- `E` — enter inline edit mode on the first/main cell of the focused row
- `Enter` — open row detail, or confirm inline edit
- `Esc` — cancel inline edit (reverts to original value), or remove focus from current row
- `Cmd+K` — open command palette scoped to selected rows

## Inline editing

- `Tab` — move to next editable cell within the same row, wraps back to first after the last
- `Enter` — confirm edit and exit edit mode
- `Esc` — cancel edit, revert to original value

## Row creation

- Clicking "New [item]" creates a new empty row at the top of the table
- First/main cell is immediately focused and ready to edit
- `Enter` on a new empty row — saves it
- `Esc` on a new empty row — discards it entirely

## Selection

- At least one row selected → show selection action bar at the bottom of the table
- Action bar shows count of selected rows and available bulk actions

## Visual states

- **Focused row** (keyboard navigation) — focus ring via CSS `ring`
- **Selected row** (checked for bulk actions) — background color highlight
- **Hover** — background color change; reveals quick action buttons on the right (e.g. delete)
- **Checkbox** — visible on hover, always visible when row is selected

## Columns

- Sortable by clicking on column header
- Sort direction indicated by asc/desc arrow on the active column

---

## Labels table specifics

### Editable fields

- Name
- Color

### Actions (action bar + command palette)

- Delete

### Ideas / future

- Merge labels — combine two or more labels into one

## Undo / redo

Legend State has a native `undoRedo` helper — no custom implementation needed.

```ts
const { undo, redo } = undoRedo(labels$, { limit: 100 })
```

Tracks changes to the observable automatically. Hook up to `Cmd+Z` / `Cmd+Shift+Z` keyboard shortcuts.