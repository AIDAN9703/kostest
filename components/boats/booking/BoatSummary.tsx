import { Zap, Clock } from "lucide-react";
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
  locationLabel: string | null;
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
  timeLeft?: number;
}

export default function BoatSummary({ boat, bookingData, selectedTier, timeLeft }: BoatSummaryProps) {
  const endTime = calculateEndTime(bookingData.startTime, selectedTier.hours);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft && timeLeft < 120; // Less than 2 minutes

  return (
    <div>
      {/* Enhanced countdown header */}
      {timeLeft && timeLeft > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`relative p-1.5 rounded-full ${isUrgent ? 'bg-red-50' : 'bg-primary/10'}`}>
                <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-primary'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Hold expires in</p>
                <p className={`text-lg font-bold ${isUrgent ? 'text-red-600' : 'text-primary'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-primary animate-pulse'}`} />
              <span className="text-xs text-gray-500 font-medium">
                {isUrgent ? 'Almost expired!' : 'Time remaining'}
              </span>
            </div>
          </div>
        </div>
      )}

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
          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            {boat.name}
          </h1>
          
          {boat.locationLabel && (
            <p className="text-sm text-gray-600 mb-2">
              📍 {boat.locationLabel}
            </p>
          )}
          
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