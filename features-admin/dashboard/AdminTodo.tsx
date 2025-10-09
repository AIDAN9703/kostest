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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a task..."
          className="flex-1 rounded-xl border border-gray-200/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button 
          onClick={add} 
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all duration-200 whitespace-nowrap"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm text-gray-500">No tasks yet</div>
          </div>
        )}
        {items.map((i) => (
          <div key={i.id} className="group flex items-center justify-between rounded-xl border border-gray-200/70 px-4 py-3 bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200">
            <label className="flex items-center gap-3 text-sm flex-1 cursor-pointer">
              <input 
                type="checkbox" 
                checked={i.done} 
                onChange={() => toggle(i.id)} 
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer" 
              />
              <span className={i.done ? "line-through text-gray-400" : "text-gray-700"}>{i.text}</span>
            </label>
            <button 
              onClick={() => remove(i.id)} 
              className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 font-medium px-2 py-1 rounded-lg transition-all duration-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
