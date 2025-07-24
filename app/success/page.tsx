"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { CheckCircle, Loader2, AlertCircle, Calendar, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// import { getStripeSession } from "@/lib/actions/booking"; // Assuming this action exists

// A new component to handle the logic that uses searchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('No session ID provided.');
      return;
    }

    // Optional: Verify the session on the server for security
    // This prevents users from just navigating to /success?session_id=...
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setError(data.error || 'Payment was not completed successfully.');
        }
      } catch (err) {
        setStatus('error');
        setError('Failed to verify the payment session.');
        console.error(err);
      }
    };

    verifySession();
  }, [sessionId]);

  if (status === 'loading') {
    return <p className="text-center text-gray-600">Verifying your payment...</p>;
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Payment Issue</h2>
        <p className="mt-2 text-base text-gray-600">{error || 'There was an issue with your payment.'}</p>
        <Button asChild className="mt-6">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Payment Successful!</h2>
      <p className="mt-2 text-base text-gray-600">
        Thank you for your booking. A confirmation email has been sent to you.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href="/profile/bookings">View My Bookings</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/boats/search">Explore More Boats</Link>
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Booking Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Suspense fallback={<p className="text-center text-gray-600">Loading confirmation...</p>}>
              <SuccessContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 