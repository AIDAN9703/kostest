/** Prefill trip start/end when opening create booking from the admin calendar (`?date=YYYY-MM-DD`). */
export type BookingDatePrefill = {
  startDateTime: string;
  endDateTime: string;
};

/** Default 10:00 local start, 4-hour charter window. */
export function buildDatePrefillForBookingForm(dateStr: string): BookingDatePrefill | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const start = new Date(year, month - 1, day, 10, 0, 0, 0);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setHours(end.getHours() + 4);

  return {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  };
}
