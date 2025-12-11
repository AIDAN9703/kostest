"use client";

import { useState, useMemo, useCallback } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn, formatCurrency } from "@/shared/lib/utils/general-utils";
import { useUpdateBooking } from "@/features/bookings/hooks/useBookingMutations";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface EditableFieldProps {
  bookingId: string;
  field: string;
  value: string | number | null | undefined;
  type?: "text" | "number" | "email" | "tel";
  placeholder?: string;
  className?: string;
  formatType?: "currency";
  disabled?: boolean;
}

export function EditableField({
  bookingId,
  field,
  value: initialValue,
  type = "text",
  placeholder,
  className,
  formatType,
  disabled = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(initialValue || ""));
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();

  // Memoize display value calculation
  const displayValue = useMemo(() => {
    if (initialValue === null || initialValue === undefined) {
      return "-";
    }
    if (formatType === "currency" && typeof initialValue === "number") {
      return formatCurrency(initialValue);
    }
    return String(initialValue);
  }, [initialValue, formatType]);

  // Sync edit value when starting to edit
  const handleStartEdit = useCallback(() => {
    setEditValue(String(initialValue || ""));
    setIsEditing(true);
  }, [initialValue]);

  const handleCancel = useCallback(() => {
    setEditValue(String(initialValue || ""));
    setIsEditing(false);
  }, [initialValue]);

  const handleSave = useCallback(async () => {
    try {
      let saveValue: string | number | null = editValue.trim();

      if (type === "number") {
        saveValue = saveValue === "" ? null : parseFloat(saveValue);
        if (isNaN(saveValue as number)) {
          toast({
            title: "Error",
            description: "Invalid number",
            variant: "destructive",
          });
          return;
        }
      } else if (saveValue === "") {
        saveValue = null;
      }

      await updateBooking.mutateAsync({
        id: bookingId,
        updates: { [field]: saveValue },
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    }
  }, [editValue, type, bookingId, field, updateBooking, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={updateBooking.isPending}
          className={cn("h-8 text-sm", className)}
          placeholder={placeholder}
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={updateBooking.isPending}
          className="h-8 w-8 p-0"
        >
          {updateBooking.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={updateBooking.isPending}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <span className={cn("text-sm", className)}>{displayValue}</span>
      {!disabled && (
        <button
          onClick={handleStartEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5 text-gray-400" />
        </button>
      )}
    </div>
  );
}
