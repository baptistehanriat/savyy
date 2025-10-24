import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Search, Trash2 } from "lucide-react"
import * as React from "react"
import { Button } from "~/components/primitives/button"
import { Checkbox } from "~/components/primitives/checkbox"
import { Input } from "~/components/primitives/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/primitives/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/primitives/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/primitives/tooltip"
import type { Label } from "../data-type"
import { PageHeader } from "../page-header"
import { initialLabels } from "./dummy-labels"
import { cn } from "~/lib/utils"

function EditableCell({
  value,
  onSave,
  placeholder,
  showPlaceholderOnHover,
  isHovered,
}: {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  showPlaceholderOnHover?: boolean
  isHovered?: boolean
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue !== value) {
      onSave(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent outline-none border-none focus:ring-0 p-0"
      />
    )
  }

  const showPlaceholder = showPlaceholderOnHover && !value && isHovered

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-text w-full">
      {value ||
        (showPlaceholder ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : null)}
    </div>
  )
}

export function LabelsTable() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [labels, setLabels] = React.useState<Label[]>(initialLabels)
  const [rowSelection, setRowSelection] = React.useState({})
  const [hoveredRowId, setHoveredRowId] = React.useState<string | null>(null)
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(-1)
  const tableRef = React.useRef<HTMLTableElement>(null)

  const updateLabel = (id: string, field: keyof Label, value: string) => {
    setLabels(prev =>
      prev.map(label =>
        label.id === id ? { ...label, [field]: value } : label
      )
    )
  }

  const columns: ColumnDef<Label>[] = [
    {
      id: "select",
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const label = row.original
        return (
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`h-3 w-3 rounded-full ${label.color} cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-gray-300`}
                />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="text-sm">TODO: Color picker</div>
              </PopoverContent>
            </Popover>
            <EditableCell
              value={label.name}
              onSave={value => updateLabel(label.id, "name", value)}
            />
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const label = row.original
        const isHovered = hoveredRowId === label.id
        return (
          <div className="text-muted-foreground">
            <EditableCell
              value={label.description || ""}
              onSave={value => updateLabel(label.id, "description", value)}
              placeholder="Add label description..."
              showPlaceholderOnHover
              isHovered={isHovered}
            />
          </div>
        )
      },
      size: 400,
    },
    {
      accessorKey: "numberOfTransactions",
      header: "Transactions",
      cell: ({ row }) => (
        <div className="text-foreground">
          {row.original.numberOfTransactions}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "lastApplied",
      header: "Last applied",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.lastApplied}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "created",
      header: "Created",
      cell: ({ row }) => {
        const isHovered = hoveredRowId === row.original.id
        return (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {row.original.created}
            </span>
            {isHovered && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        console.log("[v0] Delete row:", row.original.id)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete label</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )
      },
      size: 120,
    },
  ]

  const table = useReactTable({
    data: labels,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: setSearchQuery,
    globalFilterFn: (row, columnId, filterValue) => {
      const name = row.original.name.toLowerCase()
      return name.includes(filterValue.toLowerCase())
    },
  })

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const rows = table.getRowModel().rows
      if (rows.length === 0) return

      const activeElement = document.activeElement
      const isEditing =
        activeElement?.tagName === "INPUT" &&
        !activeElement.classList.contains("search-input")
      if (isEditing) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setFocusedRowIndex(prev => {
          const next = prev < rows.length - 1 ? prev + 1 : prev
          return next
        })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setFocusedRowIndex(prev => {
          const next = prev > 0 ? prev - 1 : prev
          return next
        })
      } else if (e.key === " " && focusedRowIndex >= 0) {
        e.preventDefault()
        const row = rows[focusedRowIndex]
        row.toggleSelected()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [table, focusedRowIndex])

  React.useEffect(() => {
    if (focusedRowIndex >= 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll("tbody tr")
      const focusedRow = rows[focusedRowIndex] as HTMLElement
      if (focusedRow) {
        focusedRow.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    }
  }, [focusedRowIndex])

  return (
    <div className="w-full">
      <PageHeader>
        <h1 className="text-2xl font-normal font-mono mb-2">Labels</h1>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 search-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline">New group</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              New label
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="border-y">
        <Table ref={tableRef}>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onMouseEnter={() => setHoveredRowId(row.original.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  onClick={() => setFocusedRowIndex(index)}
                  tabIndex={0}
                  className={cn(
                    "h-14",
                    focusedRowIndex === index
                      ? "ring-2 ring-inset ring-blue-500"
                      : ""
                  )}
                  aria-selected={focusedRowIndex === index}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
