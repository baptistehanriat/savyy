# Shared Table Patterns

These patterns apply to every data table in Savyy (labels, transactions, etc.).
Any feature spec referencing a table inherits all of these behaviors unless explicitly overridden.

---

## Layout

- Full-width, no outer card border
- Sticky header row
- Each row: fixed height (e.g. `h-11`), vertically centered content
- Last column is always the `...` context menu, fixed narrow width, hidden until row hover
- Column headers are left-aligned except numeric columns (right-aligned)

---

## Column Sorting

- Clicking a column header sorts by that column asc; clicking again toggles to desc
- Active sort shown as `Name ↓` (arrow indicates direction) in the header
- Hovering an unsorted header shows a tooltip: `Order by [Column name]`
- Only one column sorted at a time
- Default sort is defined per feature spec

---

## Row Selection

- Each row has a checkbox in the leftmost column
- Checkbox is hidden until row hover, always visible when the row is selected
- Clicking anywhere on the row (outside an editable cell) selects it
- `Shift+click` selects a contiguous range from the last selected row to the clicked row
- Selected rows have a distinct background (`bg-accent` or similar)

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move focus between rows |
| `Space` | Toggle selection of focused row |
| `Enter` | Begin inline editing on the focused row's primary cell |
| `Escape` | Cancel editing / clear selection |
| `Tab` | Move to the next editable cell within the same row |
| `Shift+Tab` | Move to previous editable cell |

Focus ring should be visible on the focused row (subtle outline, not the same as selection).

---

## Inline Editing

- Hovering an editable cell reveals it as editable (text input appears in place, same font/size)
- Clicking an editable cell activates it immediately
- `Enter` or blur (clicking away) confirms and saves the change
- `Escape` cancels and reverts to the previous value
- Empty required fields revert to original value on blur (no empty saves)
- Placeholder text in muted color when the cell is empty (e.g. `Add description...`)

---

## Inline Row Creation ("New [item]" button)

- Clicking the primary "New [item]" button inserts an empty row at the top of the list
- The row is immediately focused and its primary editable cell (name/title) is active
- The row has a neutral default color/icon
- Pressing `Escape` before saving discards the new row entirely
- Pressing `Enter` or blurring the last field saves the row to the store

---

## Context Menu (`...` button)

- Appears on the far right of a row on hover (replaces empty space)
- Clicking it opens a small dropdown menu anchored to the button
- Menu items have an icon + label + optional keyboard shortcut hint on the right
- Menu closes on `Escape`, clicking outside, or selecting an item
- Destructive actions (Delete) are visually separated (divider) and colored red

---

## Selection Action Bar

- Appears at the bottom-center of the screen (floating, above page footer) when ≥1 row is selected
- Content: `[N] selected` · `✕` (clear) · `⌘ Actions` button
- Clicking `✕` deselects all rows and hides the bar
- Clicking `Actions` opens the command palette scoped to the current selection
- Bar animates in/out (slide up / fade)
- `Escape` also clears selection and hides the bar

---

## Empty States

- When a table has no data: centered message + call-to-action button (e.g. "No labels yet · Create your first label")
- When a filter returns no results: centered message explaining the filter is active (e.g. "No labels match '[query]'") with a "Clear filter" link
- Empty states should be placed in the table body area, not replacing the header

---

## Filter Bar

- Text input with search icon: filters the visible list client-side on every keystroke
- Filtering is case-insensitive and matches any substring
- Placeholder: `Filter by name...`
- Clearing the input restores the full list
- Filter does not persist across page navigations
