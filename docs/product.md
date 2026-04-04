# Product — Savyy

## Vision

A minimalist, local-first personal finance tracker that feels like Linear.  
Fast, keyboard-driven, calm — no friction, no noise.

---

## Core Idea

Most finance apps force you into rigid categories. Savyy uses **labels** instead.

You define your own structure. A transaction can have multiple labels — as simple or as granular as you want.

```
coffee + work
groceries + organic
travel + usa + 2024
income + freelance + client-a
```

This makes ad-hoc analysis possible without predefined hierarchies. Want to see everything you spent in the USA in 2024? Filter by `usa` and `2024`. Want to separate work coffee from personal coffee? Add a label for each.

The power is in the simplicity of the primitive.

---

## Design Philosophy

- **Local-first** — everything is instant. The app works offline. Supabase is a sync target, not a dependency.
- **Keyboard-first** — every action is reachable via keyboard. Power users never touch the mouse.
- **Linear-quality UX** — tight, calm, opinionated UI. No clutter, no onboarding friction.
- **User-defined structure** — no forced taxonomy. Labels are yours to create.

---

## Target User

Single user. Someone who wants full control over how they track and analyse their finances, without being locked into a bank's app or a bloated tool like YNAB or Mint.

---

## Core Features

### Labels
- Create labels with a name and a color
- Labels are reusable across transactions
- A transaction can have multiple labels

### Transactions
- Add transactions manually or import via CSV
- Each transaction has: date, description, amount, currency, and labels
- Amounts: negative = expense, positive = income
- Currency is per-transaction (default set in user settings)

### Analysis
- Filter transactions by label, date range, amount
- Charts per label and per period
- AI-powered review (future)

### Keyboard & Power User
- Full keyboard navigation
- `cmd+k` command palette (à la Linear)
- Shortcuts for every common action

---

## MVP Scope

- [ ] Labels CRUD with inline editing
- [ ] Transactions table with filter, sort, inline edit
- [ ] CSV import with column mapping
- [ ] Multi-label assignment (inline + bulk via command palette)
- [ ] Basic charts (per label, per period)
- [ ] Google Auth + Supabase sync
- [ ] Light / dark theme

## Future

- Auto-label rules (e.g. "Uber" → always tag `transport`)
- Saved filter views
- Bank sync (Tink, Powens)
- AI spending review
