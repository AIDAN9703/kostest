"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { LineItemInput } from "./types";

interface AddOnsFieldsProps {
  lineItems: LineItemInput[];
  onChange: (items: LineItemInput[]) => void;
  label?: string;
}

export function AddOnsFields({ lineItems, onChange, label = "Add-ons" }: AddOnsFieldsProps) {
  const addItem = () =>
    onChange([...lineItems, { name: "", description: "", unitPrice: 0, quantity: 1 }]);

  const updateItem = (idx: number, updates: Partial<LineItemInput>) =>
    onChange(
      lineItems.map((v, i) => (i === idx ? { ...v, ...updates } : v))
    );

  const removeItem = (idx: number) => onChange(lineItems.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {lineItems.map((item, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border/60 p-3 flex flex-wrap gap-3 items-end"
        >
          <Input
            placeholder="Name"
            value={item.name}
            onChange={(e) => updateItem(idx, { name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Price"
            value={item.unitPrice || ""}
            onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })}
          />
          <Input
            type="number"
            min={1}
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
