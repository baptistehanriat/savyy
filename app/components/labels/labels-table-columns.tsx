import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Checkbox } from "~/components/ui/checkbox"
import { cn } from "~/lib/utils"
import type { Label } from "~/stores/labels-store"

export const labelsTableColumns: ColumnDef<Label>[] = [
  {
    id: "select",
    header: () => <></>,
    cell: ({ row }) => (
      <Checkbox
        className={cn("transition-opacity", !row.getIsSelected() && "opacity-0 group-hover:opacity-100")}
        checked={row.getIsSelected()}
        onCheckedChange={checked => row.toggleSelected(!!checked)}
        onClick={event => event.stopPropagation()}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button className="flex items-center gap-1 font-medium" onClick={() => column.toggleSorting()}>
        Name
        {column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
        {column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
      </button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="inline-block size-3 shrink-0 rounded-full" style={{ backgroundColor: row.original.color }} />
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <button className="flex items-center gap-1 font-medium" onClick={() => column.toggleSorting()}>
        Created
        {column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
        {column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
      </button>
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{format(new Date(getValue<string>()), "MMM d, yyyy")}</span>
    ),
  },
]
