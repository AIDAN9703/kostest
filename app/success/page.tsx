"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle, Calendar, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setError("Missing session ID");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setBookingId(data.bookingId);
          setBookingDetails(data.bookingDetails);
        } else {
          setError(data.error || "Failed to verify payment");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="absolute inset-0">
          <Image
            src="/images/boats/success-bg.jpg"
            alt="Success Background"
            fill
            className="object-cover mix-blend-overlay"
            priority
          />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isLoading ? "Processing Your Booking" : 
               error ? "Payment Verification Failed" : 
               "Booking Confirmed!"}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {isLoading ? "We're finalizing your booking details..." :
               error ? "We encountered an issue with your payment" :
               "Your adventure awaits! We've sent you a confirmation email with all the details."}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium text-lg">Verifying your payment...</p>
          </div>
        ) : error ? (
          <Card className="max-w-2xl mx-auto border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-6">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                  Payment Verification Failed
                </CardTitle>
                <CardDescription className="text-gray-600 mb-8 text-center text-lg">
                  {error}
                </CardDescription>
                <Button asChild className="w-full max-w-xs bg-primary hover:bg-primary/90">
                  <Link href="/dashboard/bookings">View My Bookings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Success Card */}
            <Card className="md:col-span-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                    Payment Successful!
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-center text-lg mb-8">
                    Your booking has been confirmed. We've sent you an email with all the details.
                  </CardDescription>
                </div>

                {/* Booking Details */}
                {bookingDetails && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{new Date(bookingDetails.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium">{bookingDetails.startTime} - {bookingDetails.endTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Guests</p>
                          <p className="font-medium">{bookingDetails.numberOfPassengers} people</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{bookingDetails.boat?.homePort || 'To be confirmed'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href={`/dashboard/bookings/${bookingId}/confirmation`}>
                      View Full Booking Details
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full border-gray-200 hover:bg-gray-50">
                    <Link href="/dashboard/bookings">View All My Bookings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-6">
                  Next Steps
                </CardTitle>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Prepare for Your Trip</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Check your email for important information about your upcoming adventure.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Guest Information</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Make sure all guests are aware of the trip details and requirements.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-2">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Meeting Point</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Arrive 15 minutes before your scheduled departure time.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
} 