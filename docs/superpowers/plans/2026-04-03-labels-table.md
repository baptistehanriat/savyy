# Labels Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static labels table with a Linear-quality interactive table featuring keyboard navigation, inline editing, row selection, sorting, row creation, and a bulk-action command palette.

**Architecture:** TanStack Table manages data model (sorting, row selection, column definitions). Five focused components under `components/labels/` handle rendering and interaction. All state except persisted labels lives in local React state in `LabelsTable` — no store writes until the user confirms an edit.

**Tech Stack:** `@tanstack/react-table` v8, Legend State v3 (`useValue`), base-ui (Popover, Checkbox), `cmdk` (CommandDialog), Tailwind v4, Lucide icons, React Router v7.

---

## File map

| File | Action | Responsibility |
|---|---|---|
| `app/lib/use-keyboard-shortcut.ts` | Create | Attach `keydown` listeners declaratively |
| `app/lib/label-colors.ts` | Create | 10 preset color swatches constant |
| `app/store/labels.ts` | Modify | Rename `removeLabel` → `deleteLabel` |
| `app/components/labels/LabelsTable.tsx` | Create | TanStack Table setup, all orchestration state |
| `app/components/labels/LabelRow.tsx` | Create | Row rendering, draft state, blur-commit logic |
| `app/components/labels/LabelNameCell.tsx` | Create | Name display or editable input |
| `app/components/labels/LabelColorCell.tsx` | Create | Color dot trigger + swatch popover |
| `app/components/labels/LabelsActionBar.tsx` | Create | Floating action bar + command palette |
| `app/lib/use-labels-keyboard.ts` | Create | Table-scoped keyboard shortcut logic |
| `app/routes/labels.tsx` | Modify | Thin page — swap old table for `LabelsTable` |

---

## Task 1: `useKeyboardShortcut` hook

The conventions reference this hook but it doesn't exist yet.

**Files:**
- Create: `app/lib/use-keyboard-shortcut.ts`

- [ ] **Create the hook**

```ts
// app/lib/use-keyboard-shortcut.ts
import { useEffect } from "react"

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split("+")
  const key = parts[parts.length - 1]
  const hasCmd = parts.some((part) => part.toLowerCase() === "cmd" || part.toLowerCase() === "meta")
  const hasShift = parts.some((part) => part.toLowerCase() === "shift")
  const hasAlt = parts.some((part) => part.toLowerCase() === "alt")
  const hasCtrl = parts.some((part) => part.toLowerCase() === "ctrl")

  return (
    event.key === key &&
    event.metaKey === hasCmd &&
    event.shiftKey === hasShift &&
    event.altKey === hasAlt &&
    event.ctrlKey === hasCtrl
  )
}

export function useKeyboardShortcut(
  shortcut: string,
  callback: (event: KeyboardEvent) => void,
  options?: { enabled?: boolean }
) {
  useEffect(() => {
    if (options?.enabled === false) return

    function handleKeyDown(event: KeyboardEvent) {
      if (!matchesShortcut(event, shortcut)) return
      callback(event)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcut, callback, options?.enabled])
}
```

- [ ] **Commit**

```bash
git add app/lib/use-keyboard-shortcut.ts
git commit -m "feat: add useKeyboardShortcut hook"
```

---

## Task 2: Rename `removeLabel` → `deleteLabel` in store

**Files:**
- Modify: `app/store/labels.ts`
- Modify: `app/routes/labels.tsx` (if it calls `removeLabel`)

- [ ] **Rename in store**

In `app/store/labels.ts`, replace:
```ts
export function removeLabel(id: string) {
  const items = labelsStore.items.peek();
  labelsStore.items.set(items.filter((l) => l.id !== id));
}
```
With:
```ts
export function deleteLabel(id: string) {
  const items = labelsStore.items.peek()
  labelsStore.items.set(items.filter((label) => label.id !== id))
}
```

- [ ] **Check for usages of `removeLabel` across the codebase**

```bash
grep -r "removeLabel" app/
```

Update any file that imports `removeLabel` to use `deleteLabel` instead.

- [ ] **Commit**

```bash
git add app/store/labels.ts
git commit -m "feat: rename removeLabel to deleteLabel (conventions)"
```

---

## Task 3: Color presets constant

**Files:**
- Create: `app/lib/label-colors.ts`

- [ ] **Create the file**

```ts
// app/lib/label-colors.ts
export const LABEL_COLOR_PRESETS = [
  "#9ca3af", // gray
  "#94a3b8", // slate
  "#818cf8", // indigo
  "#22d3ee", // cyan
  "#4ade80", // green
  "#facc15", // yellow
  "#fb923c", // orange
  "#fda4af", // rose
  "#f87171", // red
  "#e879f9", // fuchsia
] as const

export type LabelColor = (typeof LABEL_COLOR_PRESETS)[number]

export const DEFAULT_LABEL_COLOR = LABEL_COLOR_PRESETS[5] // yellow
```

- [ ] **Commit**

```bash
git add app/lib/label-colors.ts
git commit -m "feat: add label color presets"
```

---

## Task 4: `LabelsTable` scaffold (static)

Replace the existing shadcn Table in `routes/labels.tsx` with a proper TanStack Table. No interactivity yet — just sorted columns and static rows.

**Files:**
- Create: `app/components/labels/LabelsTable.tsx`

- [ ] **Create the component**

```tsx
// app/components/labels/LabelsTable.tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { useState } from "react"
import { useValue } from "@legendapp/state/react"
import { ArrowUp, ArrowDown, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "~/lib/utils"
import { labelsStore } from "~/store/labels"
import { Button } from "~/components/ui/button"
import type { Label } from "~/store/labels"

const columnHelper = createColumnHelper<Label>()

export function LabelsTable() {
  const labels = useValue(labelsStore.items)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-left font-medium"
          onClick={() => column.toggleSorting()}
        >
          Name
          {column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
        </button>
      ),
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <span
            className="inline-block size-3 rounded-full"
            style={{ backgroundColor: row.original.color }}
          />
          {row.original.name}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-left font-medium"
          onClick={() => column.toggleSorting()}
        >
          Created
          {column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {format(new Date(getValue()), "MMM d, yyyy")}
        </span>
      ),
    }),
  ]

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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Labels</h1>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="size-4" />
          New label
        </Button>
      </div>

      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left text-muted-foreground font-normal"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-3 py-8 text-center text-muted-foreground">
                No labels yet.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  "group border-b transition-colors hover:bg-muted/50",
                  focusedRowIndex === index && "ring-1 ring-inset ring-ring",
                  row.getIsSelected() && "bg-accent",
                )}
                onClick={() => setFocusedRowIndex(index)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Update `routes/labels.tsx` to use `LabelsTable`**

Replace the entire file with:

```tsx
// app/routes/labels.tsx
import { LabelsTable } from "~/components/labels/LabelsTable"

export function meta() {
  return [{ title: "Labels" }]
}

export default function LabelsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <LabelsTable />
    </div>
  )
}
```

- [ ] **Start the dev server and verify the table renders with sorting**

```bash
npm run dev
```

Navigate to `/labels`. Verify: table renders, clicking "Name" or "Created" headers sorts the rows, arrow icon appears on the active sort column.

- [ ] **Commit**

```bash
git add app/components/labels/LabelsTable.tsx app/routes/labels.tsx
git commit -m "feat: scaffold LabelsTable with TanStack Table and column sorting"
```

---

## Task 5: `LabelColorCell`

**Files:**
- Create: `app/components/labels/LabelColorCell.tsx`

- [ ] **Create the component**

```tsx
// app/components/labels/LabelColorCell.tsx
import { forwardRef } from "react"
import { Check } from "lucide-react"
import { cn } from "~/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { LABEL_COLOR_PRESETS } from "~/lib/label-colors"

interface LabelColorCellProps {
  color: string
  isEditing: boolean
  onColorChange: (color: string) => void
  onTabFromColor?: () => void
}

export const LabelColorCell = forwardRef<HTMLButtonElement, LabelColorCellProps>(
  function LabelColorCell({ color, isEditing, onColorChange, onTabFromColor }, ref) {
    if (!isEditing) {
      return (
        <span
          className="inline-block size-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )
    }

    return (
      <Popover>
        <PopoverTrigger
          ref={ref}
          className={cn(
            "inline-block size-3 rounded-full shrink-0 cursor-pointer",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          )}
          style={{ backgroundColor: color }}
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              event.preventDefault()
              onTabFromColor?.()
            }
          }}
        />
        <PopoverContent
          className="w-auto p-2"
          side="bottom"
          align="start"
          sideOffset={6}
        >
          <div className="flex items-center gap-1">
            {LABEL_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="relative size-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: preset }}
                onClick={() => onColorChange(preset)}
              >
                {preset === color && (
                  <Check className="absolute inset-0 m-auto size-3 text-white drop-shadow-sm" />
                )}
              </button>
            ))}
            {/* Rainbow placeholder — full picker out of scope */}
            <button
              type="button"
              disabled
              className="size-6 rounded-full opacity-50 cursor-not-allowed"
              style={{
                background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)
```

- [ ] **Commit**

```bash
git add app/components/labels/LabelColorCell.tsx
git commit -m "feat: add LabelColorCell with swatch popover"
```

---

## Task 6: `LabelNameCell`

**Files:**
- Create: `app/components/labels/LabelNameCell.tsx`

- [ ] **Create the component**

```tsx
// app/components/labels/LabelNameCell.tsx
import { forwardRef, useEffect } from "react"
import { cn } from "~/lib/utils"

interface LabelNameCellProps {
  name: string
  isEditing: boolean
  onNameChange: (name: string) => void
  onEditStart: () => void
  onCommit: () => void
  onCancel: () => void
  onTabFromName?: () => void
}

export const LabelNameCell = forwardRef<HTMLInputElement, LabelNameCellProps>(
  function LabelNameCell(
    { name, isEditing, onNameChange, onEditStart, onCommit, onCancel, onTabFromName },
    ref
  ) {
    useEffect(() => {
      if (isEditing && ref && "current" in ref && ref.current) {
        ref.current.focus()
        ref.current.select()
      }
    }, [isEditing, ref])

    if (!isEditing) {
      return (
        <span
          className="cursor-default select-none"
          onDoubleClick={onEditStart}
        >
          {name || <span className="text-muted-foreground italic">Unnamed</span>}
        </span>
      )
    }

    return (
      <input
        ref={ref}
        type="text"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        className={cn(
          "w-full bg-transparent outline-none",
          "border-b border-ring",
          "text-sm",
        )}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            onCommit()
          }
          if (event.key === "Escape") {
            event.preventDefault()
            onCancel()
          }
          if (event.key === "Tab") {
            event.preventDefault()
            onTabFromName?.()
          }
        }}
      />
    )
  }
)
```

- [ ] **Commit**

```bash
git add app/components/labels/LabelNameCell.tsx
git commit -m "feat: add LabelNameCell with inline edit input"
```

---

## Task 7: `LabelRow`

Combines the two cells, holds draft state, coordinates Tab navigation between them, and handles the blur-to-commit logic.

**Files:**
- Create: `app/components/labels/LabelRow.tsx`

- [ ] **Create the component**

```tsx
// app/components/labels/LabelRow.tsx
import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "~/lib/utils"
import { Checkbox } from "~/components/ui/checkbox"
import { LabelNameCell } from "./LabelNameCell"
import { LabelColorCell } from "./LabelColorCell"
import { DEFAULT_LABEL_COLOR } from "~/lib/label-colors"
import type { Label } from "~/store/labels"

interface LabelRowProps {
  label: Label
  isSelected: boolean
  isFocused: boolean
  isEditing: boolean
  isNew: boolean
  onToggleSelected: () => void
  onFocus: () => void
  onEditStart: () => void
  onEditCommit: (name: string, color: string) => void
  onEditCancel: () => void
}

export function LabelRow({
  label,
  isSelected,
  isFocused,
  isEditing,
  isNew,
  onToggleSelected,
  onFocus,
  onEditStart,
  onEditCommit,
  onEditCancel,
}: LabelRowProps) {
  const [draftName, setDraftName] = useState(label.name)
  const [draftColor, setDraftColor] = useState(label.color || DEFAULT_LABEL_COLOR)

  const nameInputRef = useRef<HTMLInputElement>(null)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  const commitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset draft when editing starts
  useEffect(() => {
    if (isEditing) {
      setDraftName(label.name)
      setDraftColor(label.color || DEFAULT_LABEL_COLOR)
    }
  }, [isEditing, label.name, label.color])

  function handleCommit() {
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current)
      commitTimeoutRef.current = null
    }
    onEditCommit(draftName.trim(), draftColor)
  }

  function handleCancel() {
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current)
      commitTimeoutRef.current = null
    }
    onEditCancel()
  }

  // Schedule commit when focus leaves the row.
  // Delay allows popover portals (which live outside the <tr>) to receive
  // focus without incorrectly triggering a commit.
  function handleRowBlur() {
    if (!isEditing) return
    commitTimeoutRef.current = setTimeout(() => {
      handleCommit()
    }, 150)
  }

  // If focus returns to any element inside the row, cancel the scheduled commit.
  function handleRowFocus() {
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current)
      commitTimeoutRef.current = null
    }
  }

  // Tab from name → color button
  const handleTabFromName = useCallback(() => {
    colorButtonRef.current?.focus()
  }, [])

  // Tab from color → name input (wrap)
  const handleTabFromColor = useCallback(() => {
    nameInputRef.current?.focus()
    nameInputRef.current?.select()
  }, [])

  return (
    <tr
      className={cn(
        "group border-b transition-colors",
        "hover:bg-muted/50",
        isFocused && "ring-1 ring-inset ring-ring",
        isSelected && "bg-accent",
      )}
      onClick={onFocus}
      onFocus={handleRowFocus}
      onBlur={handleRowBlur}
    >
      {/* Name column: checkbox + color dot + name */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <Checkbox
            className={cn(
              "transition-opacity",
              !isSelected && "opacity-0 group-hover:opacity-100",
            )}
            checked={isSelected}
            onCheckedChange={onToggleSelected}
            onClick={(event) => event.stopPropagation()}
          />
          <LabelColorCell
            ref={colorButtonRef}
            color={draftColor}
            isEditing={isEditing}
            onColorChange={setDraftColor}
            onTabFromColor={handleTabFromColor}
          />
          <LabelNameCell
            ref={nameInputRef}
            name={draftName}
            isEditing={isEditing}
            onNameChange={setDraftName}
            onEditStart={onEditStart}
            onCommit={handleCommit}
            onCancel={handleCancel}
            onTabFromName={handleTabFromName}
          />
        </div>
      </td>

      {/* Created column */}
      <td className="px-3 py-2 text-muted-foreground">
        {!isNew &&
          new Date(label.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
      </td>
    </tr>
  )
}
```

- [ ] **Commit**

```bash
git add app/components/labels/LabelRow.tsx
git commit -m "feat: add LabelRow with draft state and Tab navigation"
```

---

## Task 8: Wire inline editing in `LabelsTable`

Replace `flexRender` in the `<tbody>` with `LabelRow`, and connect edit state.

**Files:**
- Modify: `app/components/labels/LabelsTable.tsx`

- [ ] **Remove the column cell definitions** — the `cell:` entries in `columns` are no longer needed since `LabelRow` renders cells directly. Simplify columns to header-only definitions:

```tsx
const columns = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 text-left font-medium"
        onClick={() => column.toggleSorting()}
      >
        Name
        {column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
        {column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
      </button>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 text-left font-medium"
        onClick={() => column.toggleSorting()}
      >
        Created
        {column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
        {column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
      </button>
    ),
  }),
]
```

- [ ] **Replace `<tbody>` contents with `LabelRow`**

Add to the imports at the top of `LabelsTable.tsx`:
```tsx
import { addLabel, updateLabel } from "~/store/labels"
import { LabelRow } from "./LabelRow"
import { DEFAULT_LABEL_COLOR } from "~/lib/label-colors"
```

Replace the `<tbody>` block with:

```tsx
<tbody>
  {table.getRowModel().rows.length === 0 && !isCreating ? (
    <tr>
      <td colSpan={2} className="px-3 py-8 text-center text-muted-foreground">
        No labels yet.
      </td>
    </tr>
  ) : (
    table.getRowModel().rows.map((row, index) => (
      <LabelRow
        key={row.id}
        label={row.original}
        isSelected={row.getIsSelected()}
        isFocused={focusedRowIndex === index}
        isEditing={editingRowId === row.original.id}
        isNew={row.original.id === "new"}
        onToggleSelected={() => row.toggleSelected()}
        onFocus={() => setFocusedRowIndex(index)}
        onEditStart={() => setEditingRowId(row.original.id)}
        onEditCommit={(name, color) => {
          if (row.original.id === "new") {
            if (name) addLabel({ name, color })
            setIsCreating(false)
          } else {
            updateLabel(row.original.id, { name, color })
          }
          setEditingRowId(null)
        }}
        onEditCancel={() => {
          setEditingRowId(null)
          if (row.original.id === "new") setIsCreating(false)
        }}
      />
    ))
  )}
</tbody>
```

- [ ] **Start dev server and verify inline editing works**

```bash
npm run dev
```

- Click a label name to focus the row, then press `E` (not wired yet — double-click the name instead via `onDoubleClick` in `LabelNameCell`).
- Edit the name, press `Enter` — should commit.
- Edit the name, press `Esc` — should revert.
- Click the color dot — swatch popover should appear, selecting a swatch should update the dot.
- Tab from name input → should focus color dot.
- Tab from color dot → should wrap back to name input.

- [ ] **Commit**

```bash
git add app/components/labels/LabelsTable.tsx
git commit -m "feat: wire inline editing in LabelsTable"
```

---

## Task 9: `use-labels-keyboard` hook

**Files:**
- Create: `app/lib/use-labels-keyboard.ts`

- [ ] **Create the hook**

```ts
// app/lib/use-labels-keyboard.ts
import { useKeyboardShortcut } from "~/lib/use-keyboard-shortcut"
import type { RowSelectionState } from "@tanstack/react-table"

interface UseLabelsKeyboardProps {
  rowCount: number
  focusedRowIndex: number | null
  setFocusedRowIndex: (index: number | null) => void
  editingRowId: string | null
  rowIds: string[]
  rowSelection: RowSelectionState
  setRowSelection: (selection: RowSelectionState) => void
  onEditStart: (rowId: string) => void
  isCommandPaletteOpen: boolean
  setIsCommandPaletteOpen: (open: boolean) => void
}

function isTypingInInput(): boolean {
  return (
    document.activeElement instanceof HTMLInputElement ||
    document.activeElement instanceof HTMLTextAreaElement
  )
}

export function useLabelsKeyboard({
  rowCount,
  focusedRowIndex,
  setFocusedRowIndex,
  editingRowId,
  rowIds,
  rowSelection,
  setRowSelection,
  onEditStart,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
}: UseLabelsKeyboardProps) {
  const isEditing = editingRowId !== null

  useKeyboardShortcut("ArrowUp", (event) => {
    if (isEditing || isTypingInInput()) return
    event.preventDefault()
    setFocusedRowIndex(
      focusedRowIndex === null ? 0 : Math.max(0, focusedRowIndex - 1)
    )
  })

  useKeyboardShortcut("ArrowDown", (event) => {
    if (isEditing || isTypingInInput()) return
    event.preventDefault()
    setFocusedRowIndex(
      focusedRowIndex === null ? 0 : Math.min(rowCount - 1, focusedRowIndex + 1)
    )
  })

  useKeyboardShortcut("shift+ArrowUp", (event) => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const newIndex = Math.max(0, focusedRowIndex - 1)
    const rowId = rowIds[newIndex]
    if (rowId) setRowSelection({ ...rowSelection, [rowId]: true })
    setFocusedRowIndex(newIndex)
  })

  useKeyboardShortcut("shift+ArrowDown", (event) => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const newIndex = Math.min(rowCount - 1, focusedRowIndex + 1)
    const rowId = rowIds[newIndex]
    if (rowId) setRowSelection({ ...rowSelection, [rowId]: true })
    setFocusedRowIndex(newIndex)
  })

  useKeyboardShortcut("x", (event) => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const rowId = rowIds[focusedRowIndex]
    if (!rowId) return
    const isSelected = Boolean(rowSelection[rowId])
    const nextSelection = { ...rowSelection }
    if (isSelected) {
      delete nextSelection[rowId]
    } else {
      nextSelection[rowId] = true
    }
    setRowSelection(nextSelection)
  })

  useKeyboardShortcut("Meta+a", (event) => {
    if (isEditing) return
    event.preventDefault()
    setRowSelection(Object.fromEntries(rowIds.map((id) => [id, true])))
  })

  useKeyboardShortcut("e", (event) => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const rowId = rowIds[focusedRowIndex]
    if (rowId) onEditStart(rowId)
  })

  useKeyboardShortcut("Enter", (event) => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const rowId = rowIds[focusedRowIndex]
    if (rowId) onEditStart(rowId)
  })

  useKeyboardShortcut("Escape", () => {
    if (isEditing) return // handled by the input's onKeyDown
    if (Object.keys(rowSelection).length > 0) {
      setRowSelection({})
      return
    }
    setFocusedRowIndex(null)
  })

  useKeyboardShortcut("Meta+k", (event) => {
    if (Object.keys(rowSelection).length === 0) return
    event.preventDefault()
    setIsCommandPaletteOpen(!isCommandPaletteOpen)
  })
}
```

- [ ] **Wire the hook into `LabelsTable`**

Add to imports in `LabelsTable.tsx`:
```tsx
import { useLabelsKeyboard } from "~/lib/use-labels-keyboard"
```

Add the hook call inside `LabelsTable`, after all state declarations:

```tsx
const rowIds = table.getRowModel().rows.map((row) => row.id)
const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

useLabelsKeyboard({
  rowCount: table.getRowModel().rows.length,
  focusedRowIndex,
  setFocusedRowIndex,
  editingRowId,
  rowIds,
  rowSelection,
  setRowSelection,
  onEditStart: (rowId) => setEditingRowId(rowId),
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
})
```

- [ ] **Start dev server and verify keyboard navigation**

Navigate to `/labels`. Verify:
- `↑`/`↓` moves the focus ring between rows
- `X` toggles selection on the focused row
- `Cmd+A` selects all rows
- `Shift+↑`/`Shift+↓` extends selection
- `E` or `Enter` starts editing the focused row
- `Esc` clears selection or focus

- [ ] **Commit**

```bash
git add app/lib/use-labels-keyboard.ts app/components/labels/LabelsTable.tsx
git commit -m "feat: add keyboard navigation hook and wire into LabelsTable"
```

---

## Task 10: Row creation

**Files:**
- Modify: `app/components/labels/LabelsTable.tsx`

- [ ] **Prepend the sentinel row to the data when `isCreating` is true**

In `LabelsTable.tsx`, replace the `data` passed to `useReactTable` with a computed value:

```tsx
import { useMemo } from "react"
import { DEFAULT_LABEL_COLOR } from "~/lib/label-colors"

// Inside LabelsTable, before useReactTable:
const sentinelLabel: Label = useMemo(
  () => ({
    id: "new",
    name: "",
    color: DEFAULT_LABEL_COLOR,
    createdAt: new Date().toISOString(),
  }),
  []
)

const tableData = useMemo(
  () => (isCreating ? [sentinelLabel, ...labels] : labels),
  [isCreating, labels, sentinelLabel]
)
```

Pass `tableData` instead of `labels` to `useReactTable`:

```tsx
const table = useReactTable({
  data: tableData,
  // ...rest unchanged
})
```

- [ ] **Auto-start editing the sentinel row when `isCreating` becomes true**

Add a `useEffect` in `LabelsTable`:

```tsx
import { useEffect } from "react"

useEffect(() => {
  if (isCreating) {
    setEditingRowId("new")
    setFocusedRowIndex(0)
  }
}, [isCreating])
```

- [ ] **Prevent "New label" button from re-creating if already creating**

Update the button `onClick`:

```tsx
<Button
  size="sm"
  onClick={() => {
    if (isCreating) {
      nameInputRef.current?.focus() // would need to expose this — see note
      return
    }
    setIsCreating(true)
  }}
>
  <Plus className="size-4" />
  New label
</Button>
```

Note: re-focusing the existing new row input on repeated clicks is a nice-to-have. Since the sentinel row is always at index 0 when `isCreating`, `setFocusedRowIndex(0)` is sufficient for now.

Simplify to:
```tsx
<Button
  size="sm"
  onClick={() => {
    if (!isCreating) setIsCreating(true)
    else setFocusedRowIndex(0)
  }}
>
  <Plus className="size-4" />
  New label
</Button>
```

- [ ] **Start dev server and verify row creation**

- Click "New label" — a new empty row appears at the top with the name input focused.
- Type a name, press `Enter` — row is saved, appears in the list.
- Click "New label" again, press `Esc` — row disappears, nothing saved.
- Click "New label" when a row already exists in creation — just re-focuses.

- [ ] **Commit**

```bash
git add app/components/labels/LabelsTable.tsx
git commit -m "feat: add inline row creation to LabelsTable"
```

---

## Task 11: `LabelsActionBar`

**Files:**
- Create: `app/components/labels/LabelsActionBar.tsx`
- Modify: `app/components/labels/LabelsTable.tsx`

- [ ] **Create the component**

```tsx
// app/components/labels/LabelsActionBar.tsx
import { useState } from "react"
import { X, Command, Trash2, Tag } from "lucide-react"
import { cn } from "~/lib/utils"
import { deleteLabel } from "~/store/labels"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "~/components/ui/command"

interface LabelsActionBarProps {
  selectedCount: number
  selectedIds: string[]
  isCommandPaletteOpen: boolean
  onSetCommandPaletteOpen: (open: boolean) => void
  onClearSelection: () => void
}

export function LabelsActionBar({
  selectedCount,
  selectedIds,
  isCommandPaletteOpen,
  onSetCommandPaletteOpen,
  onClearSelection,
}: LabelsActionBarProps) {
  function handleDelete() {
    selectedIds.forEach((id) => deleteLabel(id))
    onClearSelection()
    onSetCommandPaletteOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2",
          "flex items-center gap-1 rounded-full",
          "border bg-background px-3 py-1.5 shadow-lg",
          "text-sm",
          "transition-all duration-150",
        )}
      >
        <span className="pr-1 font-medium">{selectedCount} selected</span>

        <button
          title="Clear selected (Esc)"
          className="rounded-full p-1 hover:bg-muted"
          onClick={onClearSelection}
        >
          <X className="size-3.5" />
        </button>

        <button
          title="Open command menu (⌘K)"
          className="flex items-center gap-1.5 rounded-full px-2 py-1 hover:bg-muted"
          onClick={() => onSetCommandPaletteOpen(true)}
        >
          <Command className="size-3.5" />
          <span>Actions</span>
        </button>
      </div>

      <CommandDialog
        open={isCommandPaletteOpen}
        onOpenChange={onSetCommandPaletteOpen}
        title={`${selectedCount} label${selectedCount === 1 ? "" : "s"}`}
        description="Actions for selected labels"
      >
        <div className="flex items-center gap-1.5 border-b px-3 py-2 text-sm text-muted-foreground">
          <Tag className="size-3.5" />
          {selectedCount} label{selectedCount === 1 ? "" : "s"}
        </div>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandItem
            className="text-destructive data-selected:text-destructive"
            onSelect={handleDelete}
          >
            <Trash2 className="size-4" />
            Delete label{selectedCount === 1 ? "" : "s"}
          </CommandItem>
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

- [ ] **Mount `LabelsActionBar` in `LabelsTable`**

Add to imports:
```tsx
import { LabelsActionBar } from "./LabelsActionBar"
```

Add at the bottom of the `LabelsTable` return, after the `</table>`:

```tsx
{Object.keys(rowSelection).length > 0 && (
  <LabelsActionBar
    selectedCount={Object.keys(rowSelection).length}
    selectedIds={Object.keys(rowSelection)}
    isCommandPaletteOpen={isCommandPaletteOpen}
    onSetCommandPaletteOpen={setIsCommandPaletteOpen}
    onClearSelection={() => setRowSelection({})}
  />
)}
```

- [ ] **Start dev server and verify the action bar**

- Select one or more rows via `X` key or clicking the checkbox.
- Action bar appears at the bottom with count, clear button, and Actions button.
- Clicking `X` button clears selection and hides the bar.
- Clicking `Actions` opens the command palette with "Delete labels".
- Selecting "Delete labels" deletes selected labels, clears selection, closes palette.
- `Cmd+K` (wired in Task 9) also opens the command palette.
- `Esc` clears selection (wired in `use-labels-keyboard`).

- [ ] **Commit**

```bash
git add app/components/labels/LabelsActionBar.tsx app/components/labels/LabelsTable.tsx
git commit -m "feat: add LabelsActionBar with command palette and delete action"
```

---

## Task 12: Final verification and cleanup

- [ ] **Verify the complete flow end-to-end**

Start the dev server and run through every spec requirement:

| Scenario | Expected |
|---|---|
| `↑`/`↓` | Focus ring moves between rows |
| `Shift+↑`/`Shift+↓` | Selection extends |
| `Cmd+A` | All rows selected |
| `X` on focused row | Row selected/deselected |
| `E` or `Enter` on focused row | Inline edit starts, name input focused |
| Tab in name input | Focus moves to color dot |
| Tab in color dot | Focus wraps back to name input |
| Click color dot | Swatch popover opens |
| Click swatch | Color updates (draft only) |
| Enter in name input | Edit committed, store updated |
| Esc in name input | Edit cancelled, original restored |
| Blur outside row | Edit committed |
| New label button | Empty row at top, name focused |
| Enter on new row | Label saved to store |
| Esc on new row | Row discarded |
| Selection bar visible | When ≥1 row selected |
| X in action bar | Selection cleared |
| Actions / Cmd+K | Command palette opens |
| Delete labels | Selected labels removed |
| Sorting | Click column header sorts asc/desc, icon shows direction |

- [ ] **Check for console errors or TypeScript issues**

```bash
npm run typecheck 2>/dev/null || npx tsc --noEmit
```

Fix any TypeScript errors before committing.

- [ ] **Commit**

```bash
git add -A
git commit -m "feat: complete labels table with keyboard nav, inline editing, selection, and sorting"
```
