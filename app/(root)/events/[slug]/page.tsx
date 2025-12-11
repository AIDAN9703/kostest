"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Ship,
  Users,
  Clock,
  Minus,
  Plus,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import {
  formatEventDate,
  formatEventTime,
  getAvailableTicketsCount,
  isEventPassed,
  handleEventError,
} from "@/shared/lib/utils/event-utils";
import { EventDetailSkeleton } from "@/shared/components/ui/event-loading";
import type {
  EventWithTiers,
  TicketTier,
} from "@/database/schema/tables/events/events.relations";

interface TicketSelection {
  tierId: number;
  quantity: number;
  price: number;
  name: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventWithTiers | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>(
    []
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ email: "", name: "" });

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/slug/${slug}`);
      const data = await response.json();

      if (data.success && data.event) {
        setEvent(data.event);
        setTicketSelections(
          data.event.ticketTiers.map((tier: TicketTier) => ({
            tierId: tier.id,
            quantity: 0,
            price: parseFloat(tier.price),
            name: tier.name,
          }))
        );
      }
    } catch (error) {
      handleEventError(error, "fetching event", false); // Don't show alert, handle gracefully
    } finally {
      setLoading(false);
    }
  };

  const updateTicketQuantity = (tierId: number, change: number) => {
    if (!event) return;

    setTicketSelections((prev) =>
      prev.map((selection) => {
        if (selection.tierId === tierId) {
          const newQuantity = Math.max(0, selection.quantity + change);
          const tier = event.ticketTiers.find((t) => t.id === tierId);
          const maxAvailable = tier
            ? tier.maxQuantity - (tier.soldQuantity || 0)
            : 0;
          return {
            ...selection,
            quantity: Math.min(newQuantity, maxAvailable),
          };
        }
        return selection;
      })
    );
  };

  const totalQuantity = ticketSelections.reduce(
    (sum, selection) => sum + selection.quantity,
    0
  );
  const totalPrice = ticketSelections.reduce(
    (sum, selection) => sum + selection.quantity * selection.price,
    0
  );
  const selectedTickets = ticketSelections.filter(
    (selection) => selection.quantity > 0
  );

  const handleCheckout = async () => {
    if (!customerInfo.email || !customerInfo.name) {
      alert("Please fill in all required fields");
      return;
    }
    if (!customerInfo.email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    if (selectedTickets.length === 0) {
      alert("Please select at least one ticket");
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch(`/api/events/${event!.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickets: selectedTickets.map((selection) => ({
            tierId: selection.tierId,
            quantity: selection.quantity,
          })),
          customerInfo,
        }),
      });

      const data = await response.json();
      if (data.success && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        alert("Error: " + (data.error || "Failed to create checkout session"));
      }
    } catch (error) {
      handleEventError(error, "processing checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The event you're looking for doesn't exist or is no longer
            available.
          </p>
          <button
            onClick={() => router.push("/events")}
            className="bg-gold hover:bg-gold/90 text-white px-6 py-3 rounded-lg font-medium"
          >
            View All Events
          </button>
        </div>
      </div>
    );
  }

  const eventPassed = isEventPassed(event.eventDate);
  const totalAvailableTickets = getAvailableTicketsCount(event.ticketTiers);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Event Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-gray-600 mb-6">{event.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gold" />
                <span>{formatEventDate(event.eventDate)}</span>
              </div>

              {event.startTime && (
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-gold" />
                  <span>
                    {formatEventTime(event.startTime)}
                    {event.endTime && ` - ${formatEventTime(event.endTime)}`}
                  </span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gold" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.yachtName && (
                <div className="flex items-center text-gray-700">
                  <Ship className="h-5 w-5 mr-3 text-gold" />
                  <span>{event.yachtName}</span>
                </div>
              )}

              <div className="flex items-center text-gray-700">
                <Users className="h-5 w-5 mr-3 text-gold" />
                <span>
                  {totalAvailableTickets} / {event.totalCapacity} tickets
                  available
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
          {eventPassed ? (
            <div className="p-6 text-center">
              <div className="bg-gray-100 rounded-lg p-8">
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Event Has Passed
                </h3>
                <p className="text-gray-600">
                  This event has already taken place. Check out our other
                  upcoming events!
                </p>
              </div>
            </div>
          ) : totalAvailableTickets === 0 ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 rounded-lg p-8">
                <h3 className="text-xl font-medium text-red-900 mb-2">
                  Sold Out
                </h3>
                <p className="text-red-700">
                  All tickets for this event have been sold.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Select Your Tickets
              </h3>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Your Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {event.ticketTiers.map((tier) => {
                  const selection = ticketSelections.find(
                    (s) => s.tierId === tier.id
                  );
                  const available = tier.maxQuantity - (tier.soldQuantity || 0);

                  return (
                    <div
                      key={tier.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {tier.name}
                          </h4>
                          <p className="text-2xl font-bold text-gold">
                            ${tier.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {available} available
                          </p>
                        </div>
                      </div>

                      {available > 0 ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateTicketQuantity(tier.id, -1)}
                              disabled={!selection || selection.quantity === 0}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {selection?.quantity || 0}
                            </span>
                            <button
                              onClick={() => updateTicketQuantity(tier.id, 1)}
                              disabled={
                                !selection || selection.quantity >= available
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {selection && selection.quantity > 0 && (
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                $
                                {(selection.quantity * selection.price).toFixed(
                                  2
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-600 font-medium">Sold Out</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              {totalQuantity > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Order Summary
                  </h4>
                  <div className="space-y-2 mb-4">
                    {selectedTickets.map((selection) => (
                      <div
                        key={selection.tierId}
                        className="flex justify-between"
                      >
                        <span>
                          {selection.quantity}x {selection.name}
                        </span>
                        <span>
                          ${(selection.quantity * selection.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total ({totalQuantity} tickets)</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={
                  totalQuantity === 0 ||
                  !customerInfo.email ||
                  !customerInfo.name ||
                  checkoutLoading
                }
                className="w-full bg-gold hover:bg-gold/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors flex items-center justify-center"
              >
                {checkoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    {totalQuantity === 0
                      ? "Select Tickets"
                      : !customerInfo.email || !customerInfo.name
                        ? "Fill in your information"
                        : `Proceed to Checkout - $${totalPrice.toFixed(2)}`}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
