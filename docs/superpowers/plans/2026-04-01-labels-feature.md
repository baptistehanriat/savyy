# Labels Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Labels page — store with IndexedDB persistence, table with inline editing, color picker, sorting, filtering, row selection, bulk delete, and keyboard navigation.

**Architecture:** Legend State v3 observable keyed by UUID for `labels$` with IndexedDB persistence. `transactions$` stub provides derived stats (transaction count, last applied). TanStack Table v8 manages sort/selection state. App shell (sidebar + layout) built first since none currently exists. Row selection state is lifted to the page so the selection action bar can read it.

**Tech Stack:** React 19, React Router v7, Legend State v3 beta (`@legendapp/state`), TanStack Table v8 (`@tanstack/react-table`), shadcn/ui (Popover, DropdownMenu, Checkbox), Tailwind v4, Lucide icons, date-fns

---

## Current state (read before starting)

- `app/lib/utils.ts` — already has `cn()`. Do not recreate it.
- `app/app.css` — already imports Geist font and all shadcn design tokens. Do not overwrite.
- `app/root.tsx` — loads Inter from Google Fonts (remove this; Geist is already loaded via CSS).
- `app/routes.ts` — only has `index("routes/home.tsx")`. Needs replacing.
- `app/components/ui/button.tsx` — already exists.
- No other feature code exists yet.

---

## File Map

**New files to create:**
- `app/types/index.ts` — `Label` and `Transaction` TypeScript interfaces
- `app/lib/ids.ts` — `generateId()` using `crypto.randomUUID()`
- `app/lib/use-keyboard-shortcut.ts` — global keyboard shortcut hook
- `app/store/idb.ts` — shared `ObservablePersistIndexedDB` plugin instance
- `app/store/labels.ts` — `labels$` observable + `addLabel`, `updateLabel`, `deleteLabel`, `bulkDeleteLabels`
- `app/store/transactions.ts` — `transactions$` observable + `removeLabelFromAllTransactions`
- `app/components/primitives/app-sidebar.tsx` — sidebar with nav links
- `app/pages/authenticated/layout.tsx` — full-height shell: sidebar + `<Outlet />`
- `app/pages/authenticated/dashboard.tsx` — placeholder page
- `app/pages/authenticated/labels.tsx` — labels page (filter bar, "New label" button, table, empty state, selection bar)
- `app/components/labels/labels-table.tsx` — TanStack Table with all label behaviors
- `app/components/labels/label-color-picker.tsx` — preset color swatch popover
- `app/components/labels/label-row-actions.tsx` — `...` context menu per row
- `app/components/primitives/selection-action-bar.tsx` — bottom floating bar when rows are selected

**Files to modify:**
- `app/routes.ts` — replace with layout + labels routes
- `app/root.tsx` — remove Google Fonts Inter link (Geist already loaded via CSS)

**shadcn components to add (via CLI):**
`popover`, `dropdown-menu`, `separator`, `checkbox`

**npm packages to install:**
`date-fns`

---

## Task 1: Install dependencies and add shadcn components

**Files:**
- Modify: `package.json` (via npm)
- Create: `app/components/ui/popover.tsx`, `app/components/ui/dropdown-menu.tsx`, `app/components/ui/separator.tsx`, `app/components/ui/checkbox.tsx`

- [ ] **Step 1: Install date-fns**

```bash
npm install date-fns
```

Expected: `date-fns` appears in `package.json` dependencies.

- [ ] **Step 2: Add shadcn components**

```bash
npx shadcn add popover dropdown-menu separator checkbox
```

Accept all prompts. Expected: 4 new files in `app/components/ui/`.

- [ ] **Step 3: Verify typecheck passes**

```bash
npm run typecheck
```

Expected: no errors (or only pre-existing boilerplate errors).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json app/components/ui/
git commit -m "feat: install date-fns and add shadcn popover, dropdown, separator, checkbox"
```

---

## Task 2: Types and utilities

**Files:**
- Create: `app/types/index.ts`
- Create: `app/lib/ids.ts`

- [ ] **Step 1: Create shared types**

Create `app/types/index.ts`:

```ts
export interface Label {
  id: string
  name: string
  color: string     // hex, e.g. "#818cf8"
  groupId?: string  // Phase 2 — unused for now
  createdAt: string // ISO 8601
}

export interface Transaction {
  id: string
  name: string
  description?: string
  amount: number      // integer cents, negative = expense
  date: string        // ISO 8601 date string, e.g. "2024-03-15"
  labelIds: string[]
  createdAt: string   // ISO 8601
}
```

- [ ] **Step 2: Create ID utility**

Create `app/lib/ids.ts`:

```ts
export function generateId(): string {
  return crypto.randomUUID()
}
```

- [ ] **Step 3: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add app/types/index.ts app/lib/ids.ts
git commit -m "feat: add Label and Transaction types and generateId utility"
```

---

## Task 3: Label and transaction stores

**Files:**
- Create: `app/store/idb.ts`
- Create: `app/store/labels.ts`
- Create: `app/store/transactions.ts`

- [ ] **Step 1: Create shared IndexedDB plugin**

Create `app/store/idb.ts`:

```ts
import { ObservablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb"

// Shared across all stores. Both table names must be declared here.
export const idbPlugin = ObservablePersistIndexedDB({
  databaseName: "savyy",
  version: 1,
  tableNames: ["transactions", "labels"],
})
```

- [ ] **Step 2: Create transactions store**

Create `app/store/transactions.ts`:

```ts
import { observable, batch } from "@legendapp/state"
import { syncObservable } from "@legendapp/state/sync"
import { idbPlugin } from "./idb"
import { generateId } from "~/lib/ids"
import type { Transaction } from "~/types"

export const transactions$ = observable<Record<string, Transaction>>({})

syncObservable(transactions$, {
  persist: { name: "transactions", plugin: idbPlugin },
})

export function addTransaction(data: Omit<Transaction, "id" | "createdAt">): string {
  const id = generateId()
  transactions$[id].set({ id, createdAt: new Date().toISOString(), ...data })
  return id
}

export function deleteTransaction(id: string): void {
  transactions$[id].delete()
}

// Called when a label is deleted — removes the labelId from every transaction that has it.
export function removeLabelFromAllTransactions(labelId: string): void {
  batch(() => {
    Object.values(transactions$.peek()).forEach((tx) => {
      if (tx.labelIds.includes(labelId)) {
        transactions$[tx.id].labelIds.set(tx.labelIds.filter((id) => id !== labelId))
      }
    })
  })
}
```

- [ ] **Step 3: Create labels store**

Create `app/store/labels.ts`:

```ts
import { observable, batch } from "@legendapp/state"
import { syncObservable } from "@legendapp/state/sync"
import { idbPlugin } from "./idb"
import { generateId } from "~/lib/ids"
import { removeLabelFromAllTransactions } from "./transactions"
import type { Label } from "~/types"

export const labels$ = observable<Record<string, Label>>({})

syncObservable(labels$, {
  persist: { name: "labels", plugin: idbPlugin },
})

export function addLabel(data: Pick<Label, "name" | "color">): string {
  const id = generateId()
  labels$[id].set({ id, name: data.name, color: data.color, createdAt: new Date().toISOString() })
  return id
}

export function updateLabel(id: string, patch: Partial<Pick<Label, "name" | "color">>): void {
  labels$[id].assign(patch)
}

export function deleteLabel(id: string): void {
  removeLabelFromAllTransactions(id)
  labels$[id].delete()
}

export function bulkDeleteLabels(ids: string[]): void {
  batch(() => {
    ids.forEach((id) => {
      removeLabelFromAllTransactions(id)
      labels$[id].delete()
    })
  })
}
```

- [ ] **Step 4: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add app/store/
git commit -m "feat: add labels and transactions stores with IndexedDB persistence"
```

---

## Task 4: App shell

**Files:**
- Create: `app/components/primitives/app-sidebar.tsx`
- Create: `app/pages/authenticated/layout.tsx`
- Create: `app/pages/authenticated/dashboard.tsx`
- Modify: `app/routes.ts`
- Modify: `app/root.tsx`

- [ ] **Step 1: Remove Inter font from root.tsx**

Read `app/root.tsx`. Remove the `links` export entirely (it only loads Inter from Google Fonts, which we don't use — Geist is loaded via CSS). The file should become:

```tsx
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router"

import type { Route } from "./+types/root"
import "./app.css"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{message}</h1>
      <p className="mt-2 text-muted-foreground">{details}</p>
      {stack && (
        <pre className="mt-4 w-full overflow-x-auto rounded border p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Create app sidebar**

Create `app/components/primitives/app-sidebar.tsx`:

```tsx
import { NavLink } from "react-router"
import { LayoutDashboard, Tag } from "lucide-react"
import { cn } from "~/lib/utils"

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/labels", label: "Labels", icon: Tag },
] as const

export default function AppSidebar() {
  return (
    <aside className="flex h-screen w-52 shrink-0 flex-col border-r bg-background px-2 py-3">
      <div className="mb-4 px-3 py-1">
        <span className="text-sm font-semibold tracking-tight">Savyy</span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 3: Create authenticated layout**

Create `app/pages/authenticated/layout.tsx`:

```tsx
import { Outlet } from "react-router"
import AppSidebar from "~/components/primitives/app-sidebar"

export default function AuthenticatedLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Create dashboard placeholder**

Create `app/pages/authenticated/dashboard.tsx`:

```tsx
export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 5: Update routes**

Replace `app/routes.ts` entirely:

```ts
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes"

export default [
  layout("pages/authenticated/layout.tsx", [
    index("pages/authenticated/dashboard.tsx"),
    route("labels", "pages/authenticated/labels.tsx"),
  ]),
] satisfies RouteConfig
```

Note: `pages/authenticated/labels.tsx` doesn't exist yet — the dev server will show an error for that route until Task 5 creates it. The dashboard route (`/`) will work immediately.

- [ ] **Step 6: Verify dev server**

```bash
npm run dev
```

Open http://localhost:5173. Expected: sidebar visible with "Savyy", Dashboard and Labels links. Dashboard shows "Coming soon." Clicking Labels shows an error (route file missing — expected).

- [ ] **Step 7: Commit**

```bash
git add app/root.tsx app/components/primitives/app-sidebar.tsx app/pages/ app/routes.ts
git commit -m "feat: add app shell with sidebar and authenticated layout"
```

---

## Task 5: Labels page skeleton

**Files:**
- Create: `app/pages/authenticated/labels.tsx`

- [ ] **Step 1: Create labels page with loading guard**

Create `app/pages/authenticated/labels.tsx`:

```tsx
import { useState } from "react"
import { useValue } from "@legendapp/state/react"
import { syncState } from "@legendapp/state/sync"
import { Search } from "lucide-react"
import { labels$ } from "~/store/labels"
import { Button } from "~/components/ui/button"

export default function LabelsPage() {
  const [filter, setFilter] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const isLoaded = useValue(syncState(labels$).isLoaded)
  const labelsRecord = useValue(labels$)
  const labelsCount = Object.keys(labelsRecord).length
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Labels</h1>
        <Button size="sm" onClick={() => setIsAddingNew(true)}>
          New label
        </Button>
      </div>

      <div className="relative w-64">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 w-full rounded-md border bg-transparent pl-8 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      {labelsCount === 0 && !isAddingNew ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-sm">
          <p className="font-medium text-foreground">No labels yet</p>
          <p className="text-muted-foreground">
            Create your first label to start organizing your transactions.
          </p>
          <Button size="sm" onClick={() => setIsAddingNew(true)}>
            New label
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Table coming in next task.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Navigate to http://localhost:5173/labels. Expected: "Labels" heading, filter input, "New label" button, and empty state message (or placeholder text).

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add app/pages/authenticated/labels.tsx
git commit -m "feat: add labels page skeleton with loading guard and empty state"
```

---

## Task 6: Labels table — columns, sorting, derived stats

**Files:**
- Create: `app/components/labels/labels-table.tsx`
- Modify: `app/pages/authenticated/labels.tsx`

- [ ] **Step 1: Create labels table**

Create `app/components/labels/labels-table.tsx`:

```tsx
import { useMemo, useState, useRef } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { useValue } from "@legendapp/state/react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { labels$, addLabel, updateLabel, deleteLabel } from "~/store/labels"
import { transactions$ } from "~/store/transactions"
import { cn } from "~/lib/utils"
import type { Label } from "~/types"

const columnHelper = createColumnHelper<Label>()

interface LabelStats {
  count: number
  lastApplied: string | null
}

export interface LabelsTableProps {
  filter: string
  onClearFilter: () => void
  isAddingNew: boolean
  onNewLabelDone: () => void
  rowSelection: RowSelectionState
  onRowSelectionChange: (selection: RowSelectionState) => void
}

export default function LabelsTable({
  filter,
  onClearFilter,
  isAddingNew,
  onNewLabelDone,
  rowSelection,
  onRowSelectionChange,
}: LabelsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#818cf8")
  const lastSelectedIndexRef = useRef<number | null>(null)

  const labelsRecord = useValue(labels$)
  const transactionsRecord = useValue(transactions$)

  const labelStats = useMemo<Record<string, LabelStats>>(() => {
    const stats: Record<string, LabelStats> = {}
    Object.values(transactionsRecord).forEach((tx) => {
      tx.labelIds.forEach((labelId) => {
        if (!stats[labelId]) stats[labelId] = { count: 0, lastApplied: null }
        stats[labelId].count++
        if (!stats[labelId].lastApplied || tx.date > stats[labelId].lastApplied!) {
          stats[labelId].lastApplied = tx.date
        }
      })
    })
    return stats
  }, [transactionsRecord])

  const data = useMemo(() => {
    const all = Object.values(labelsRecord)
    if (!filter.trim()) return all
    const q = filter.toLowerCase()
    return all.filter((l) => l.name.toLowerCase().includes(q))
  }, [labelsRecord, filter])

  function startEditing(id: string, currentName: string) {
    setEditingId(id)
    setEditingName(currentName)
  }

  function commitEdit() {
    if (editingId && editingName.trim()) {
      updateLabel(editingId, { name: editingName.trim() })
    }
    setEditingId(null)
    setEditingName("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName("")
  }

  function commitNewLabel() {
    if (newName.trim()) {
      addLabel({ name: newName.trim(), color: newColor })
    }
    setNewName("")
    setNewColor("#818cf8")
    onNewLabelDone()
  }

  function cancelNewLabel() {
    setNewName("")
    setNewColor("#818cf8")
    onNewLabelDone()
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: "",
        cell: () => null, // placeholder — replaced in Task 11
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => {
          const label = info.row.original
          const isEditing = editingId === label.id
          return (
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {isEditing ? (
                <input
                  autoFocus
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); commitEdit() }
                    if (e.key === "Escape") { e.preventDefault(); cancelEdit() }
                  }}
                  className="h-6 w-40 rounded border bg-background px-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="cursor-text rounded px-1 hover:bg-accent/60"
                  onClick={(e) => { e.stopPropagation(); startEditing(label.id, label.name) }}
                >
                  {label.name}
                </span>
              )}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "transactions",
        header: "Transactions",
        cell: (info) => (
          <span className="text-muted-foreground tabular-nums">
            {labelStats[info.row.original.id]?.count ?? 0}
          </span>
        ),
      }),
      columnHelper.display({
        id: "lastApplied",
        header: "Last applied",
        cell: (info) => {
          const last = labelStats[info.row.original.id]?.lastApplied
          if (!last) return <span className="text-muted-foreground">—</span>
          return (
            <span className="text-muted-foreground">
              {format(new Date(last), "MMM yyyy")}
            </span>
          )
        },
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: "Created",
        cell: (info) => (
          <span className="text-muted-foreground">
            {format(new Date(info.getValue()), "MMM yyyy")}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: () => null, // placeholder — replaced in Task 10
      }),
    ],
    [editingId, editingName, labelStats]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  })

  const sortableColumns = new Set(["name", "createdAt"])

  if (data.length === 0 && filter.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-sm text-muted-foreground">
        <p>No labels match &ldquo;{filter}&rdquo;</p>
        <button className="underline underline-offset-2 hover:text-foreground" onClick={onClearFilter}>
          Clear filter
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b">
              {hg.headers.map((header) => {
                const canSort = sortableColumns.has(header.id)
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "h-9 px-3 text-left text-xs font-medium text-muted-foreground select-none",
                      canSort && "cursor-pointer hover:text-foreground",
                      (header.id === "select" || header.id === "actions") && "w-10"
                    )}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    title={canSort ? `Order by ${header.column.columnDef.header as string}` : undefined}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        sorted === "asc" ? <ArrowUp size={12} /> :
                        sorted === "desc" ? <ArrowDown size={12} /> :
                        <ArrowUpDown size={12} className="opacity-30" />
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {isAddingNew && (
            <tr className="border-b bg-accent/20">
              <td className="h-11 px-3 w-10" />
              <td className="h-11 px-3" colSpan={4}>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: newColor }}
                  />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Label name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={commitNewLabel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); commitNewLabel() }
                      if (e.key === "Escape") { e.preventDefault(); cancelNewLabel() }
                    }}
                    className="h-6 w-48 rounded border bg-background px-1.5 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
              </td>
              <td className="h-11 px-3 w-10" />
            </tr>
          )}
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                "group border-b transition-colors hover:bg-accent/40 cursor-pointer",
                row.getIsSelected() && "bg-accent/60"
              )}
              onClick={(e) => {
                const rowIndex = table.getRowModel().rows.indexOf(row)
                if (e.shiftKey && lastSelectedIndexRef.current !== null) {
                  const from = Math.min(lastSelectedIndexRef.current, rowIndex)
                  const to = Math.max(lastSelectedIndexRef.current, rowIndex)
                  const updated = { ...rowSelection }
                  table.getRowModel().rows.slice(from, to + 1).forEach((r) => {
                    updated[r.id] = true
                  })
                  onRowSelectionChange(updated)
                } else {
                  row.toggleSelected()
                  lastSelectedIndexRef.current = rowIndex
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    "h-11 px-3",
                    cell.column.id === "transactions" && "text-right",
                    (cell.column.id === "select" || cell.column.id === "actions") && "w-10"
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Wire table into labels page**

Replace `app/pages/authenticated/labels.tsx` entirely:

```tsx
import { useState } from "react"
import { useValue } from "@legendapp/state/react"
import { syncState } from "@legendapp/state/sync"
import { Search } from "lucide-react"
import { labels$, bulkDeleteLabels } from "~/store/labels"
import LabelsTable from "~/components/labels/labels-table"
import { Button } from "~/components/ui/button"
import SelectionActionBar from "~/components/primitives/selection-action-bar"
import type { RowSelectionState } from "@tanstack/react-table"

export default function LabelsPage() {
  const [filter, setFilter] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const isLoaded = useValue(syncState(labels$).isLoaded)
  const labelsRecord = useValue(labels$)
  const labelsCount = Object.keys(labelsRecord).length
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return
    const confirmed = confirm(
      `Delete ${selectedIds.length} label${selectedIds.length === 1 ? "" : "s"}? This will remove them from all transactions.`
    )
    if (!confirmed) return
    bulkDeleteLabels(selectedIds)
    setRowSelection({})
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Labels</h1>
        <Button size="sm" onClick={() => setIsAddingNew(true)}>
          New label
        </Button>
      </div>

      <div className="relative w-64">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 w-full rounded-md border bg-transparent pl-8 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      {labelsCount === 0 && !isAddingNew ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-sm">
          <p className="font-medium text-foreground">No labels yet</p>
          <p className="text-muted-foreground">
            Create your first label to start organizing your transactions.
          </p>
          <Button size="sm" onClick={() => setIsAddingNew(true)}>
            New label
          </Button>
        </div>
      ) : (
        <LabelsTable
          filter={filter}
          onClearFilter={() => setFilter("")}
          isAddingNew={isAddingNew}
          onNewLabelDone={() => setIsAddingNew(false)}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      )}

      <SelectionActionBar
        count={selectedIds.length}
        onClear={() => setRowSelection({})}
        onActions={handleBulkDelete}
      />
    </div>
  )
}
```

Note: `SelectionActionBar` doesn't exist yet — TypeScript will error until Task 8 creates it. To unblock this task, create a temporary stub:

```tsx
// app/components/primitives/selection-action-bar.tsx (temporary stub)
export default function SelectionActionBar(_props: { count: number; onClear: () => void; onActions: () => void }) {
  return null
}
```

- [ ] **Step 3: Verify table renders**

```bash
npm run dev
```

Navigate to http://localhost:5173/labels. Expected: table header with Name/Transactions/Last applied/Created columns. Empty state if no labels. Clicking "New label" shows inline row at top. Sorting by Name header toggles asc/desc arrow.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add app/components/labels/labels-table.tsx app/pages/authenticated/labels.tsx app/components/primitives/selection-action-bar.tsx
git commit -m "feat: add labels table with columns, sorting, filtering, and inline row creation"
```

---

## Task 7: Color picker

**Files:**
- Create: `app/components/labels/label-color-picker.tsx`
- Modify: `app/components/labels/labels-table.tsx`

- [ ] **Step 1: Create color picker**

Create `app/components/labels/label-color-picker.tsx`:

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { cn } from "~/lib/utils"

export const LABEL_COLORS = [
  "#94a3b8", // slate
  "#64748b", // slate-dark
  "#818cf8", // indigo
  "#22d3ee", // cyan
  "#34d399", // emerald
  "#facc15", // yellow
  "#fb923c", // orange
  "#f9a8d4", // pink
  "#f87171", // red
  "#a78bfa", // violet
] as const

interface LabelColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export default function LabelColorPicker({ color, onChange }: LabelColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="size-2.5 shrink-0 rounded-full ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ backgroundColor: color }}
          aria-label="Change label color"
          onClick={(e) => e.stopPropagation()}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex items-center gap-1.5">
          {LABEL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "size-6 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                color === c && "ring-2 ring-ring ring-offset-1"
              )}
              style={{ backgroundColor: c }}
              onClick={() => onChange(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 2: Replace static color dot in LabelsTable name cell with LabelColorPicker**

Edit `app/components/labels/labels-table.tsx`.

Add imports at top:
```tsx
import LabelColorPicker, { LABEL_COLORS } from "./label-color-picker"
```

Change `newColor` initial value to use the constant:
```tsx
const [newColor, setNewColor] = useState(LABEL_COLORS[2]) // indigo
```

Replace the `name` column cell renderer's static `<span>` dot:
```tsx
// BEFORE:
<span
  className="size-2.5 shrink-0 rounded-full"
  style={{ backgroundColor: label.color }}
/>

// AFTER:
<LabelColorPicker
  color={label.color}
  onChange={(color) => updateLabel(label.id, { color })}
/>
```

Also replace the static dot in the `isAddingNew` row:
```tsx
// BEFORE:
<span
  className="size-2.5 shrink-0 rounded-full"
  style={{ backgroundColor: newColor }}
/>

// AFTER:
<LabelColorPicker color={newColor} onChange={setNewColor} />
```

- [ ] **Step 3: Verify color picker**

```bash
npm run dev
```

Create a label. Expected: colored dot appears. Clicking dot opens popover with 10 color swatches. Clicking a swatch immediately changes the dot color. The label's color updates in the store instantly.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add app/components/labels/label-color-picker.tsx app/components/labels/labels-table.tsx
git commit -m "feat: add color picker popover to labels table"
```

---

## Task 8: Selection action bar

**Files:**
- Modify: `app/components/primitives/selection-action-bar.tsx` (replace stub)

- [ ] **Step 1: Implement selection action bar**

Replace `app/components/primitives/selection-action-bar.tsx`:

```tsx
import { X, Command } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

interface SelectionActionBarProps {
  count: number
  onClear: () => void
  onActions: () => void
}

export default function SelectionActionBar({ count, onClear, onActions }: SelectionActionBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 shadow-lg transition-all duration-200",
        count > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
    >
      <span className="text-sm font-medium">{count} selected</span>
      <button
        type="button"
        onClick={onClear}
        className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
        aria-label="Clear selection"
      >
        <X size={14} />
      </button>
      <div className="mx-1 h-4 w-px bg-border" />
      <Button size="sm" variant="outline" onClick={onActions} className="gap-1.5 h-7 text-xs">
        <Command size={12} />
        Actions
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify selection bar**

```bash
npm run dev
```

Click a label row. Expected: selection bar slides up from bottom with "1 selected" + X + Actions. Click X — bar disappears. Select multiple rows — count updates. Click Actions — triggers bulk delete confirmation.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add app/components/primitives/selection-action-bar.tsx
git commit -m "feat: implement selection action bar with animated show/hide"
```

---

## Task 9: Row checkbox column

**Files:**
- Modify: `app/components/labels/labels-table.tsx`

- [ ] **Step 1: Replace select column placeholder with real checkboxes**

Edit `app/components/labels/labels-table.tsx`.

Add import:
```tsx
import { Checkbox } from "~/components/ui/checkbox"
```

Replace the `select` column definition:
```tsx
// BEFORE:
columnHelper.display({
  id: "select",
  header: "",
  cell: () => null,
}),

// AFTER:
columnHelper.display({
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : false
      }
      onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(val) => row.toggleSelected(!!val)}
      onClick={(e) => e.stopPropagation()}
      aria-label="Select row"
      className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=checked]:opacity-100"
    />
  ),
}),
```

- [ ] **Step 2: Verify checkboxes**

```bash
npm run dev
```

Hover a row. Expected: checkbox fades in. Clicking checkbox selects the row (highlighted background). Header checkbox selects all. Shift+clicking rows selects a range.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add app/components/labels/labels-table.tsx
git commit -m "feat: add row selection checkboxes with select-all and shift-click range"
```

---

## Task 10: Row context menu

**Files:**
- Create: `app/components/labels/label-row-actions.tsx`
- Modify: `app/components/labels/labels-table.tsx`

- [ ] **Step 1: Create row actions component**

Create `app/components/labels/label-row-actions.tsx`:

```tsx
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface LabelRowActionsProps {
  onEditName: () => void
  onDelete: () => void
}

export default function LabelRowActions({ onEditName, onDelete }: LabelRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex size-7 items-center justify-center rounded opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Row actions"
        >
          <MoreHorizontal size={15} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onEditName() }}
        >
          <Pencil size={14} className="mr-2 shrink-0" />
          Edit label name
          <span className="ml-auto text-xs text-muted-foreground">E</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 size={14} className="mr-2 shrink-0" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Replace actions column placeholder in LabelsTable**

Edit `app/components/labels/labels-table.tsx`.

Add import:
```tsx
import LabelRowActions from "./label-row-actions"
```

Replace the `actions` column:
```tsx
// BEFORE:
columnHelper.display({
  id: "actions",
  header: "",
  cell: () => null,
}),

// AFTER:
columnHelper.display({
  id: "actions",
  header: "",
  cell: (info) => {
    const label = info.row.original
    const count = labelStats[label.id]?.count ?? 0
    return (
      <LabelRowActions
        onEditName={() => startEditing(label.id, label.name)}
        onDelete={() => {
          const message = count > 0
            ? `Delete "${label.name}"? It will be removed from ${count} transaction${count === 1 ? "" : "s"}.`
            : `Delete "${label.name}"?`
          if (!confirm(message)) return
          deleteLabel(label.id)
        }}
      />
    )
  },
}),
```

- [ ] **Step 3: Verify context menu**

```bash
npm run dev
```

Hover a label row. Expected: `...` button fades in on the right. Clicking it opens dropdown. "Edit label name" focuses the inline name input. "Delete" shows confirmation and removes the label.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add app/components/labels/label-row-actions.tsx app/components/labels/labels-table.tsx
git commit -m "feat: add row context menu with edit name and delete actions"
```

---

## Task 11: Keyboard navigation and shortcuts

**Files:**
- Create: `app/lib/use-keyboard-shortcut.ts`
- Modify: `app/components/labels/labels-table.tsx`
- Modify: `app/pages/authenticated/labels.tsx`

- [ ] **Step 1: Create useKeyboardShortcut hook**

Create `app/lib/use-keyboard-shortcut.ts`:

```ts
import { useEffect, useRef } from "react"

// key format examples: "Escape", "n", "cmd+k", "cmd+n"
export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options?: { enabled?: boolean }
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (options?.enabled === false) return

    function onKeyDown(e: KeyboardEvent) {
      // Don't fire when the user is typing in a text field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return

      const parts = key.toLowerCase().split("+")
      const mainKey = parts.at(-1)!
      const needsMeta = parts.includes("cmd")

      if (needsMeta && !e.metaKey) return
      if (!needsMeta && e.metaKey) return
      if (e.key.toLowerCase() !== mainKey) return

      e.preventDefault()
      handlerRef.current()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [key, options?.enabled])
}
```

- [ ] **Step 2: Add keyboard navigation to LabelsTable**

Edit `app/components/labels/labels-table.tsx`.

Add `focusedId` state and a ref for the table body:
```tsx
const [focusedId, setFocusedId] = useState<string | null>(null)
const tbodyRef = useRef<HTMLTableSectionElement>(null)
```

Add `tabIndex` and `data-focused` to each row so we can style the focused row:
```tsx
<tr
  key={row.id}
  tabIndex={0}
  data-focused={focusedId === row.id || undefined}
  className={cn(
    "group border-b transition-colors hover:bg-accent/40 cursor-pointer outline-none",
    row.getIsSelected() && "bg-accent/60",
    focusedId === row.id && "ring-1 ring-inset ring-ring"
  )}
  onClick={...} // existing
  onFocus={() => setFocusedId(row.id)}
>
```

Add `onKeyDown` handler to the `<tbody>` element:
```tsx
<tbody
  ref={tbodyRef}
  onKeyDown={(e) => {
    const rows = table.getRowModel().rows
    const currentIndex = rows.findIndex((r) => r.id === focusedId)

    if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = rows[currentIndex + 1]
      if (next) {
        setFocusedId(next.id)
        tbodyRef.current?.querySelector<HTMLElement>(`[data-row-id="${next.id}"]`)?.focus()
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      const prev = rows[currentIndex - 1]
      if (prev) {
        setFocusedId(prev.id)
        tbodyRef.current?.querySelector<HTMLElement>(`[data-row-id="${prev.id}"]`)?.focus()
      }
    }

    if (e.key === " " && focusedId) {
      e.preventDefault()
      const row = rows[currentIndex]
      if (row) row.toggleSelected()
    }

    if (e.key === "Enter" && focusedId) {
      e.preventDefault()
      const row = rows[currentIndex]
      if (row) startEditing(row.id, row.original.name)
    }

    if (e.key === "Escape") {
      if (editingId) { cancelEdit(); return }
      setFocusedId(null)
    }
  }}
>
```

Add `data-row-id` attribute to each `<tr>` so the focus query works:
```tsx
<tr
  key={row.id}
  data-row-id={row.id}
  tabIndex={0}
  ...
>
```

- [ ] **Step 3: Add page-level keyboard shortcuts**

Edit `app/pages/authenticated/labels.tsx`.

Add import:
```tsx
import { useKeyboardShortcut } from "~/lib/use-keyboard-shortcut"
```

After the `handleBulkDelete` function, add shortcuts:
```tsx
// Press N to create new label (only when not in an input)
useKeyboardShortcut("n", () => setIsAddingNew(true))

// Escape to clear selection
useKeyboardShortcut("Escape", () => setRowSelection({}), {
  enabled: selectedIds.length > 0,
})
```

- [ ] **Step 4: Verify keyboard navigation**

```bash
npm run dev
```

Tab into the table. Press ↓/↑ to move between rows. Expected: focused row has a subtle ring outline. Press Space — toggles row selection. Press Enter — focuses the inline name input on that row. Press Escape — cancels edit or clears selection. Press N (with no input focused) — opens new label row.

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add app/lib/use-keyboard-shortcut.ts app/components/labels/labels-table.tsx app/pages/authenticated/labels.tsx
git commit -m "feat: add keyboard navigation, row focus, and N/Escape shortcuts to labels page"
```

---

## Self-review

### Spec coverage check

| Spec requirement | Covered in task |
|---|---|
| Label store (Legend State + IndexedDB) | Task 3 |
| `addLabel`, `updateLabel`, `deleteLabel`, `bulkDeleteLabels` | Task 3 |
| Remove label from transactions on delete | Task 3 |
| App shell (prerequisite) | Task 4 |
| Labels route at `/labels` | Task 4 |
| Table columns: Name (color dot + text), Transactions, Last applied, Created | Task 6 |
| Derived stats (transaction count, last applied) from `transactions$` | Task 6 |
| Column sorting asc/desc with tooltip | Task 6 |
| Filter by name (client-side, case-insensitive) | Task 6 |
| Filter empty state with "Clear filter" | Task 6 |
| No-labels empty state with CTA | Task 5 + Task 6 |
| Color picker (preset swatches popover) | Task 7 |
| Color picker on new label row | Task 7 |
| Inline name editing (click → input → Enter/blur saves, Escape cancels) | Task 6 |
| New label inline row at top (Enter/Escape) | Task 6 |
| `...` context menu per row (hover reveal) | Task 10 |
| Context menu: Edit label name | Task 10 |
| Context menu: Delete with confirmation if has transactions | Task 10 |
| Row checkboxes (hidden until hover, always visible when selected) | Task 9 |
| Shift+click range selection | Task 6 |
| Selected row highlighted background | Task 6 |
| Selection action bar (floating, count + clear + Actions) | Task 8 |
| Actions = bulk delete with confirmation | Task 6 (labels page) |
| Escape to clear selection | Task 11 |
| ↑/↓ keyboard row navigation | Task 11 |
| Space to toggle selection | Task 11 |
| Enter to start editing | Task 11 |
| N shortcut to open new label | Task 11 |
| `isPersistLoaded` guard | Task 5 |

All spec requirements covered. ✓

### Placeholder scan

No TBD / TODO / "similar to" / missing implementations found.

### Type consistency

- `Label` interface defined in Task 2, used consistently in Tasks 3, 6, 7, 8, 10.
- `LabelsTableProps` defined in Task 6, extended in Tasks 7, 9, 11 — all additive, no renames.
- `RowSelectionState` from `@tanstack/react-table` — used in Task 6 (table), Task 6 (page), Task 8 (bar). Consistent.
- `addLabel`, `updateLabel`, `deleteLabel`, `bulkDeleteLabels` — defined in Task 3, imported in Tasks 6 and 10. Consistent.
- `removeLabelFromAllTransactions` — defined in Task 3 (transactions store), called in Task 3 (labels store). Consistent.
- `LABEL_COLORS` — exported from `label-color-picker.tsx` in Task 7, imported in `labels-table.tsx` in Task 7. Consistent.
- `useKeyboardShortcut` — defined in Task 11, used in Task 11. Consistent.
