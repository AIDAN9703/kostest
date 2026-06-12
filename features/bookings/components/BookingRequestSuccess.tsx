"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, Home, Mail, Ship, Users } from "lucide-react";
import confetti from "canvas-confetti";

import { Button } from "@/shared/components/ui/button";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { formatDate, formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";

export interface RequestSuccessBooking {
  id: string;
  boatName: string | null;
  boatCategory: string | null;
  boatMainImage: string | null;
  boatTimezone: string | null;
  startDateTime: string | null;
  hours: number | null;
  numberOfPassengers: number;
  basePriceCents: number | null;
  cleaningFeeCents: number | null;
  serviceFeeCents: number | null;
  totalAmountCents: number | null;
  currency: string;
  addOns?: {
    name: string;
    quantity: number;
    total: number;
    isComplimentary?: boolean;
  }[];
}

function fireConfetti() {
  confetti({
    particleCount: 70,
    spread: 90,
    origin: { y: 0.3 },
    colors: ["#2cc171", "#3B82F6", "#0EA5E9", "#F59E0B"],
    disableForReducedMotion: true,
  });
}

export default function BookingRequestSuccess({ booking }: { booking: RequestSuccessBooking }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setShown(true);
      fireConfetti();
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const { date: boatDate, time: boatTime } = parseDateTimeInBoatTimezone(
    booking.startDateTime,
    { timezone: booking.boatTimezone }
  );
  const dateLabel = boatDate ? formatDate(boatDate) : "TBD";
  const timeLabel = boatTime ? formatTime12Hour(boatTime) : "TBD";
  const fmt = (cents: number | null | undefined) =>
    formatCentsAsCurrency(cents ?? 0, { currency: booking.currency });

  const addOnRows = (booking.addOns ?? []).map((a) => ({
    label: a.quantity > 1 ? `${a.name} × ${a.quantity}` : a.name,
    value: a.isComplimentary ? "Included" : fmt(Math.round(a.total * 100)),
  }));

  const rows = [
    booking.basePriceCents
      ? { label: "Charter", value: fmt(booking.basePriceCents) }
      : null,
    booking.cleaningFeeCents
      ? { label: "Cleaning fee", value: fmt(booking.cleaningFeeCents) }
      : null,
    ...addOnRows,
    booking.serviceFeeCents
      ? { label: "Card processing fee", value: fmt(booking.serviceFeeCents) }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <div
        className={`transition-all duration-700 ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Request sent!
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            We&apos;ve sent your charter request to the crew. You&apos;ll get a confirmation with a
            secure payment link once it&apos;s approved — usually within a few hours.
          </p>
        </div>

        {/* Booking card */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-4 border-b border-border p-4 sm:p-5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20">
              {booking.boatMainImage ? (
                <Image
                  src={booking.boatMainImage}
                  alt={booking.boatName || "Boat"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Ship className="h-7 w-7" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-foreground">
                {booking.boatName || "Your charter"}
              </h2>
              {booking.boatCategory && (
                <p className="truncate text-sm text-muted-foreground">{booking.boatCategory}</p>
              )}
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                #{booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
            <div className="p-3 sm:p-4">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Date
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{dateLabel}</dd>
            </div>
            <div className="p-3 sm:p-4">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Time
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {timeLabel}
                {booking.hours ? ` · ${booking.hours}h` : ""}
              </dd>
            </div>
            <div className="p-3 sm:p-4">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> Guests
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {booking.numberOfPassengers}
              </dd>
            </div>
          </dl>

          {booking.totalAmountCents != null && (
            <div className="space-y-2 p-4 sm:p-5">
              {rows.map((r) => (
                <div key={r.label} className="flex justify-between text-sm text-muted-foreground">
                  <span>{r.label}</span>
                  <span>{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                <span>Estimated total</span>
                <span>{fmt(booking.totalAmountCents)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You won&apos;t be charged until the crew confirms your request.
              </p>
            </div>
          )}
        </div>

        {/* What's next */}
        <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">What happens next</h3>
          <ol className="space-y-1.5 text-sm text-muted-foreground">
            <li>1. The crew reviews availability for your date and time.</li>
            <li>2. You&apos;ll get an email (and text, if enabled) once it&apos;s approved.</li>
            <li>3. Pay securely through the link to lock in your charter.</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/profile/bookings">
              <CalendarDays className="mr-2 h-4 w-4" />
              View my bookings
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/boats/search">
              <Ship className="mr-2 h-4 w-4" />
              Browse more boats
            </Link>
          </Button>
          <Button asChild variant="ghost" className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Questions?{" "}
          <Link href="/contact" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Mail className="h-3.5 w-3.5" /> Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
