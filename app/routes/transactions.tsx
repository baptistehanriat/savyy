export function meta() {
  return [{ title: "Transactions" }]
}

const mockTransactions = [
  { id: 1, date: "2026-04-01", description: "Grocery Store", amount: -87.43, category: "Food" },
  { id: 2, date: "2026-04-01", description: "Salary", amount: 3200.0, category: "Income" },
  { id: 3, date: "2026-03-31", description: "Netflix", amount: -15.99, category: "Entertainment" },
  { id: 4, date: "2026-03-30", description: "Coffee Shop", amount: -4.5, category: "Food" },
  { id: 5, date: "2026-03-29", description: "Electric Bill", amount: -112.0, category: "Utilities" },
  { id: 6, date: "2026-03-28", description: "Freelance Payment", amount: 850.0, category: "Income" },
  { id: 7, date: "2026-03-27", description: "Restaurant", amount: -64.2, category: "Food" },
  { id: 8, date: "2026-03-26", description: "Gym Membership", amount: -29.99, category: "Health" },
]

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <h1 className="text-lg font-semibold text-foreground mb-6">Transactions</h1>
      <div className="flex flex-col gap-1">
        {mockTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border hover:bg-accent/30 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{transaction.description}</span>
              <span className="text-xs text-muted-foreground">{transaction.date} · {transaction.category}</span>
            </div>
            <span
              className={[
                "text-sm font-medium tabular-nums",
                transaction.amount > 0 ? "text-green-600 dark:text-green-400" : "text-foreground",
              ].join(" ")}
            >
              {transaction.amount > 0 ? "+" : ""}
              {transaction.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
