# Future Feature: Label Groups

## Status

Not in scope yet. Referenced from `labels.md`.

## Overview

Allow labels to be organized into named groups (e.g. "Finance", "Travel"). Groups appear as collapsible sections in the labels table, and can be used as a filter dimension.

## Data Model

```ts
interface LabelGroup {
  id: string
  name: string
  color?: string
  createdAt: string
}
```

`Label.groupId` is already in the data model, ready for this.

## UI Entry Point

- "New group" button in the labels page header (currently omitted)
- Labels table gains group section headers (collapsible)
- Labels can be dragged into groups or assigned via the `...` context menu ("Move to group")
- Context menu on labels: "Convert to label group" option (seen in Linear)

## Notes

- Groups are display/organization only — they don't affect filter logic (filter still targets individual labels)
- A label without a `groupId` appears in an implicit "Ungrouped" section
