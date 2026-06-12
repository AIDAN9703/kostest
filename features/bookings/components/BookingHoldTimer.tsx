"use client";

import { useEffect, useState } from "react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BookingHoldTimer({ minutes }: { minutes: number }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [secondsLeft]);

  return (
    <div className="shrink-0 text-right">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Reservation held for
      </p>
      <p
        className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-amber-600 sm:text-xl"
        aria-live="polite"
        aria-label={`Reservation held for ${formatTime(secondsLeft)}`}
      >
        {formatTime(secondsLeft)}
      </p>
    </div>
  );
}
