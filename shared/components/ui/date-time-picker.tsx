"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils/general-utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

function to12Hour(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DateTimePicker({
  value,
  onChange,
  name,
  placeholder = "Pick a date and time",
  required,
  disabled,
  className,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [time, setTime] = React.useState("09:00");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isAdminTheme, setIsAdminTheme] = React.useState(false);

  React.useEffect(() => {
    setIsAdminTheme(!!containerRef.current?.closest("[data-admin-theme]"));
  }, []);

  const date = value ? new Date(value) : undefined;
  const isValid = date && !isNaN(date.getTime());

  React.useEffect(() => {
    if (!value) return;
    const d = new Date(value);
    if (isNaN(d.getTime())) return;
    const mins = d.getMinutes();
    const snapped = Math.round(mins / 30) * 30;
    const h = snapped === 60 ? d.getHours() + 1 : d.getHours();
    const m = snapped === 60 ? 0 : snapped;
    setTime(`${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }, [value]);

  const apply = (d: Date, t: string) => {
    const [h, m] = t.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    // Use toISOString() so the client sends UTC. format() produced "yyyy-MM-dd'T'HH:mm"
    // without timezone, which the server then parsed as its local time (UTC in prod),
    // causing a 5-hour shift for EST users (9am → 4am).
    onChange?.(d.toISOString());
  };

  const onDateSelect = (d: Date | undefined) => {
    if (!d) return;
    apply(new Date(d), time);
  };

  const onTimeSelect = (t: string) => {
    setTime(t);
    const base = isValid ? new Date(date!) : new Date();
    apply(base, t);
  };

  const display = isValid
    ? `${format(date!, "MMM d, yyyy")} at ${to12Hour(time)}`
    : placeholder;

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-3", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !isValid && "text-muted-foreground"
            )}
          >
            {display}
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("overflow-hidden p-0", isAdminTheme && "admin-theme")}
          align="start"
          style={{ width: 280, maxWidth: "calc(100vw - 2rem)" }}
        >
          <Calendar
            mode="single"
            navLayout="around"
            selected={isValid ? date! : undefined}
            onSelect={onDateSelect}
            initialFocus
          />
          <div className="border-t p-3">
            <Label
              htmlFor={id ? `${id}-time` : undefined}
              className="mb-2 block px-1 text-sm"
            >
              Time
            </Label>
            <Select value={time} onValueChange={onTimeSelect}>
              <SelectTrigger id={id ? `${id}-time` : undefined}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isAdminTheme ? "admin-theme" : undefined}>
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {to12Hour(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      <input
        type="hidden"
        name={name}
        value={value ?? ""}
        required={required}
        readOnly
      />
    </div>
  );
}
