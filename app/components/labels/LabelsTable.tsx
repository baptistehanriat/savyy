import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { useState, useEffect, useMemo } from "react"
import { useValue } from "@legendapp/state/react"
import { ArrowUp, ArrowDown, Plus } from "lucide-react"
import { labelsStore, addLabel, updateLabel } from "~/store/labels"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { LabelRow } from "./LabelRow"
import { LabelsActionBar } from "./LabelsActionBar"
import { useLabelsKeyboard } from "~/lib/use-labels-keyboard"
import { DEFAULT_LABEL_COLOR } from "~/lib/label-colors"
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

const SENTINEL_LABEL: Label = {
  id: "new",
  name: "",
  color: DEFAULT_LABEL_COLOR,
  createdAt: new Date().toISOString(),
}

export function LabelsTable() {
  const labels = useValue(labelsStore.items)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const tableData = useMemo(
    () => (isCreating ? [SENTINEL_LABEL, ...labels] : labels),
    [isCreating, labels]
  )

  // Auto-start editing the sentinel row when isCreating becomes true
  useEffect(() => {
    if (isCreating) {
      setEditingRowId("new")
      setFocusedRowIndex(0)
    }
  }, [isCreating])

  const table = useReactTable({
    data: tableData,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  })

  const rowIds = table.getRowModel().rows.map((row) => row.id)
  const selectedIds = Object.keys(rowSelection)

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

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-muted-foreground font-normal"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 && !isCreating ? (
            <TableRow>
              <td colSpan={2} className="px-3 py-8 text-center text-muted-foreground">
                No labels yet.
              </td>
            </TableRow>
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
        </TableBody>
      </Table>

      {selectedIds.length > 0 && (
        <LabelsActionBar
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
          isCommandPaletteOpen={isCommandPaletteOpen}
          onSetCommandPaletteOpen={setIsCommandPaletteOpen}
          onClearSelection={() => setRowSelection({})}
        />
      )}
    </div>
  )
}
