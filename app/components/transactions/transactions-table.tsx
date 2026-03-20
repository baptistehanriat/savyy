import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Search, Trash2, Plus } from "lucide-react"
import * as React from "react"
import { Button } from "~/components/primitives/button"
import { Checkbox } from "~/components/primitives/checkbox"
import { Input } from "~/components/primitives/input"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/primitives/popover"
import { Badge } from "~/components/primitives/badge"
import type { Transaction, Label } from "../data-type"
import { PageHeader } from "../page-header"
import { cn } from "~/lib/utils"
import { observer } from "@legendapp/state/react"
import { store } from "~/state/store"
import { v4 as uuidv4 } from "uuid"

export const TransactionsTable = observer(function TransactionsTable() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const transactions = store.transactions.get()
    const labels = store.labels.get()
    const [rowSelection, setRowSelection] = React.useState({})
    const [hoveredRowId, setHoveredRowId] = React.useState<string | null>(null)
    const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(-1)
    const tableRef = React.useRef<HTMLTableElement>(null)

    const updateTransaction = (
        id: string,
        field: keyof Transaction,
        value: any
    ) => {
        const transaction = store.transactions.find(t => t.id.get() === id)
        if (transaction) {
            transaction[field].set(value)
        }
    }

    const addTransaction = () => {
        store.transactions.push({
            id: uuidv4(),
            name: "New Transaction",
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            labelIds: [],
            created: new Date().toISOString(),
        } as any) // Type assertion needed because 'created' is not in Transaction interface but might be useful? Wait, user didn't ask for created.
        // Actually, let's stick to the interface.
    }

    // Correct addTransaction matching the interface
    const createTransaction = () => {
        store.transactions.push({
            id: uuidv4(),
            name: "New Transaction",
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            labelIds: [],
        })
    }

    const deleteTransaction = (id: string) => {
        const index = store.transactions.get().findIndex(t => t.id === id)
        if (index !== -1) {
            store.transactions.splice(index, 1)
        }
    }

    const columns: ColumnDef<Transaction>[] = [
        {
            id: "select",
            cell: ({ row }) => {
                const showCheckbox =
                    hoveredRowId === row.original.id || row.getIsSelected()
                return (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={value => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className={cn("h-4 w-4 hidden", showCheckbox && "block")}
                    />
                )
            },
            size: 30,
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => (
                <EditableCell
                    value={row.original.date}
                    onSave={value => updateTransaction(row.original.id, "date", value)}
                    type="date"
                />
            ),
            size: 100,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <EditableCell
                    value={row.original.name}
                    onSave={value => updateTransaction(row.original.id, "name", value)}
                />
            ),
            size: 250,
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    <EditableCell
                        value={row.original.description || ""}
                        onSave={value =>
                            updateTransaction(row.original.id, "description", value)
                        }
                        placeholder="Add description..."
                        showPlaceholderOnHover
                        isHovered={hoveredRowId === row.original.id}
                    />
                </div>
            ),
            size: 300,
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <EditableCell
                    value={row.original.amount.toString()}
                    onSave={value =>
                        updateTransaction(row.original.id, "amount", parseFloat(value) || 0)
                    }
                    type="number"
                />
            ),
            size: 100,
        },
        {
            accessorKey: "labels",
            header: "Labels",
            cell: ({ row }) => {
                const transactionLabels = row.original.labelIds
                    .map(id => labels.find(l => l.id === id))
                    .filter(Boolean) as Label[]

                return (
                    <div className="flex flex-wrap gap-1 items-center">
                        {transactionLabels.map(label => (
                            <Badge
                                key={label.id}
                                variant="secondary"
                                className={cn("text-xs px-1 py-0 h-5 font-normal", label.color)}
                                style={{ backgroundColor: label.color + "20", color: label.color }} // Fallback if color is hex
                            >
                                {label.name}
                                <button
                                    className="ml-1 hover:text-destructive"
                                    onClick={() => {
                                        const newIds = row.original.labelIds.filter(
                                            id => id !== label.id
                                        )
                                        updateTransaction(row.original.id, "labelIds", newIds)
                                    }}
                                >
                                    ×
                                </button>
                            </Badge>
                        ))}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-5 w-5 rounded-full opacity-0 hover:opacity-100 transition-opacity",
                                        (hoveredRowId === row.original.id || transactionLabels.length === 0) && "opacity-50"
                                    )}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2" align="start">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground mb-2 px-1">Add Label</p>
                                    {labels.map(label => {
                                        const isSelected = row.original.labelIds.includes(label.id)
                                        if (isSelected) return null
                                        return (
                                            <div
                                                key={label.id}
                                                className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer text-sm"
                                                onClick={() => {
                                                    updateTransaction(row.original.id, "labelIds", [
                                                        ...row.original.labelIds,
                                                        label.id,
                                                    ])
                                                }}
                                            >
                                                <div className={cn("w-2 h-2 rounded-full", label.color)} />
                                                {label.name}
                                            </div>
                                        )
                                    })}
                                    {labels.length === 0 && <div className="text-xs text-muted-foreground p-1">No labels created</div>}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                )
            },
            size: 200,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const isHovered = hoveredRowId === row.original.id
                return (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 text-muted-foreground hover:text-destructive hidden",
                                isHovered && "flex"
                            )}
                            onClick={() => deleteTransaction(row.original.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
            size: 50,
        },
    ]

    const table = useReactTable({
        data: transactions,
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

    return (
        <div className="w-full">
            <PageHeader>
                <h1 className="text-2xl font-normal font-mono mb-2">Transactions</h1>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter transactions..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 search-input"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={createTransaction} className="bg-indigo-600 hover:bg-indigo-700">
                            New transaction
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <div className="border-b">
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
                                    className={cn(
                                        "h-12",
                                        focusedRowIndex === index
                                            ? "ring-2 ring-inset ring-blue-500"
                                            : ""
                                    )}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="py-1">
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
                                    No transactions.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
})

function EditableCell({
    value,
    onSave,
    placeholder,
    showPlaceholderOnHover,
    isHovered,
    type = "text",
}: {
    value: string
    onSave: (value: string) => void
    placeholder?: string
    showPlaceholderOnHover?: boolean
    isHovered?: boolean
    type?: "text" | "number" | "date"
}) {
    const [isEditing, setIsEditing] = React.useState(false)
    const [editValue, setEditValue] = React.useState(value)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setEditValue(value)
    }, [value])

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
                type={type}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full bg-background rounded-sm outline-none p-1 border focus:ring-0 h-8"
            />
        )
    }

    const showPlaceholder = showPlaceholderOnHover && !value && isHovered

    return (
        <div onClick={() => setIsEditing(true)} className="cursor-text w-full h-8 flex items-center">
            {value ||
                (showPlaceholder ? (
                    <span className="text-muted-foreground font-normal">
                        {placeholder}
                    </span>
                ) : null)}
        </div>
    )
}
