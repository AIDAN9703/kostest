"use client";

import { useState, useEffect } from "react";
import { Boat } from "@/lib/types/types";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/general-utils";
import { generateTimeOptions, calculateEndTime, formatEndTime } from "@/lib/utils/booking-utils";
import { format } from "date-fns";
import { CalendarIcon, MessageCircle, Zap, Clock, Users, Anchor } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bookingRequestSchema, BookingRequest } from "@/lib/validation/validations";
import { createBookingRequest } from "@/lib/actions/booking/request";
import { createInstantBooking } from "@/lib/actions/booking/instant";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingFormProps {
  variant: "REQUEST" | "INSTANT";
  boat: Boat;
  user: User | undefined;
}

// Define the result types for better type safety
type BookingRequestResult = {
  success: boolean;
  error?: string;
  errorType?: string;
  fieldErrors?: Record<string, string[]>;
  booking?: { id: string; [key: string]: any };
  message?: string;
};

type InstantBookingResult = {
  success: boolean;
  error?: string;
  errorType?: string;
  fieldErrors?: Record<string, string[]>;
  paymentUrl?: string;
  booking?: { id: string; [key: string]: any };
  message?: string;
};

export default function BookingForm({ variant, boat, user }: BookingFormProps) {
  const router = useRouter();
  const isRequest = variant === "REQUEST";
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate time options (9 AM to 5 PM)
  const timeOptions = generateTimeOptions();

  // Check if user is signed in
  if (!user) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-navy-600 flex items-center justify-center">
          <Anchor className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-navy-900 mb-2">Sign in required</h3>
        <p className="text-gray-600 text-sm mb-4">You must be signed in to book this boat</p>
        <Button 
          onClick={() => router.push('/sign-in')}
          className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-2 rounded-lg"
        >
          Sign In to Book
        </Button>
      </div>
    );
  }

  // Check if boat has pricing tiers
  if (!boat.pricingTiers || boat.pricingTiers.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
        </div>
        <h3 className="font-semibold text-navy-900 mb-2">No pricing available</h3>
        <p className="text-gray-600 text-sm">No pricing options available for this boat</p>
      </div>
    );
  }

  // Filter active pricing tiers and sort by hours
  const activePricingTiers = boat.pricingTiers
    .filter(tier => tier.isActive)
    .sort((a, b) => a.hours - b.hours);

  // Booking form
  const form = useForm<BookingRequest>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      startDate: undefined as unknown as Date,
      startTime: "",
      pricingTierId: "",
      numberOfPassengers: 1,
      needsCaptain: boat.crewRequired,
      specialRequests: "",
    },
    mode: "onChange"
  });
  
  // Watch for pricing tier changes to show selected tier info
  const selectedPricingTierId = form.watch("pricingTierId");
  const selectedStartTime = form.watch("startTime");
  const selectedDate = form.watch("startDate");
  
  const selectedPricingTier = activePricingTiers.find(tier => tier.id === selectedPricingTierId);

  // Calculate end time when start time and pricing tier change
  const endTime = selectedStartTime && selectedPricingTier 
    ? calculateEndTime(selectedStartTime, selectedPricingTier.hours)
    : "";

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedPricingTier) return 0;
    
    const basePrice = selectedPricingTier.price;
    const captainFee = (form.watch("needsCaptain") || boat.crewRequired) ? 100 : 0;
    const cleaningFee = boat.cleaningFee || 0;
    const serviceFee = basePrice * 0.10; // 10% service fee
    const subtotal = basePrice + captainFee + cleaningFee + serviceFee;
    const taxAmount = subtotal * 0.08; // 8% tax
    
    return subtotal + taxAmount;
  };

  // Handle form submission
  async function onSubmit(data: BookingRequest) {
    if (!selectedPricingTier) {
      toast({
        title: "Error",
        description: "Please select a duration option",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const bookingData = {
        ...data,
        boatId: boat.id,
      };

      if (isRequest) {
        const result = await createBookingRequest(bookingData) as BookingRequestResult;
      
      if (result.success) {
        toast({
            title: "Booking request submitted",
            description: result.message || "Your request has been submitted successfully",
          });
          router.refresh();
        } else {
          toast({
            title: "Booking failed",
            description: result.error || "Please try again",
            variant: "destructive",
          });
        }
      } else {
        const result = await createInstantBooking(bookingData) as InstantBookingResult;
        
        if (result.success) {
          toast({
            title: "Redirecting to payment",
            description: result.message || "Taking you to the payment page",
          });
          
          if (result.paymentUrl) {
            window.location.href = result.paymentUrl;
          } else {
            // Fallback if no payment URL is provided
            router.refresh();
          }
        } else {
        toast({
          title: "Booking failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
        }
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="space-y-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {/* Date & Time */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="space-y-3">
            {/* Date Picker */}
            <FormField
                control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium text-navy-800 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-navy-600" />
                      Date
                    </FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value));
                        } else {
                          field.onChange(undefined);
                        }
                      }}
                      min={format(new Date(), "yyyy-MM-dd")}
                      className={cn(
                        "w-full h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white",
                        "focus:border-navy-400 focus:ring-1 focus:ring-navy-400 focus:outline-none",
                        "text-gray-900 placeholder:text-gray-500",
                        // iOS specific fixes
                        "appearance-none -webkit-appearance-none",
                        "font-medium leading-normal",
                        "flex items-center justify-start",
                        field.value && "border-navy-400 bg-navy-50"
                      )}
                      style={{
                        minHeight: '36px',
                        lineHeight: '36px',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              {/* Time & Duration Grid */}
              <div className="grid grid-cols-2 gap-3">
              <FormField
                  control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-sm font-medium text-navy-800">Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                          <SelectTrigger className="h-9 border-gray-300 text-sm">
                            <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                  control={form.control}
                  name="pricingTierId"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-sm font-medium text-navy-800">Duration</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                          <SelectTrigger className="h-9 border-gray-300 text-sm">
                            <SelectValue placeholder="Hours" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {activePricingTiers.map(tier => (
                            <SelectItem key={tier.id} value={tier.id}>
                              {tier.hours}hr - ${tier.price}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

              {/* End time display */}
              {endTime && (
                <div className="text-xs text-coral-600 bg-coral-50 px-3 py-2 rounded-lg border border-coral-200">
                  Charter ends at {formatEndTime(endTime)}
                </div>
              )}
            </div>
          </div>

          {/* Passengers & Captain */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="space-y-3">
            {/* Passengers */}
            <FormField
                control={form.control}
              name="numberOfPassengers"
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium text-navy-800 flex items-center gap-2">
                      <Users className="h-4 w-4 text-navy-600" />
                      Passengers
                    </FormLabel>
                  <Select onValueChange={v => field.onChange(parseInt(v))} value={field.value?.toString()}>
                    <FormControl>
                        <SelectTrigger className="h-9 border-gray-300 text-sm">
                        <SelectValue placeholder="Number of passengers" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: Math.min(boat.capacity || 10, 20) }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "passenger" : "passengers"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

              {/* Captain option */}
            {!boat.crewRequired && (
              <FormField
                  control={form.control}
                name="needsCaptain"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-sm font-medium text-navy-800">Captain</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => field.onChange(false)}
                        className={cn(
                            "h-9 text-sm transition-all",
                            !field.value 
                              ? "bg-navy-600 text-white border-navy-600" 
                              : "bg-white text-gray-700 border-gray-300"
                          )}
                          variant="outline"
                      >
                        Self-Drive
                      </Button>
                      <Button
                        type="button"
                        onClick={() => field.onChange(true)}
                        className={cn(
                            "h-9 text-sm transition-all",
                            field.value 
                              ? "bg-coral-500 text-white border-coral-500" 
                              : "bg-white text-gray-700 border-gray-300"
                          )}
                          variant="outline"
                        >
                          + Captain ($100)
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            </div>
          </div>

            {/* Special Requests */}
            <FormField
            control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                <FormLabel className="text-sm font-medium text-navy-800">Special Requests</FormLabel>
                  <FormControl>
                    <Textarea
                    placeholder="Any special occasions or requests?"
                    className="h-14 resize-none border-gray-300 text-sm rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Price Summary */}
          {selectedPricingTier && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{selectedPricingTier.hours}hr Charter</span>
                  <span className="font-medium text-gray-900">${selectedPricingTier.price}</span>
                </div>
                {(form.watch("needsCaptain") || boat.crewRequired) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Captain</span>
                    <span className="font-medium text-gray-900">$100</span>
                  </div>
                )}
                {boat.cleaningFee && boat.cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Cleaning</span>
                    <span className="font-medium text-gray-900">${boat.cleaningFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Service + Tax</span>
                  <span className="font-medium text-gray-900">${(calculateTotalPrice() - selectedPricingTier.price - (form.watch("needsCaptain") || boat.crewRequired ? 100 : 0) - (boat.cleaningFee || 0)).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-navy-900">Total</span>
                    <span className="text-lg font-bold text-gold-600">${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Submit Button */}
            <Button 
              type="submit" 
            className={cn(
              "w-full h-10 text-white font-semibold transition-all duration-200",
              isRequest 
                ? "bg-navy-600 hover:bg-navy-700" 
                : "bg-coral-500 hover:bg-coral-600"
            )}
            disabled={isSubmitting || !selectedPricingTier}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                {isRequest ? "Submitting..." : "Processing..."}
                </div>
              ) : (
              <div className="flex items-center gap-2">
                {isRequest ? <MessageCircle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                {isRequest ? "Request to Book" : "Book & Pay Now"}
              </div>
              )}
            </Button>
          </form>
        </Form>
    </div>
  );
} 