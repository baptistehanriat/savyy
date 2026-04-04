import { useState, useEffect } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

export function meta() {
  return [{ title: "Settings" }]
}

type Theme = "system" | "light" | "dark"
type Currency = "EUR" | "USD"

const THEME_KEY = "savyy-theme"
const CURRENCY_KEY = "savyy-currency"

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else if (theme === "light") {
    root.classList.remove("dark")
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (prefersDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }
}

const themeIcons: Record<Theme, React.ReactNode> = {
  system: <Monitor size={12} />,
  light: <Sun size={12} />,
  dark: <Moon size={12} />,
}

interface SettingsRowProps {
  label: string
  description: string
  control: React.ReactNode
}

function SettingsRow({ label, description, control }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <div className="ml-8 shrink-0">{control}</div>
    </div>
  )
}

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="rounded-lg border border-border bg-card">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme | null) ?? "system"
  )
  const [currency, setCurrency] = useState<Currency>(
    () => (localStorage.getItem(CURRENCY_KEY) as Currency | null) ?? "EUR"
  )

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency)
  }, [currency])

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>

      <div className="flex flex-col gap-8">
        <SettingsSection title="General">
          <SettingsRow
            label="Default currency"
            description="Used when adding new transactions"
            control={
              <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </SettingsSection>

        <SettingsSection title="Interface and theme">
          <SettingsRow
            label="Interface theme"
            description="Select your interface color scheme"
            control={
              <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                <SelectTrigger>
                  <SelectValue>
                    <span className="flex items-center gap-1.5">
                      {themeIcons[theme]}
                      <span className="capitalize">{theme}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    <Monitor size={14} />
                    System
                  </SelectItem>
                  <SelectItem value="light">
                    <Sun size={14} />
                    Light
                  </SelectItem>
                  <SelectItem value="dark">
                    <Moon size={14} />
                    Dark
                  </SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </SettingsSection>
      </div>
    </div>
  )
}
