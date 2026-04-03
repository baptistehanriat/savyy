import { useState } from "react"
import { X, Command as CommandIcon, Trash2, Tag } from "lucide-react"
import { cn } from "~/lib/utils"
import { deleteLabel } from "~/store/labels"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
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
          <CommandIcon className="size-3.5" />
          <span>Actions</span>
        </button>
      </div>

      <CommandDialog
        open={isCommandPaletteOpen}
        onOpenChange={onSetCommandPaletteOpen}
        title={`${selectedCount} label${selectedCount === 1 ? "" : "s"}`}
        description="Actions for selected labels"
      >
        <Command>
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
        </Command>
      </CommandDialog>
    </>
  )
}
