import { useKeyboardShortcut } from "~/lib/use-keyboard-shortcut"
import type { RowSelectionState } from "@tanstack/react-table"

interface UseLabelsKeyboardProps {
  rowCount: number
  focusedRowIndex: number | null
  setFocusedRowIndex: (index: number | null) => void
  editingRowId: string | null
  rowIds: string[]
  rowSelection: RowSelectionState
  setRowSelection: (selection: RowSelectionState) => void
  onEditStart: (rowId: string) => void
  isCommandPaletteOpen: boolean
  setIsCommandPaletteOpen: (open: boolean) => void
}

function isTypingInInput(): boolean {
  return document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement
}

export function useLabelsTableShortcut({
  rowCount,
  focusedRowIndex,
  setFocusedRowIndex,
  editingRowId,
  rowIds,
  rowSelection,
  setRowSelection,
  onEditStart,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
}: UseLabelsKeyboardProps) {
  const isEditing = editingRowId !== null

  useKeyboardShortcut("ArrowUp", event => {
    if (isEditing || isTypingInInput()) return
    event.preventDefault()
    setFocusedRowIndex(focusedRowIndex === null ? 0 : Math.max(0, focusedRowIndex - 1))
  })

  useKeyboardShortcut("ArrowDown", event => {
    if (isEditing || isTypingInInput()) return
    event.preventDefault()
    setFocusedRowIndex(focusedRowIndex === null ? 0 : Math.min(rowCount - 1, focusedRowIndex + 1))
  })

  useKeyboardShortcut("shift+ArrowUp", event => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const newIndex = Math.max(0, focusedRowIndex - 1)
    const rowId = rowIds[newIndex]
    if (rowId) setRowSelection({ ...rowSelection, [rowId]: true })
    setFocusedRowIndex(newIndex)
  })

  useKeyboardShortcut("shift+ArrowDown", event => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const newIndex = Math.min(rowCount - 1, focusedRowIndex + 1)
    const rowId = rowIds[newIndex]
    if (rowId) setRowSelection({ ...rowSelection, [rowId]: true })
    setFocusedRowIndex(newIndex)
  })

  useKeyboardShortcut("x", event => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const rowId = rowIds[focusedRowIndex]
    if (!rowId) return
    const isSelected = Boolean(rowSelection[rowId])
    const nextSelection = { ...rowSelection }
    if (isSelected) {
      delete nextSelection[rowId]
    } else {
      nextSelection[rowId] = true
    }
    setRowSelection(nextSelection)
  })

  useKeyboardShortcut("Meta+a", event => {
    if (isEditing) return
    event.preventDefault()
    setRowSelection(Object.fromEntries(rowIds.map(id => [id, true])))
  })

  useKeyboardShortcut("e", event => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const rowId = rowIds[focusedRowIndex]
    if (rowId) onEditStart(rowId)
  })

  useKeyboardShortcut("Enter", event => {
    if (isEditing || isTypingInInput() || focusedRowIndex === null) return
    event.preventDefault()
    const rowId = rowIds[focusedRowIndex]
    if (rowId) onEditStart(rowId)
  })

  useKeyboardShortcut("Escape", () => {
    if (isEditing) return
    if (Object.keys(rowSelection).length > 0) {
      setRowSelection({})
      return
    }
    setFocusedRowIndex(null)
  })

  useKeyboardShortcut("Meta+k", event => {
    if (Object.keys(rowSelection).length === 0) return
    event.preventDefault()
    setIsCommandPaletteOpen(!isCommandPaletteOpen)
  })
}
