"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createDateTimeISO,
  getBoatDayBoundsUTC,
} from "@/shared/lib/utils/date-helpers";

export interface BoatTimeSlot {
  /** "HH:mm" in the boat's local time */
  time: string;
  isAvailable: boolean;
}

interface ApiConflict {
  startTime: string;
  endTime: string;
}

// Selectable start times, in the boat's local time.
const FIRST_HOUR = 6;
const LAST_HOUR = 20; // last selectable start time
const INTERVAL_MIN = 30;

/**
 * Timezone-correct time slots for a given day.
 *
 * Every slot's start/end is computed as a real UTC instant in the boat's
 * timezone (via `createDateTimeISO`), then intersected against the day's
 * conflicts — which are also UTC. This means availability and the displayed
 * times are correct no matter where the viewer's browser is.
 */
export function useBoatTimeSlots({
  date,
  boat,
  durationHours,
}: {
  date: Date | null;
  boat: { id: string; timezone?: string | null };
  durationHours: number;
}) {
  const [conflicts, setConflicts] = useState<ApiConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const dateKey = useMemo(
    () =>
      date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
            date.getDate()
          ).padStart(2, "0")}`
        : "",
    [date]
  );

  const baseTimes = useMemo(() => {
    const times: string[] = [];
    for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour++) {
      for (let min = 0; min < 60; min += INTERVAL_MIN) {
        if (hour === LAST_HOUR && min > 0) break;
        times.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
      }
    }
    return times;
  }, []);

  useEffect(() => {
    if (!date || !boat.id) {
      setConflicts([]);
      return;
    }
    let active = true;
    setLoading(true);
    setError(false);
    const { startUTC, endUTC } = getBoatDayBoundsUTC(date, boat);
    fetch(
      `/api/boats/${boat.id}/availability?startDate=${startUTC.toISOString()}&endDate=${endUTC.toISOString()}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("availability fetch failed"))))
      .then((data) => {
        if (active) setConflicts(data.conflicts ?? []);
      })
      .catch(() => {
        if (active) {
          setConflicts([]);
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, boat.id]);

  const slots = useMemo<BoatTimeSlot[]>(() => {
    if (!date) return [];
    const now = new Date();
    const parsedConflicts = conflicts.map((c) => ({
      start: new Date(c.startTime),
      end: new Date(c.endTime),
    }));

    return baseTimes.map((time) => {
      const startUTC = new Date(createDateTimeISO(date, time, boat));
      const endUTC = new Date(startUTC.getTime() + durationHours * 60 * 60 * 1000);
      const isPast = startUTC < now;
      const hasConflict = parsedConflicts.some(
        (c) => startUTC < c.end && endUTC > c.start
      );
      return { time, isAvailable: !isPast && !hasConflict };
    });
  }, [baseTimes, conflicts, date, boat, durationHours]);

  return { slots, loading, error };
}
