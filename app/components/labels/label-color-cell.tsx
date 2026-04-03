import { Check } from "lucide-react"
import { forwardRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { cn } from "~/lib/utils"
import { LABEL_COLOR_PRESETS } from "./label-colors"

interface LabelColorCellProps {
  color: string
  isEditing: boolean
  onColorChange: (color: string) => void
  onTabFromColor?: () => void
}

export const LabelColorCell = forwardRef<HTMLButtonElement, LabelColorCellProps>(function LabelColorCell(
  { color, isEditing, onColorChange, onTabFromColor },
  ref
) {
  if (!isEditing) {
    return <span className="inline-block size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
  }

  return (
    <Popover>
      <PopoverTrigger
        ref={ref}
        className={cn(
          "inline-block size-3 shrink-0 rounded-full cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        )}
        style={{ backgroundColor: color }}
        onKeyDown={event => {
          if (event.key === "Tab") {
            event.preventDefault()
            onTabFromColor?.()
          }
        }}
      />
      <PopoverContent className="w-auto p-2" side="bottom" align="start" sideOffset={6}>
        <div className="flex items-center gap-1">
          {LABEL_COLOR_PRESETS.map(preset => (
            <button
              key={preset}
              type="button"
              className="relative size-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ backgroundColor: preset }}
              onClick={() => onColorChange(preset)}
            >
              {preset === color && <Check className="absolute inset-0 m-auto size-3 text-white drop-shadow-sm" />}
            </button>
          ))}
          {/* Rainbow placeholder — full picker out of scope */}
          <button
            type="button"
            disabled
            className="size-6 rounded-full opacity-50 cursor-not-allowed"
            style={{
              background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
})
