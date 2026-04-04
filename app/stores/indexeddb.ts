import { observablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb"

// Single shared IndexedDB instance for the whole app.
// All object store names must be listed here.
// Bump version whenever you add or remove a table name.
export const indexedDB = observablePersistIndexedDB({
  databaseName: "savyy",
  version: 2,
  tableNames: ["labels", "transactions"],
})
