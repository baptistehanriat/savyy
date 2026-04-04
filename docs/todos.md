# Todos

## Refactor

- **Labels inline editing** — the current structure is messy and buggy (stale closures, blur/focus timing hacks, draft state scattered across `LabelRow`, `LabelColorPicker`, `LabelNameCell`). Needs a clean rethink.
- parsing/conversion of the amount. It's a text, then a float, then an integer. Check the full flow and make sur it's robust and consistent.
- indexedDB vs localStorage. currently only localStorage correclty works. indexedDB is not working.
- security question: is it bad that the user_id leaks from the response of the transactions and labels endpoints?
- security question: is it bad that the index_DB is accessible from the browser console application > indexDB?
- when transacation is added it should be at the top of the table (so basically if they have the same date, we could look at the createdAt field and sort by that)
