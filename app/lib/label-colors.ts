export const LABEL_COLOR_PRESETS = [
  "#9ca3af", // gray
  "#94a3b8", // slate
  "#818cf8", // indigo
  "#22d3ee", // cyan
  "#4ade80", // green
  "#facc15", // yellow
  "#fb923c", // orange
  "#fda4af", // rose
  "#f87171", // red
  "#e879f9", // fuchsia
] as const

export type LabelColor = (typeof LABEL_COLOR_PRESETS)[number]

export const DEFAULT_LABEL_COLOR = LABEL_COLOR_PRESETS[5] // yellow
