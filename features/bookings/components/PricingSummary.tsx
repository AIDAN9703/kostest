import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/shared/utils/general-utils";
import { PricingTier } from "@/shared/types/types";

interface SafeBoatData {
  id: string;
  name: string;
  mainImage: string | null;
  instantBook: boolean;
  cleaningFee: number | null;
  locationLabel: string | null;
}

interface BookingData {
  needsCaptain: boolean;
  numberOfPassengers: number;
}

interface PricingSummaryProps {
  boat: SafeBoatData;
  selectedTier: PricingTier;
  bookingData: BookingData;
}

export default function PricingSummary({ boat, selectedTier, bookingData }: PricingSummaryProps) {
  // Use the same pricing logic as the listing page
  const basePrice = selectedTier.price;
  const captainFee = 0; // Captain service is included in base price
  const cleaningFee = boat.cleaningFee || 0;
  const subtotal = basePrice + captainFee + cleaningFee;
  const taxAmount = subtotal * 0.08; // 8% tax to match listing page
  const total = subtotal + taxAmount;

  const priceItems = [
    {
      label: `${selectedTier.name || 'Charter'} (${selectedTier.hours}h)`,
      amount: basePrice,
      description: `Charter package`
    },
    {
      label: "Captain service",
      amount: 0,
      description: "Professional licensed captain",
      isIncluded: true
    },
    ...(cleaningFee > 0 ? [{
      label: "Cleaning fee",
      amount: cleaningFee,
      description: "One-time cleaning charge",
      isIncluded: false
    }] : []),
    {
      label: "Taxes & fees",
      amount: taxAmount,
      description: "Sales tax (8%)",
      isIncluded: false
    }
  ];

  return (
    <div className="py-4">
      <div className="space-y-3 mb-6">
        {priceItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <p className="text-sm font-semibold ml-3">
              {item.isIncluded ? (
                <span className="text-emerald-600">Included</span>
              ) : (
                <span className="text-gray-900">{formatCurrency(item.amount)}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">Total</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(total)}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Final price includes all fees and taxes
        </p>
      </div>

      {boat.instantBook && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-emerald-800">Instant booking</p>
          </div>
          <p className="text-xs text-emerald-700">
            Your card will be charged immediately after confirmation
          </p>
        </div>
      )}
    </div>
  );
} 