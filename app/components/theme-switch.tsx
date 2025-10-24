import { MoonIcon, SunIcon } from "lucide-react"
import { useId } from "react"
import { Label } from "~/components/primitives/label"
import { Switch } from "~/components/primitives/switch"
import { useTheme } from "~/lib/hooks/use-theme"

export default function ThemeSwitch() {
  const id = useId()
  const [theme, setTheme] = useTheme()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div onClick={handleClick}>
      <div className="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium">
        <Switch
          id={id}
          checked={theme === "light"}
          onCheckedChange={() => setTheme(theme === "light" ? "dark" : "light")}
          className="peer absolute inset-0 h-[inherit] w-auto data-[state=checked]:bg-input/50 data-[state=unchecked]:bg-input/50 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
        />
        <span className="pointer-events-none relative ms-0.5 flex min-w-7 items-center justify-center text-center peer-data-[state=checked]:text-muted-foreground/70">
          <MoonIcon size={16} aria-hidden="true" />
        </span>
        <span className="pointer-events-none relative me-0.5 flex min-w-7 items-center justify-center text-center peer-data-[state=unchecked]:text-muted-foreground/70">
          <SunIcon size={16} aria-hidden="true" />
        </span>
      </div>
      <Label htmlFor={id} className="sr-only">
        Labeled switch
      </Label>
    </div>
  )
}
