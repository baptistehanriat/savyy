import { observable } from "@legendapp/state";

interface Todo {
  id: string;
  text: string;
}

export const todosStore = observable({
  items: [] as Todo[],
});

export function addTodo(text: string) {
  todosStore.items.push({ id: crypto.randomUUID(), text });
}

export function removeTodo(id: string) {
  const items = todosStore.items.peek();
  todosStore.items.set(items.filter((t) => t.id !== id));
}
