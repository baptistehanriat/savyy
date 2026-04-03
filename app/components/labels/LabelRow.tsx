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

  const handleTabFromName = useCallback(() => {
    colorButtonRef.current?.focus()
  }, [])

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
