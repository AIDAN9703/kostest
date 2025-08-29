"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { format, addMonths, eachDayOfInterval, endOfMonth, getDay, isBefore, startOfMonth, subMonths } from "date-fns";
import { cn } from "@/shared/utils/general-utils";

interface CalendarDay {
  date: string;
  status: 'available' | 'booked' | 'blocked' | 'partial';
  conflictCount: number;
}

interface CustomCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date | undefined) => void;
  boatId: string;
  onMonthChange?: (month: Date) => void;
}

export function CustomCalendar({ selectedDate, onSelect, boatId, onMonthChange }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  const availabilityMap = useMemo(() => new Map(calendarDays.map(d => [d.date.split('T')[0], d])), [calendarDays]);

  useEffect(() => {
    if (!boatId || !currentMonth) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const monthParam = format(currentMonth, 'yyyy-MM');
        const response = await fetch(`/api/boats/${boatId}/calendar?month=${monthParam}`);
        if (!response.ok) throw new Error('Failed to fetch calendar availability');
        const data = await response.json();
        if (mounted) setCalendarDays(data.days);
      } catch (e) {
        console.error(e);
        if (mounted) setCalendarDays([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [boatId, currentMonth]);

  const goPrev = useCallback(() => {
    const m = startOfMonth(subMonths(currentMonth, 1));
    setCurrentMonth(m);
    onMonthChange?.(m);
  }, [currentMonth, onMonthChange]);

  const goNext = useCallback(() => {
    const m = startOfMonth(addMonths(currentMonth, 1));
    setCurrentMonth(m);
    onMonthChange?.(m);
  }, [currentMonth, onMonthChange]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, []);

  const renderDay = useCallback((day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    const info = availabilityMap.get(key);
    const isPast = day < today;
    const isDisabled = isPast || info?.status === 'booked' || info?.status === 'blocked';
    let underline = '';
    if (info?.status === 'booked') underline = "after:bg-rose-500";
    if (info?.status === 'partial') underline = "after:bg-amber-500";
    if (info?.status === 'blocked') underline = "after:bg-slate-400";

    return (
      <button
        key={key}
        type="button"
        className={cn(
          "h-9 w-9 sm:h-10 sm:w-10 rounded-md flex items-center justify-center text-sm relative transition-colors",
          'after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
          underline,
          selectedDate && format(selectedDate, 'yyyy-MM-dd') === key && "bg-primary text-white",
          isDisabled ? "text-gray-300 opacity-30 cursor-not-allowed" : "hover:bg-gray-50"
        )}
        disabled={isDisabled}
        onClick={() => !isDisabled && onSelect(day)}
      >
        {day.getDate()}
      </button>
    );
  }, [availabilityMap, onSelect, today, selectedDate]);

  return (
    <div className="p-2 border border-gray-100 rounded-2xl max-w-[92vw] w-[min(380px,92vw)] select-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div className="flex items-center justify-between px-2 mb-2">
        <button type="button" onClick={goPrev} className="h-7 w-7 rounded-full text-gray-600 hover:bg-gray-50 focus:outline-hidden active:scale-95">‹</button>
        <div className="text-sm font-semibold tracking-tight">{format(currentMonth, 'MMMM yyyy')}</div>
        <button type="button" onClick={goNext} className="h-7 w-7 rounded-full text-gray-600 hover:bg-gray-50 focus:outline-hidden active:scale-95">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 px-2 text-[0.7rem] text-muted-foreground">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center font-medium w-9 sm:w-10 mx-auto">{d}</div>
        ))}
      </div>
      <div className="mt-1 space-y-1">
        {(() => {
          // Build a grid with blanks for leading/trailing cells, but render blanks as empty divs
          const start = startOfMonth(currentMonth);
          const end = endOfMonth(currentMonth);
          const days = eachDayOfInterval({ start, end });
          const firstDay = getDay(start);
          const rows: (Date | null)[][] = [];
          let row: (Date | null)[] = new Array(firstDay).fill(null);
          for (const d of days) {
            row.push(d);
            if (row.length === 7) {
              rows.push(row);
              row = [];
            }
          }
          if (row.length) {
            while (row.length < 7) row.push(null);
            rows.push(row);
          }
          return rows.map((r, i) => (
            <div key={i} className="grid grid-cols-7 gap-1 px-2 select-none">
              {r.map((day, j) => day ? renderDay(day) : <div key={`empty-${i}-${j}`} className="h-9 sm:h-10" />)}
            </div>
          ));
        })()}
      </div>
      <div className="flex items-center justify-center gap-5 text-xs text-gray-600 mt-2">
        <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded-full bg-rose-500"></div><span>No Availability</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded-full bg-amber-500"></div><span>Partial Availability</span></div>
      </div>
      {loading && (
        <div className="mt-2 text-center text-sm text-gray-500">Loading availability…</div>
      )}
    </div>
  );
}