# Product — Savyy

## Vision

A minimalist, local-first personal finance app that feels like Linear.  
Fast, keyboard-driven, calm — no friction, no BS.

## Core Idea

Instead of rigid categories, transactions get **labels** (tags).  
You create your own structure. As granular or as simple as you want.

Examples:
- `travel + america + 2023`
- `groceries + organic`
- `income + freelance + clientA`

This enables ad-hoc analysis without predefined hierarchies.

---

## Design Philosophy

- **Local-first** → instant interactions, offline by default
- **Minimalist UI** → shadcn/ui, tight whitespace, no clutter
- **Keyboard-first** → every key action navigable, `cmd+k` command palette (à la Linear)
- **User-defined structure** → labels over categories, no forced taxonomy

---

## Core User Flow

1. Import CSV (or add manually)
2. Map columns (date, amount, description)
3. Label entries (inline or bulk)
4. Filter and explore (labels + date range)
5. Visualize (charts)

---

## MVP Features

- [ ] CSV import with column mapping
- [ ] Manual transaction entry
- [ ] Label system (multi-label per transaction)
- [ ] Transactions table (filter, sort, select, inline edit)
- [ ] `cmd+k` command palette on selection
- [ ] Keyboard navigation (arrow keys, shortcuts)
- [ ] Basic analytics (charts per label/period)
- [ ] Light/dark theme toggle
- [ ] localStorage persistence (local-first)

---

## Future Features

- Auto-label rules (pattern → labels, e.g. "Uber" → `transport`)
- Saved views (like Notion filters, reusable filter sets)
- Custom dashboard layouts
- Bank sync (Tink, Powens, Budget Insight)
- Multi-device sync via Supabase
- Label groups / hierarchy
