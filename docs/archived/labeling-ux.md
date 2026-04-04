# Issue: Labeling UX at Scale

## Problem

The label system is the core value of Savyy. But applying labels to transactions is the most tedious part of the experience. If a user imports 3 months of transactions (say 200 rows), labeling them one by one kills the app before it starts.

The friction compounds quickly:
- New import → unlabeled pile → feels like homework
- Users won't do it consistently → data loses meaning
- Charts and filters become useless without labels

## Solutions (in order of effort)

### 1. Bulk labeling (table selection)
Select multiple rows → apply label to all.  
Low effort, high impact. Should be in Phase 1.  
Already planned: `cmd+k` on selection → "Add label to selected".

### 2. Auto-label rules (pattern matching)
Define a rule: if description contains "UBER" → apply label `transport`.  
Runs on import and on new transactions.  
Medium effort. Turns a one-time setup into permanent value.  
**This is the real unlock** — once your rules are tuned, new imports are mostly pre-labeled.

### 3. Suggested labels on import
During CSV import, run existing rules + show suggestions before confirming.  
User reviews and tweaks before data lands in the store.  
Higher effort but best UX for recurring imports.

### 4. AI-assisted labeling (future)
Send description to LLM → get label suggestions.  
Could be local (Ollama) or via API.  
Overkill for now, but interesting later.

## Recommendation

- Phase 1: bulk labeling via selection (must-have)
- Phase 2: auto-label rules (unlock for regular use)
- Phase 3: suggested labels on import (nice to have)
