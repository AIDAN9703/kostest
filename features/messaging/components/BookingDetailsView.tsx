"use client";

import React from "react";
import { Calendar, Clock, Users, MapPin, Star, Phone, Mail, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

interface BookingData {
  id: string;
  status: "confirmed" | "pending" | "upcoming" | "completed" | "cancelled";
  yacht: {
    name: string;
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
  };
  dates: {
    start: string;
    end: string;
    duration: string;
  };
  host: {
    name: string;
    avatar: string;
    responseTime: string;
  };
  captain: {
    name: string;
    avatar: string;
    included: boolean;
  };
  passengers: number;
  totalPaid: number;
  lastMessage: {
    content: string;
    timestamp: Date;
    unread: boolean;
  };
  daysUntil: number;
}

interface BookingDetailsViewProps {
  booking: BookingData | undefined;
}

export function BookingDetailsView({ booking }: BookingDetailsViewProps) {
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a booking</h3>
          <p className="text-gray-600 leading-relaxed">
            Choose a booking from the sidebar to view trip details, manage your charter, and communicate with renters.
          </p>
        </div>
      </div>
    );
  }

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(booking.id);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Yacht Hero Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="aspect-video w-full relative">
            <img 
              src={booking.yacht.image} 
              alt={booking.yacht.name}
              className="w-full h-full object-cover"
            />
            {booking.daysUntil <= 7 && booking.status === "confirmed" && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {booking.daysUntil} days until charter
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{booking.yacht.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.yacht.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span>{booking.yacht.rating}</span>
                    <span className="text-gray-400">({booking.yacht.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`${
                  booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  booking.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  booking.status === 'completed' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{booking.dates.start}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">End</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{booking.dates.end}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{booking.dates.duration}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Passengers</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{booking.passengers}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Booking ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-900 font-mono">{booking.id}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyBookingId}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                {(booking.status === "confirmed" || booking.status === "upcoming") && (
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                )}
                {booking.status === "completed" && (
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </Button>
                )}
                {booking.status === "pending" && (
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>

            {/* Captain Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Captain</h2>
              
              <div className="flex items-center gap-4">
                <img 
                  src={booking.captain.avatar} 
                  alt={booking.captain.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{booking.captain.name}</h3>
                  <p className="text-sm text-gray-600">
                    {booking.captain.included ? "Included with charter" : "Additional service"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Check-in Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-in Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">The boat address</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-900">1440 Southeast 15th Street, Fort Lauderdale, FL 33316</span>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-gray-900 mt-1">Residence Slip</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Arrival instructions</label>
                  <p className="text-gray-900 mt-1 leading-relaxed">
                    Once you arrive at the boat, you should do a walkthrough with the renter 
                    before they board. The check-in process usually takes 10-15 minutes and is 
                    your opportunity to explain everything about the boat. Be sure to inspect the 
                    boat for any pre-existing damages and document it so if there is any new 
                    damage, it can be associated with the correct booking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Host</h3>
              <div className="text-center">
                <img 
                  src={booking.host.avatar} 
                  alt={booking.host.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-gray-200"
                />
                <h4 className="font-semibold text-gray-900">{booking.host.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{booking.host.responseTime}</p>
                <div className="flex justify-center gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Paid</h3>
              <div className="text-3xl font-bold text-blue-600">
                ${booking.totalPaid.toFixed(2)}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {booking.status === "completed" ? "Payment completed" : "Includes all fees"}
              </p>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
                <Button variant="ghost" className="w-full text-blue-600">
                  View Cancellation Policy
                </Button>
                <Button variant="ghost" className="w-full text-blue-600">
                  Report an Issue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
