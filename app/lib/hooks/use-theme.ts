import { useEffect, useState } from "react"

export type Theme = "light" | "dark"

export const useTheme = (): [
  Theme,
  React.Dispatch<React.SetStateAction<Theme>>,
] => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== "undefined" && localStorage.theme)
      return localStorage.theme as Theme

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  return [theme, setTheme]
}
