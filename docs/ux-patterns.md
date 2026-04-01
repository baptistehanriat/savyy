# UX Patterns

## Linear-Inspired Interactions

Savyy should feel like Linear: fast, keyboard-driven, never blocking.

### Keyboard Navigation

| Shortcut | Action |
|---|---|
| `↑` / `↓` | Navigate rows in table |
| `Space` | Select/deselect row |
| `Enter` | Open transaction detail |
| `Escape` | Close modal / deselect |
| `cmd+k` | Open command palette |
| `cmd+n` | New transaction |
| `cmd+i` | Import CSV |
| `cmd+,` | Settings |

### Command Palette (`cmd+k`)

Context-aware. When rows are selected, shows actions:
- Delete selected
- Add label to selected
- Remove label from selected
- Change date on selected
- Export selected

When nothing is selected, shows global navigation:
- Go to Transactions
- Go to Analytics
- Go to Labels
- New transaction
- Import CSV

### Selection

- Click checkbox or row to select
- `shift+click` for range selection
- Selection bar appears at bottom of table (like Linear's multi-select bar)
- Shows count + action buttons

### Inline Editing

- Click a cell to edit inline (name, amount, date, labels)
- `Tab` moves to next editable cell
- `Enter` confirms, `Escape` cancels
- Auto-save on blur

### Transaction Creation

Modal with segmented control:
- **Manual**: form (name, date, amount, labels)
- **Import**: CSV drag-and-drop

"Create more" toggle (like Linear) — keeps modal open after save.

---

## Table Design

- Sticky header
- Zebra striping or subtle row borders (TBD)
- Row hover: show delete button on right
- Selected row: distinct background (not just hover color)
- Checkbox column: fixed narrow width, left-aligned
- Amount column: right-aligned, red for negative / green for positive (or neutral — TBD)
- Labels: inline chips, overflow → `+N more`

---

## Labels UX

- Autocomplete on input (fuzzy search)
- Create on the fly (type new name → create)
- Color picker on label creation
- Label chip click → filter to that label

---

## Import Flow

1. Drop CSV file or click to upload
2. Preview first 5 rows
3. Map columns: Date, Amount, Description/Name
4. Choose date format and amount sign convention
5. Preview parsed transactions
6. Confirm import — transactions added to store instantly
