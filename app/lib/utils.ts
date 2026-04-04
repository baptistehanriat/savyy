import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return uuidv4()
}

export function formatDate(date: string): string {
  return format(new Date(date), "MMM d")
}

// TODO: replace hardcoded currency with user settings when settings store is built
export function formatAmount(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    signDisplay: "never",
  }).format(Math.abs(amount))
}
