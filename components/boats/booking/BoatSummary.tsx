import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatTime12Hour } from "@/lib/utils/general-utils";
import { calculateEndTime } from "@/lib/utils/booking-utils";
import { PricingTier } from "@/lib/types/types";

interface SafeBoatData {
  id: string;
  name: string;
  mainImage: string | null;
  instantBook: boolean;
  cleaningFee: number | null;
}

interface BookingData {
  startDate: string | Date;
  startTime: string;
  numberOfPassengers: number;
}

interface BoatSummaryProps {
  boat: SafeBoatData;
  bookingData: BookingData;
  selectedTier: PricingTier;
}

export default function BoatSummary({ boat, bookingData, selectedTier }: BoatSummaryProps) {
  const endTime = calculateEndTime(bookingData.startTime, selectedTier.hours);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <img
            src={boat.mainImage || '/images/boats/yacht1.jpg'}
            alt={boat.name}
            className="w-20 h-16 rounded-xl object-cover"
          />
          {boat.instantBook && (
            <div className="absolute -top-1 -right-1">
              <Badge className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 text-[10px]">
                <Zap className="w-2.5 h-2.5 mr-0.5" />
                Instant
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            {boat.name}
          </h1>
          
          <div className="space-y-1 text-sm">
            <p className="font-medium text-gray-900">
              {format(new Date(bookingData.startDate), "EEEE, MMMM d, yyyy")}
            </p>
            
            <p className="text-gray-700">
              {formatTime12Hour(bookingData.startTime)} - {formatTime12Hour(endTime)} 
              <span className="text-gray-500 ml-1">({selectedTier.hours}h)</span>
            </p>
            
            <p className="text-gray-700">
              {bookingData.numberOfPassengers} guests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 