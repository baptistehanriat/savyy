import { observable } from "@legendapp/state"
import { configureObservablePersistence } from "@legendapp/state/persist"
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage"
import type { Label, Transaction } from "~/components/data-type"
import { initialLabels } from "~/components/labels/dummy-labels"
import { dummyTransactions } from "~/components/transactions/dummy-transactions"

// Setup persistence
configureObservablePersistence({
    pluginLocal: ObservablePersistLocalStorage,
})

interface Store {
    labels: Label[]
    transactions: Transaction[]
    settings: {
        theme: "light" | "dark" | "system"
    }
}

export const store = observable<Store>({
    labels: initialLabels,
    transactions: dummyTransactions,
    settings: {
        theme: "system",
    },
})

// Persist the store
// We only persist specific parts to avoid issues with initial data or migrations for now
// In a real app, we might persist the whole thing or have more granular control
import { persistObservable } from "@legendapp/state/persist"

persistObservable(store.labels, {
    local: "savyy-labels",
})

persistObservable(store.transactions, {
    local: "savyy-transactions",
})

persistObservable(store.settings, {
    local: "savyy-settings",
})
