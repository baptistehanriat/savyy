export interface Label {
  id: string
  name: string
  color: string
  groupId?: string
  description?: string
  numberOfTransactions: number
  lastApplied: string
  created: string
}

export interface Transaction {
  id: string
  name: string
  description?: string
  amount: number
  date: string
  labelIds: string[]
}
