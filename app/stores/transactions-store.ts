import { computed, observable } from "@legendapp/state"
import { generateId } from "~/lib/utils"
import { indexedDB } from "~/stores/indexeddb"
import { configureSyncedSupabase, syncedSupabase } from "@legendapp/state/sync-plugins/supabase"
import type { Tables } from "~/database/database.types"
import { supabaseClient } from "~/database/supabase-client"

configureSyncedSupabase({ generateId })

export interface Transaction {
  id: string
  createdAt: string
  date: string
  description: string | null
  amount: number
  currency: string
  labelIds: string[] | null
}

const transactionsStore = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "transactions",
    onError: error => console.error("[transactions sync]", error),
    persist: {
      plugin: indexedDB,
      name: "transactions",
    },
  })
)

export const transactions$ = computed(() =>
  Object.values(transactionsStore.get() ?? {}).map(mapTransactionRowToTransaction)
)

export async function addTransaction(
  transaction: Pick<Transaction, "date" | "description" | "amount" | "currency" | "labelIds">
) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user) return
  const id = generateId()
  const row = mapTransactionToTransactionRow(
    {
      ...transaction,
      id,
      createdAt: new Date().toISOString(),
    },
    user.id
  )
  transactionsStore[id].set(row)
}

export async function updateTransaction(
  id: string,
  patch: Partial<Pick<Transaction, "date" | "description" | "amount" | "currency" | "labelIds">>
) {
  const rowPatch = {
    ...(patch.date !== undefined && { date: patch.date }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.amount !== undefined && { amount: patch.amount }),
    ...(patch.currency !== undefined && { currency: patch.currency }),
    ...(patch.labelIds !== undefined && { label_ids: patch.labelIds }),
  }
  transactionsStore[id].assign(rowPatch)
}

export function deleteTransaction(id: string) {
  transactionsStore[id].delete()
}

type TransactionRow = Tables<"transactions">

export function mapTransactionRowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    createdAt: row.created_at,
    date: row.date,
    description: row.description,
    amount: row.amount,
    currency: row.currency,
    labelIds: row.label_ids,
  }
}

export function mapTransactionToTransactionRow(transaction: Transaction, userId: string): TransactionRow {
  return {
    id: transaction.id,
    created_at: transaction.createdAt,
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    currency: transaction.currency,
    label_ids: transaction.labelIds,
    user_id: userId,
  }
}
