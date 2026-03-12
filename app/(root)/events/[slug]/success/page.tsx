"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Mail, ArrowRight, Download } from "lucide-react";

export default function EventSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrderData(data);
      } else {
        setError(data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Error verifying payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">×</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={`/events/${slug}`}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-900 mb-2">Payment Successful!</h1>
            <p className="text-green-700">Your tickets have been confirmed and sent to your email.</p>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Confirmation</h2>
            
            {orderData && (
              <div className="space-y-6">
                {/* Event Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Event Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Event:</strong> {orderData.eventTitle || 'Event Title'}</p>
                    <p><strong>Date:</strong> {orderData.eventDate || 'Event Date'}</p>
                    <p><strong>Location:</strong> {orderData.eventLocation || 'Event Location'}</p>
                  </div>
                </div>

                {/* Tickets Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your Tickets</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {orderData.tickets && orderData.tickets.map((ticket: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{ticket.quantity}x {ticket.name}</span>
                        <span>${(ticket.quantity * ticket.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${orderData.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Confirmation Code */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Confirmation Code</h3>
                  <p className="text-2xl font-mono font-bold text-blue-900">{orderData.confirmationCode || sessionId?.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-blue-700 mt-2">Keep this code for your records and event check-in.</p>
                </div>

                {/* Next Steps */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    What's Next?
                  </h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Check your email for detailed tickets and event information</li>
                    <li>• Add the event to your calendar</li>
                    <li>• Arrive at the location 15-30 minutes before departure</li>
                    <li>• Bring a valid ID and your confirmation code</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <button
                onClick={() => window.print()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Print Confirmation
              </button>
              
              <div className="flex space-x-4">
                <Link
                  href="/events"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors text-center"
                >
                  Browse More Events
                </Link>
                <Link
                  href="/"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
