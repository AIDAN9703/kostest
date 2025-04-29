"use client";

import { Boat } from "@/types/types";
import { Clock, Calendar, Shield, Info, CheckCircle2, CreditCard, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/general-utils";

interface BookingDetailsProps {
  boat: Boat;
}

export function BookingDetails({ boat }: BookingDetailsProps) {
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
          <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Cancellation Policy</h3>
            <p className="text-gray-700">{(boat as any).cancellationPolicy || "Full refund up to 3 days prior."}</p>
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
      <div className="bg-gray-50 rounded-full p-3 text-gray-600 flex-shrink-0">{icon}</div>
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
      <div className="mr-2 flex-shrink-0">{icon}</div>
      <span className="font-medium">{text}</span>
    </div>
  );
} 