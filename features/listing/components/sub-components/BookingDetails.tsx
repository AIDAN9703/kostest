"use client";

import { Boat } from "@/shared/types/types";
import { Clock, Calendar, Shield, Info, CheckCircle2, CreditCard, AlertTriangle, MessageCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/shared/utils/general-utils";

interface BookingDetailsProps {
  boat: Boat;
}

export function BookingDetails({ boat }: BookingDetailsProps) {
  // Default cancellation policy if the boat doesn't have one
  const defaultCancellationPolicy = 
  `- 7+ Days Notice: Full refund (excluding holidays or special cases).
- 48 Hours – 7 Days: 50% refund of deposit.
- Less Than 48 Hours: We'll do our best to reschedule or offer a partial refund.`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Booking Information</h2>
      
      {/* Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SpecItem 
            icon={<Clock className="h-5 w-5" />} 
            label="Minimum Rental" 
            value={boat.minimumCharterDays ? `${boat.minimumCharterDays} days` : "2 hours"} 
          />
          <SpecItem 
            icon={<Calendar className="h-5 w-5" />} 
            label="Advance Notice" 
            value={(boat as any)['advanceBookingDays'] ? `${(boat as any)['advanceBookingDays']} days` : "1 day"} 
          />
        </div>
        <div className="space-y-6">
          <SpecItem 
            icon={<Shield className="h-5 w-5" />} 
            label="Security Deposit" 
            value={boat.depositAmount ? formatCurrency(boat.depositAmount) : "Required"} 
          />
          <SpecItem 
            icon={<CreditCard className="h-5 w-5" />} 
            label="Accepted Payment Methods" 
            value="Credit Card, Debit Card" 
          />
        </div>
      </div>
      
      {/* Cancellation Policy */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Cancellation Policy</h3>
            <p className="text-gray-700 whitespace-pre-line">{boat.cancellationPolicy || defaultCancellationPolicy}</p>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-gray-500 text-sm">Need something specific?</p>
              <Link href={`/boats/${boat.id}/inquiry`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                <MessageCircle className="h-4 w-4" />
                <span>Send a custom inquiry</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Captain status */}
      <div className="space-y-3">
        {boat.crewRequired && (
          <StatusItem 
            icon={<CheckCircle2 size={18} className="text-emerald-400" />}
            text="Captain included with charter"
          />
        )}
        
        {boat.fuelIncluded && (
          <StatusItem 
            icon={<CheckCircle2 size={18} className="text-emerald-400" />}
            text="Fuel included in price"
          />
        )}
        
        {!boat.instantBook && (
          <StatusItem 
            icon={<AlertTriangle size={18} className="text-amber-600" />}
            text="Requires approval before booking"
          />
        )}
      </div>
    </div>
  );
}

interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SpecItem({ icon, label, value }: SpecItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-gray-50 rounded-full p-3 text-gray-600 shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Added for consistent status item styling
interface StatusItemProps {
  icon: React.ReactNode;
  text: string;
}

function StatusItem({ icon, text }: StatusItemProps) {
  return (
    <div className="flex items-center">
      <div className="mr-2 shrink-0">{icon}</div>
      <span className="font-medium">{text}</span>
    </div>
  );
} 