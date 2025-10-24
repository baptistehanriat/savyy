import { useEffect, useState } from "react"

type Theme = "light" | "dark"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to load from localStorage first
    if (typeof localStorage !== "undefined" && localStorage.theme)
      return localStorage.theme as Theme

    // Fallback: use system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  })

  // Whenever theme changes, apply it
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md border border-gray-300 dark:border-gray-600"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  )
}
