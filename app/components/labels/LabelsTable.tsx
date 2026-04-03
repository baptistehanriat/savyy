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
import { labelsStore, addLabel, updateLabel } from "~/store/labels"
import { Button } from "~/components/ui/button"
import { LabelRow } from "./LabelRow"
import type { Label } from "~/store/labels"

const columnHelper = createColumnHelper<Label>()

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

export function LabelsTable() {
  const labels = useValue(labelsStore.items)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

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
                  updateLabel(row.original.id, { name, color })
                  setEditingRowId(null)
                }}
                onEditCancel={() => setEditingRowId(null)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
