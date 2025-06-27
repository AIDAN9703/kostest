import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/general-utils";
import { PricingTier } from "@/lib/types/types";

interface SafeBoatData {
  id: string;
  name: string;
  mainImage: string | null;
  instantBook: boolean;
  cleaningFee: number | null;
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
  const basePrice = selectedTier.price;
  const cleaningFee = boat.cleaningFee || 0;
  const captainFee = bookingData.needsCaptain ? 500 : 0; // Standard captain fee
  const tax = Math.round((basePrice + cleaningFee + captainFee) * 0.08875); // 8.875% NYC tax
  const total = basePrice + cleaningFee + captainFee + tax;

  const priceItems = [
    {
      label: `${selectedTier.name || 'Charter'} (${selectedTier.hours}h)`,
      amount: basePrice,
      description: `Charter package`
    },
    ...(cleaningFee > 0 ? [{
      label: "Cleaning fee",
      amount: cleaningFee,
      description: "One-time cleaning charge"
    }] : []),
    ...(bookingData.needsCaptain ? [{
      label: "Captain service",
      amount: captainFee,
      description: "Professional licensed captain"
    }] : []),
    {
      label: "Taxes & fees",
      amount: tax,
      description: "NYC sales tax (8.875%)"
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
            <p className="text-sm font-semibold text-gray-900 ml-3">
              {formatCurrency(item.amount)}
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
        <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
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