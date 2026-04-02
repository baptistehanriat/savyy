import { useState } from "react";
import { use$ } from "@legendapp/state/react";
import { todosStore, addTodo, removeTodo } from "../store/todos";

export function meta() {
  return [{ title: "Todos" }];
}

export default function Todos() {
  const [input, setInput] = useState("");
  const items = use$(todosStore.items);

  function handleAdd() {
    const text = input.trim();
    if (!text) return;
    addTodo(text);
    setInput("");
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Todos</h1>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New todo"
        />
        <button onClick={handleAdd}>+</button>
      </div>
      <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
        {items.map((todo) => (
          <li key={todo.id} style={{ marginBottom: 8 }}>
            {todo.text}
            <button onClick={() => removeTodo(todo.id)} style={{ marginLeft: 8 }}>
              -
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
