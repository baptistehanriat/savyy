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
          {name || <span className="italic text-muted-foreground">Unnamed</span>}
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
