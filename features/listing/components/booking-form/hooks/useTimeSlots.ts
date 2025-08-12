"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  conflictReason?: string;
}

export function useTimeSlots({
  date,
  boatId,
  duration,
}: {
  date: Date | null;
  boatId: string;
  duration: number; // hours
}) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const dateKey = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);

  // Base grid every 30 minutes from 06:00 to 20:00
  const baseGrid = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour <= 20; hour++) {
      const hh = hour.toString().padStart(2, "0");
      slots.push({ time: `${hh}:00`, isAvailable: true });
      if (hour < 20) slots.push({ time: `${hh}:30`, isAvailable: true });
    }
    return slots;
  }, []);

  useEffect(() => {
    if (!date || !boatId || !duration) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const response = await fetch(
          `/api/boats/${boatId}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );

        if (!response.ok) {
          if (mounted) setTimeSlots(baseGrid);
          return;
        }

        const availability = await response.json();
        const updated = baseGrid.map((slot) => {
          const [h, m] = slot.time.split(":").map(Number);
          const slotStart = new Date(date);
          slotStart.setHours(h, m, 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(h + duration, m, 0, 0);

          const hasConflict = availability.conflicts?.some((conflict: any) => {
            const conflictStart = new Date(conflict.startTime);
            const conflictEnd = new Date(conflict.endTime);
            return (
              (slotStart < conflictEnd && slotEnd > conflictStart) ||
              (conflictStart < slotEnd && conflictEnd > slotStart)
            );
          });

        return {
            ...slot,
            isAvailable: !hasConflict,
            conflictReason: hasConflict ? "Time slot unavailable" : undefined,
          };
        });

        if (mounted) setTimeSlots(updated);
      } catch (e) {
        if (mounted) setTimeSlots(baseGrid);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dateKey, boatId, duration, baseGrid]);

  return { timeSlots, loading };
}


