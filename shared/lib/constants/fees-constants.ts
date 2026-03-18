// Fee-related constants for the application
// All fee rates are expressed as decimals (e.g., 0.08 = 8%)

export const TAX_RATE = 0.08; // 8% tax rate
export const SERVICE_FEE_RATE = 0.035; // 3.5% card processing fee rate

/** Display string for service fee (avoids floating-point "3.5000000000000004%" when using SERVICE_FEE_RATE * 100) */
export const SERVICE_FEE_PERCENT_DISPLAY = "3.5";

// Fee calculation helpers
export const calculateTaxAmount = (subtotal: number): number => {
  return subtotal * TAX_RATE;
};

export const calculateServiceFee = (subtotal: number): number => {
  return subtotal * SERVICE_FEE_RATE;
};

export const calculateTotalWithFees = (subtotal: number): number => {
  const taxAmount = calculateTaxAmount(subtotal);
  const serviceFee = calculateServiceFee(subtotal);
  return subtotal + taxAmount + serviceFee;
}; 