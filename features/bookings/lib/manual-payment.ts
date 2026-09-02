/**
 * Off-platform ways money arrives. Card payments always go through Stripe.
 * Lives in a plain module (not the "use server" action file) so the client
 * form can import the list — every export of a server-action module is
 * turned into an action stub on the client.
 */
export const MANUAL_PAYMENT_METHODS = ["ZELLE", "WIRE", "CASH", "CHECK", "OTHER"] as const;
export type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];

export const MANUAL_PAYMENT_METHOD_LABELS: Record<ManualPaymentMethod, string> = {
  ZELLE: "Zelle",
  WIRE: "Wire transfer",
  CASH: "Cash",
  CHECK: "Check",
  OTHER: "Other",
};
