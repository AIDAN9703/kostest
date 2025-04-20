// Helper functions for working with bookings

/**
 * Calculates all fees for a booking
 */
export function calculateBookingFees({
  basePrice,
  needsCaptain,
  cleaningFee = 0,
  taxRate = 0.08,
}: {
  basePrice: number;
  needsCaptain: boolean;
  cleaningFee?: number;
  taxRate?: number;
}) {
  const captainFee = needsCaptain ? 100 : 0; // Example captain fee
  const serviceFee = basePrice * 0.10; // 10% service fee
  const subtotal = basePrice + captainFee + cleaningFee + serviceFee;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  return {
    basePrice,
    captainFee,
    cleaningFee,
    serviceFee,
    taxAmount,
    totalAmount,
  };
}

/**
 * Format pricing breakdown for display
 */
export function formatPriceBreakdown(fees: ReturnType<typeof calculateBookingFees>) {
  return {
    basePrice: formatCurrency(fees.basePrice),
    captainFee: formatCurrency(fees.captainFee),
    cleaningFee: formatCurrency(fees.cleaningFee),
    serviceFee: formatCurrency(fees.serviceFee),
    taxAmount: formatCurrency(fees.taxAmount),
    totalAmount: formatCurrency(fees.totalAmount),
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Export server actions from sub-modules
export { createBookingRequest, createBookingRequestAction } from "./request";
export { createInstantBooking, createInstantBookingAction } from "./instant";
// Will add these later:
// export { ... } from "./term"; 