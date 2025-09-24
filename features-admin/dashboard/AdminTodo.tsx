"use client";

import { useEffect, useState } from "react";

type Todo = { id: string; text: string; done: boolean };

export default function AdminTodo() {
  const [items, setItems] = useState<Todo[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_todos");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("admin_todos", JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setItems((prev) => [{ id: String(Date.now()), text: t, done: false }, ...prev]);
    setText("");
  };
  const toggle = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
        />
        <button onClick={add} className="px-3 py-2 rounded-xl bg-purple-500 text-white text-sm hover:opacity-90">
          Add
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {items.length === 0 && <div className="text-sm text-gray-500">No tasks yet. Add your first one!</div>}
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} className="rounded" />
              <span className={i.done ? "line-through text-gray-400" : ""}>{i.text}</span>
            </label>
            <button onClick={() => remove(i.id)} className="text-xs text-gray-500 hover:text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}



