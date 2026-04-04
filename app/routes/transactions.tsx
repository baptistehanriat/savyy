import { TransactionsTable } from "~/components/transactions/transactions-table"

export function meta() {
  return [{ title: "Transactions" }]
}

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <TransactionsTable />
    </div>
  )
}
