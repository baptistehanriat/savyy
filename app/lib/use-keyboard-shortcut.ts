import { useEffect } from "react"

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split("+")
  const key = parts[parts.length - 1]
  const hasCmd = parts.some((part) => part.toLowerCase() === "cmd" || part.toLowerCase() === "meta")
  const hasShift = parts.some((part) => part.toLowerCase() === "shift")
  const hasAlt = parts.some((part) => part.toLowerCase() === "alt")
  const hasCtrl = parts.some((part) => part.toLowerCase() === "ctrl")

  return (
    event.key === key &&
    event.metaKey === hasCmd &&
    event.shiftKey === hasShift &&
    event.altKey === hasAlt &&
    event.ctrlKey === hasCtrl
  )
}

export function useKeyboardShortcut(
  shortcut: string,
  callback: (event: KeyboardEvent) => void,
  options?: { enabled?: boolean }
) {
  useEffect(() => {
    if (options?.enabled === false) return

    function handleKeyDown(event: KeyboardEvent) {
      if (!matchesShortcut(event, shortcut)) return
      callback(event)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcut, callback, options?.enabled])
}
