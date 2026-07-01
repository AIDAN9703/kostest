function formatStatusLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatBookingActivityMessage(event: {
  eventType: string;
  displayMessage?: string | null;
  content?: string | null;
}) {
  if (event.displayMessage) return event.displayMessage;
  if (event.content) return event.content.length > 96 ? `${event.content.slice(0, 96)}…` : event.content;
  return event.eventType.replace(/^booking\./, "").replace(/_/g, " ");
}

export function formatInquiryActivityMessage(event: {
  eventType: string;
  content?: string | null;
  previousStage?: string | null;
  newStage?: string | null;
  previousOutcome?: string | null;
  newOutcome?: string | null;
  contactMethod?: string | null;
}) {
  switch (event.eventType) {
    case "CREATED":
      return "Inquiry created";
    case "STAGE_CHANGE":
      return event.newStage ? `Stage → ${formatStatusLabel(event.newStage)}` : "Stage updated";
    case "OUTCOME_CHANGE":
      return event.newOutcome
        ? `Outcome → ${formatStatusLabel(event.newOutcome)}`
        : "Outcome updated";
    case "NOTE":
      return event.content
        ? event.content.length > 96
          ? `${event.content.slice(0, 96)}…`
          : event.content
        : "Note added";
    case "CONTACT_ATTEMPT":
      return event.contactMethod
        ? `Contact via ${formatStatusLabel(event.contactMethod)}`
        : "Contact logged";
    case "ASSIGNED":
      return event.content || "Lead assigned";
    default:
      return formatStatusLabel(event.eventType);
  }
}
