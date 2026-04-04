import { computed, observable } from "@legendapp/state"
import { configureSyncedSupabase, syncedSupabase } from "@legendapp/state/sync-plugins/supabase"
import type { Tables } from "~/database/database.types"
import { supabaseClient } from "~/database/supabase-client"
import { generateId } from "~/lib/utils"
import { indexedDB } from "~/stores/indexeddb"

configureSyncedSupabase({ generateId })

export interface Label {
  id: string
  createdAt: string
  name: string
  color: string
}

const labelsStore = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "labels",
    onError: error => console.error("[labels sync]", error),
    persist: {
      plugin: indexedDB,
      name: "labels",
    },
  })
)

export const labels$ = computed(() => Object.values(labelsStore.get() ?? {}).map(mapLabelRowToLabel))

export async function addLabel(label: Pick<Label, "name" | "color">) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user) return
  const id = generateId()
  const row = mapLabelToLabelRow(
    {
      ...label,
      id,
      createdAt: new Date().toISOString(),
    },
    user.id
  )
  labelsStore[id].set(row)
}

export async function updateLabel(id: string, patch: Partial<Pick<Label, "name" | "color">>) {
  const rowPatch = {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.color !== undefined && { color: patch.color }),
  }
  labelsStore[id].assign(rowPatch)
}

export function deleteLabel(id: string) {
  labelsStore[id].delete()
}

type LabelRow = Tables<"labels">

export function mapLabelRowToLabel(row: LabelRow): Label {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    color: row.color,
  }
}

export function mapLabelToLabelRow(label: Label, userId: string): LabelRow {
  return {
    id: label.id,
    created_at: label.createdAt,
    name: label.name,
    color: label.color,
    user_id: userId,
  }
}
