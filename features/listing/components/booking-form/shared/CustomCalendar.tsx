"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar } from "@/shared/components/ui/calendar";
import { format } from "date-fns";
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

export function CustomCalendar({ 
  selectedDate, 
  onSelect, 
  boatId,
  onMonthChange 
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  // Memoized availability map for performance
  const availabilityMap = useMemo(() => {
    return new Map(
      calendarDays.map(day => [day.date.split('T')[0], day])
    );
  }, [calendarDays]);

  // Memoized disabled dates function
  const getDisabledDates = useCallback((date: Date) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    if (date < today) return true;
    
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayAvailability = availabilityMap.get(dateKey);
    return dayAvailability?.status === 'booked' || dayAvailability?.status === 'blocked';
  }, [availabilityMap]);

  // Fetch availability data
  useEffect(() => {
    if (!boatId || !currentMonth) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const monthParam = format(currentMonth, 'yyyy-MM');
        const response = await fetch(`/api/boats/${boatId}/calendar?month=${monthParam}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch calendar availability');
        }
        
        const data = await response.json();
        setCalendarDays(data.days);
      } catch (error) {
        console.error('Failed to fetch calendar availability:', error);
        setCalendarDays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [boatId, currentMonth]);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
    onMonthChange?.(month);
  }, [onMonthChange]);

  // Memoized today date to prevent recreation on every render
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Custom day renderer that preserves click functionality
  const renderDay = useCallback((day: Date, modifiers: any) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayAvailability = availabilityMap.get(dateKey);
    
    // Check if this is a past date (most common approach)
    const isPastDate = day < today;
    const isDisabled = modifiers.disabled || isPastDate;
    
    let underlineClass = "";
    
    if (dayAvailability) {
      switch (dayAvailability.status) {
        case 'booked':
          underlineClass = "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-500";
          break;
        case 'partial':
          underlineClass = "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-yellow-500";
          break;
        case 'blocked':
          underlineClass = "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500";
          break;
      }
    }

    return (
      <button
        type="button"
        className={cn(
          "h-8 w-8 rounded-md flex items-center justify-center text-sm relative transition-colors",
          underlineClass,
          modifiers.selected && "bg-primary text-white",
          modifiers.today && "text-gold font-semibold",
          isDisabled && "text-gray-300 opacity-30 cursor-not-allowed",
          !isDisabled && "hover:bg-accent hover:text-accent-foreground"
        )}
        title={isPastDate ? "Past date" : dayAvailability ? `${dayAvailability.status} (${dayAvailability.conflictCount} conflicts)` : "Available"}
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            onSelect(day);
          }
        }}
      >
        {day.getDate()}
      </button>
    );
  }, [availabilityMap, onSelect]);

  return (
    <div className="relative">
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={onSelect}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        disabled={getDisabledDates}
        className="rounded-md border shadow"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 relative",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          root: "w-full items-center justify-center flex"
        }}
        components={{
          Day: ({ date, ...props }: any) => renderDay(date, props)
        }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md">
          <div className="text-sm text-gray-500">Loading availability...</div>
        </div>
      )}
    </div>
  );
}