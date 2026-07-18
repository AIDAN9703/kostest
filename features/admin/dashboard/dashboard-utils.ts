export function formatBookingActivityMessage(event: {
  eventType: string;
  displayMessage?: string | null;
  content?: string | null;
}) {
  if (event.displayMessage) return event.displayMessage;
  if (event.content) return event.content.length > 96 ? `${event.content.slice(0, 96)}…` : event.content;
  return event.eventType.replace(/^(booking|lead|deal)\./, "").replace(/_/g, " ");
}
