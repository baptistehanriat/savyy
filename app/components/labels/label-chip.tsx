import type { Label } from "~/stores/labels-store"

interface LabelChipProps {
  label: Label
}

export function LabelChip({ label }: LabelChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
      <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
      {label.name}
    </span>
  )
}
