// src/lib/financial.ts

/**
 * Financial Calculation Utilities
 * ---------------------------------------------------------
 * Handles all financial calculations for the auction platform
 * according to the blueprint's fee structure:
 *
 * - Platform Commission: 6% of final bid (from seller)
 * - Delivery Fee: $3 (Beirut) or $5 (Outside Beirut) - from buyer
 * - Total Collected: Final bid + delivery fee (buyer pays this)
 * - Seller Payout: Final bid - platform commission (seller receives this)
 *
 * All calculations use environment variables for easy configuration.
 */

/**
 * Get delivery fee based on buyer's location
 *
 * @param buyerLocation - "Beirut" or "Outside Beirut"
 * @returns Delivery fee in USD
 */
export function getDeliveryFee(buyerLocation: string): number {
  const BEIRUT_FEE = parseFloat(process.env.DELIVERY_FEE_BEIRUT || "3.00");
  const OUTSIDE_FEE = parseFloat(process.env.DELIVERY_FEE_OUTSIDE || "5.00");

  if (buyerLocation === "Beirut") {
    return BEIRUT_FEE;
  } else if (buyerLocation === "Outside Beirut") {
    return OUTSIDE_FEE;
  }

  // Default to outside Beirut fee if location is unclear
  return OUTSIDE_FEE;
}

/**
 * Calculate platform commission (6% of final bid)
 *
 * @param finalBidAmount - The winning bid amount
 * @returns Platform commission in USD
 */
export function calculatePlatformCommission(finalBidAmount: number): number {
  const COMMISSION_RATE = parseFloat(
    process.env.PLATFORM_COMMISSION_RATE || "0.06"
  );
  return finalBidAmount * COMMISSION_RATE;
}

/**
 * Calculate total amount the buyer must pay
 * (Final bid + delivery fee)
 *
 * @param finalBidAmount - The winning bid amount
 * @param buyerLocation - "Beirut" or "Outside Beirut"
 * @returns Total amount buyer must pay
 */
export function calculateTotalCollected(
  finalBidAmount: number,
  buyerLocation: string
): number {
  const deliveryFee = getDeliveryFee(buyerLocation);
  return finalBidAmount + deliveryFee;
}

/**
 * Calculate seller payout
 * (Final bid - platform commission)
 *
 * @param finalBidAmount - The winning bid amount
 * @returns Amount seller will receive
 */
export function calculateSellerPayout(finalBidAmount: number): number {
  const commission = calculatePlatformCommission(finalBidAmount);
  return finalBidAmount - commission;
}

/**
 * Calculate all financial values at once
 * This is the main function used when closing an auction
 *
 * @param finalBidAmount - The winning bid amount
 * @param buyerLocation - "Beirut" or "Outside Beirut"
 * @returns Object containing all financial calculations
 */
export interface FinancialCalculation {
  finalBidAmount: number;
  deliveryFee: number;
  platformCommission: number;
  totalCollected: number;
  sellerPayout: number;
}

export function calculateFinancials(
  finalBidAmount: number,
  buyerLocation: string
): FinancialCalculation {
  const deliveryFee = getDeliveryFee(buyerLocation);
  const platformCommission = calculatePlatformCommission(finalBidAmount);
  const totalCollected = calculateTotalCollected(finalBidAmount, buyerLocation);
  const sellerPayout = calculateSellerPayout(finalBidAmount);

  return {
    finalBidAmount,
    deliveryFee,
    platformCommission,
    totalCollected,
    sellerPayout,
  };
}

/**
 * Format currency for display
 *
 * @param amount - Amount in USD
 * @returns Formatted string (e.g., "$150.00")
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
