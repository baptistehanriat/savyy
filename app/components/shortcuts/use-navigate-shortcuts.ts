import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"

const CHORD_TIMEOUT_MS = 1000

const routes: Record<string, string> = {
  t: "/transactions",
  l: "/labels",
}

function isTypingInInput(): boolean {
  return (
    document.activeElement instanceof HTMLInputElement ||
    document.activeElement instanceof HTMLTextAreaElement ||
    (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable)
  )
}

export function useNavigateShortcuts() {
  const navigate = useNavigate()
  const waitingForSecondKey = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function clearChord() {
      waitingForSecondKey.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingInInput()) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (waitingForSecondKey.current) {
        const route = routes[event.key.toLowerCase()]
        if (route) {
          event.preventDefault()
          navigate(route)
        }
        clearChord()
        return
      }

      if (event.key.toLowerCase() === "g") {
        event.preventDefault()
        waitingForSecondKey.current = true
        timeoutRef.current = setTimeout(clearChord, CHORD_TIMEOUT_MS)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      clearChord()
    }
  }, [navigate])
}
