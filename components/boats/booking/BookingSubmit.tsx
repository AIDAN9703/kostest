import { CreditCard, Loader2, Zap, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SafeBoatData {
  id: string;
  name: string;
  mainImage: string | null;
  instantBook: boolean;
  cleaningFee: number | null;
  locationLabel: string | null;
}

interface BookingSubmitProps {
  boat: SafeBoatData;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  onSubmit: () => void;
}

export default function BookingSubmit({ boat, isSubmitting, isAuthenticated, onSubmit }: BookingSubmitProps) {
  return (
    <div className="py-4">
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || !isAuthenticated}
        className="w-full h-14 text-base font-semibold"
        size="lg"
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : !isAuthenticated ? (
          <span>Complete authentication to continue</span>
        ) : boat.instantBook ? (
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5" />
            <span>Book now</span>
            <Zap className="w-4 h-4" />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5" />
            <span>Send request</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>

      {isAuthenticated && (
        <>
          {boat.instantBook ? (
            <div className="mt-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Instant confirmation</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    You'll be redirected to Stripe to complete payment. Your booking will be confirmed immediately upon successful payment.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-3 h-3 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-1">Request to book</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    The owner will review your request and respond within 24 hours. You won't be charged until the booking is confirmed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 