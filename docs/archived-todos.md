Stack:

- [x] React
- [x] Typescript
- [x] React Router
- [x] Tanstack Table
- [x] Tanstack Form
- [x] Tailwind CSS
- [x] Shadcn UI
- [x] Lucide
- [x] date-fns
- [ ] Decide between mobx and legend-state for state management

Brand:

- [ ] Savyy logo

Data structure:

- [ ] Define transactions data structure
- [ ] Define labels data structure
- [ ] Define user data structure
- [ ] Define label groups data structure

Smart table:

- [ ] Fix width/left padding of checkbox column
- [ ] Fix width/right padding of last column (on hover: show delete button)
- [ ] Add ability to order columns by clicking on header
- [ ] Fix EditableCell design
- [ ] Add inline row via + button
- [ ] Selected bg-color should be different from hover bg-color
- [ ] Add actions widget on multiple rows selection: when 1 or more rows are selected, show actions widget with buttons, show selection amount and we should be able to open cmd+k to have a command palette to search for actions
- [ ] Add arrow down and arrow up to navigate through rows by keyboard

Forms:

- [ ] Add create-transaction-form
- [ ] Add import-transactions-form

Transactions page:

- [ ] Add page header
- [ ] Add table action header
- [ ] Add transactions table
- [ ] Think about infinite scroll (check how it works with tanstack table)
- [ ] Add ability to filter transactions by multiple filters:
  - [ ] Date range
  - [ ] Amount range
  - [ ] Labels
  - [ ] Description
  - [ ] Name
- [ ] Add sorting columns
- [ ] Add transactions form (most likely in a modal)
- [ ] Add create transaction CTA button (most likely in the table action header)
- [ ] Add ability to edit transaction
- [ ] Add ability to delete transaction
- [ ] Add ability to select transactions
- [ ] Add command line CMD+K to perform actions on selected transactions
  - [ ] Delete selected transactions
  - [ ] Relabel selected transactions
  - [ ] Change date
- [ ] Add ability to view transaction details by clicking on a row

Create/Import transaction(s) feature:

- [ ] Add a button to import transactions from a file (csv, xlsx, etc.)
- [ ] Add a button in to create a new transaction or import from file (in the sidebar, similar to the new Issue button in Linear)
- [ ] When adding manual transaction, add a switch to say "create more" (like in Linear)
- [ ] In the add transaction modal, there should be a segmented control to choose between "manual" and "import": the manual will display the create-transaction-form, the import will display the import-transactions-form

Transactions:id page:

- [ ] Add page header
- [ ] Add transaction form
- [ ] Auto save should be enabled
- [ ] Navigation between transactions should be enabled (next/back)
- [ ] Add ability to quickly navigate back to the list of transactions (while keeping scroll position in the table if possible)

Analytics page:

- [ ] Add page header
- [ ] Add chart widget
