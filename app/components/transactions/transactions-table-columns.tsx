import { type ColumnDef } from "@tanstack/react-table"
import { useValue } from "@legendapp/state/react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { LabelChip } from "~/components/labels/label-chip"
import { cn, formatAmount, formatDate } from "~/lib/utils"
import type { Label } from "~/stores/labels-store"
import { labels$ } from "~/stores/labels-store"
import type { Transaction } from "~/stores/transactions-store"

const MAX_VISIBLE_LABELS = 3

export const transactionsTableColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <button className="flex items-center gap-1 font-medium" onClick={() => column.toggleSorting()}>
        Date
        {column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
        {column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
      </button>
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground tabular-nums">{formatDate(getValue<string>())}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }) => <span className="truncate">{getValue<string | null>() ?? "—"}</span>,
  },
  {
    id: "labels",
    header: "Labels",
    cell: ({ row }) => {
      const labels = useValue(labels$)
      const transactionLabels = (row.original.labelIds ?? [])
        .map(id => labels.find(label => label.id === id))
        .filter((label): label is Label => label !== undefined)
      const visibleLabels = transactionLabels.slice(0, MAX_VISIBLE_LABELS)
      const hiddenLabelCount = transactionLabels.length - visibleLabels.length

      return (
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {visibleLabels.map(label => (
            <LabelChip key={label.id} label={label} />
          ))}
          {hiddenLabelCount > 0 && <span className="text-xs text-muted-foreground">+{hiddenLabelCount}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="flex justify-end">
        <button className="flex items-center gap-1 font-medium" onClick={() => column.toggleSorting()}>
          Amount
          {column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
        </button>
      </div>
    ),
    cell: ({ getValue }) => {
      const amount = getValue<number>()
      const isIncome = amount > 0
      return (
        <span
          className={cn(
            "block text-right font-medium tabular-nums",
            isIncome ? "text-green-600 dark:text-green-400" : "text-foreground"
          )}
        >
          {isIncome ? "+" : "-"}
          {formatAmount(amount)}
        </span>
      )
    },
  },
]
