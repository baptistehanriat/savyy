# Roadmap

## Phase 0 — Skeleton (current)

- [x] React Router v7 + Vite setup
- [x] shadcn/ui + Tailwind
- [x] Legend State store (transactions, labels, settings)
- [x] localStorage persistence
- [x] App sidebar + routing (dashboard, transactions, labels, settings)
- [x] Dummy data

## Phase 1 — Core Transaction Flow

Goal: you can import a CSV and see your transactions in a usable table.

- [ ] Transactions table (TanStack Table)
  - [ ] Sort by column
  - [ ] Row selection (checkbox + shift+click)
  - [ ] Inline label editing
  - [ ] Hover: show delete button
  - [ ] Selection action bar (delete, relabel)
- [ ] Manual transaction creation (modal, form)
- [ ] CSV import flow (upload → map → preview → confirm)
- [ ] `cmd+k` command palette (basic)
- [ ] Keyboard navigation (↑↓ rows, Enter to open)

## Phase 2 — Labels

Goal: labels are first-class citizens, easy to manage.

- [ ] Labels table (list, edit, delete)
- [ ] Inline label autocomplete on transactions
- [ ] Create label on the fly
- [ ] Label color picker
- [ ] Label groups (optional)

## Phase 3 — Filtering & Views

Goal: slice and dice your data.

- [ ] Filter bar (labels, date range, amount range, text search)
- [ ] Filter chips (active filters visible)
- [ ] Saved views (save a filter set, give it a name)
- [ ] URL-driven filters (shareable/bookmarkable)

## Phase 4 — Analytics

Goal: understand your money at a glance.

- [ ] Net balance (income vs expense)
- [ ] Spending by label (bar/donut chart)
- [ ] Spending over time (line chart)
- [ ] Date range selector (month, quarter, year, custom)
- [ ] Drill down: click a label → filter transactions

## Phase 5 — Polish & Settings

- [ ] Theme (light/dark/system)
- [ ] Currency setting
- [ ] Auto-label rules (pattern → labels)
- [ ] Export (CSV)
- [ ] PWA / offline banner

## Phase 6 — Sync (optional)

- [ ] Supabase auth
- [ ] Cloud sync (transactions, labels)
- [ ] Multi-device support
