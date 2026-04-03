import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";

export interface Label {
  id: string;
  name: string;
  color: string; // hex, e.g. "#6366f1"
  groupId?: string;
  createdAt: string; // ISO 8601
}

export const labelsStore = observable({
  items: [] as Label[],
});

syncObservable(labelsStore, {
  persist: {
    plugin: ObservablePersistLocalStorage,
    name: "savyy-labels",
  },
});

export function addLabel(label: Omit<Label, "id" | "createdAt">) {
  labelsStore.items.push({
    ...label,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
}

export function updateLabel(id: string, patch: Partial<Omit<Label, "id">>) {
  const items = labelsStore.items.peek();
  const idx = items.findIndex((l) => l.id === id);
  if (idx === -1) return;
  labelsStore.items[idx].assign(patch);
}

export function deleteLabel(id: string) {
  const items = labelsStore.items.peek()
  labelsStore.items.set(items.filter((label) => label.id !== id))
}
