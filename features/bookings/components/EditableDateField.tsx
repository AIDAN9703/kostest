"use client";

import { useState, useMemo, useCallback } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils/general-utils";
import { format } from "date-fns";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import { formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { useUpdateBooking } from "@/features/bookings/hooks/useBookingMutations";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface EditableDateFieldProps {
  bookingId: string;
  field: string;
  value: Date | string | null | undefined;
  includeTime?: boolean;
  className?: string;
  disabled?: boolean;
}

export function EditableDateField({
  bookingId,
  field,
  value: initialValue,
  includeTime = false,
  className,
  disabled = false,
}: EditableDateFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();

  // Memoize display value calculation
  const displayValue = useMemo(() => {
    if (!initialValue) return "-";

    try {
      const date =
        initialValue instanceof Date ? initialValue : new Date(initialValue);
      if (isNaN(date.getTime())) return "-";

      const { date: parsedDate, time } = parseDateTimeInBoatTimezone(date);

      if (!parsedDate) return "-";

      if (includeTime && time) {
        return `${format(parsedDate, "MMM d, yyyy")} ${formatTime12Hour(time)}`;
      }
      return format(parsedDate, "MMM d, yyyy");
    } catch {
      return "-";
    }
  }, [initialValue, includeTime]);

  const handleStartEdit = useCallback(() => {
    if (initialValue) {
      try {
        const date =
          initialValue instanceof Date ? initialValue : new Date(initialValue);
        if (!isNaN(date.getTime())) {
          setDateValue(format(date, "yyyy-MM-dd"));
          if (includeTime) {
            setTimeValue(format(date, "HH:mm"));
          } else {
            setTimeValue("");
          }
        } else {
          setDateValue("");
          setTimeValue("");
        }
      } catch {
        setDateValue("");
        setTimeValue("");
      }
    } else {
      setDateValue("");
      setTimeValue("");
    }
    setIsEditing(true);
  }, [initialValue, includeTime]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      let saveValue: string | null = null;

      if (dateValue.trim()) {
        if (includeTime && timeValue) {
          saveValue = `${dateValue}T${timeValue}:00`;
        } else {
          saveValue = `${dateValue}T00:00:00`;
        }
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
  }, [
    dateValue,
    timeValue,
    includeTime,
    bookingId,
    field,
    updateBooking,
    toast,
  ]);

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
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={updateBooking.isPending}
            className={cn("h-8 text-sm", className)}
          />
          {includeTime && (
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={updateBooking.isPending}
              className="h-8 text-sm"
            />
          )}
        </div>
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
