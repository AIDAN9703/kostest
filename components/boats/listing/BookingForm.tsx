"use client";

import { useState, useEffect } from "react";
import { Boat, BookingRequest, InitialBookingDetails } from "@/lib/types/types";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/general-utils";
import { format } from "date-fns";
import { CalendarIcon, MessageCircle, Zap, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bookingRequestSchema, initialBookingDetailsSchema } from "@/lib/validation/validations";
import { finalizeBooking } from "@/lib/actions/booking/orchestrator";
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
import PhoneVerificationForm from "./sub-components/PhoneVerificationForm";
import CompleteAccountModal from "./sub-components/CompleteAccountModal";
import { completeUserAccountAfterVerification } from "@/lib/actions/auth/auth";

// Simplified response type that covers all cases
interface BookingActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorType?: string;
  fieldErrors?: Record<string, string[]>;
  booking?: { id: string; [key: string]: any };
  paymentUrl?: string;
}

interface BookingFormProps {
  variant: "REQUEST" | "INSTANT";
  boat: Boat;
  user: User | undefined;
}

type BookingStep = 
  | "initialDetails"    // Step 1: Date, Time, Passengers, Duration
  | "phoneInput"        // Step 2: Phone verification
  | "fullForm"          // Step 3: Complete booking details
  | "submitting";       // Final state when form is submitting

export default function BookingForm({ variant, boat, user }: BookingFormProps) {
  const router = useRouter();
  const isRequest = variant === "REQUEST";
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for multi-step form
  const [currentStep, setCurrentStep] = useState<BookingStep>("initialDetails");
  const [verifiedUser, setVerifiedUser] = useState<User | undefined>(user);
  const [initialDetails, setInitialDetails] = useState<Partial<InitialBookingDetails>>({});
  const [showCompleteAccountModal, setShowCompleteAccountModal] = useState(false);

  // Time options (9 AM to 5 PM)
  const timeOptions = Array.from({ length: 9 }, (_, i) => ({
    value: `${(i + 9).toString().padStart(2, "0")}:00`,
    label: format(new Date().setHours(i + 9, 0), "h:mm a"),
  }));

  // Hour options - using boat.minRentalHours if available
  const defaultHours = 2;
  const hourOptions = defaultHours ? 
    [defaultHours, 3, 4, 6, 8].filter((h, i, arr) => arr.indexOf(h) === i).sort((a, b) => a - b) : 
    [2, 3, 4, 6, 8];
  
  // Initial details form
  const initialForm = useForm<InitialBookingDetails>({
    resolver: zodResolver(initialBookingDetailsSchema),
    defaultValues: {
      startDate: undefined as unknown as Date,
      startTime: "",
      numberOfHours: defaultHours,
      numberOfPassengers: 1,
    },
    mode: "onChange"
  });
  
  // Final booking form
  const fullForm = useForm<BookingRequest>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      startDate: undefined as unknown as Date,
      startTime: "",
      endTime: "",
      numberOfHours: defaultHours,
      numberOfPassengers: 1,
      needsCaptain: boat.crewRequired,
      specialRequests: "",
    },
    mode: "onChange"
  });
  
  // Watch for changes to update endTime
  useEffect(() => {
    const startTime = fullForm.watch("startTime");
    const hours = fullForm.watch("numberOfHours");
    
    if (startTime && hours) {
      try {
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const endHour = startHour + hours;
        
        // Check if end time exceeds 24 hours
        if (endHour >= 24) {
          fullForm.setError("numberOfHours", {
            type: "manual",
            message: "End time cannot be after midnight"
          });
        } else {
          fullForm.clearErrors("numberOfHours");
          const endTime = `${endHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
          fullForm.setValue("endTime", endTime);
        }
      } catch (error) {
        console.error("Error calculating end time:", error);
      }
    }
  }, [fullForm.watch("startTime"), fullForm.watch("numberOfHours")]);

  // Transfer data from initial form to full form
  useEffect(() => {
    if (initialDetails.startDate) {
      fullForm.setValue("startDate", initialDetails.startDate);
    }
    if (initialDetails.startTime) {
      fullForm.setValue("startTime", initialDetails.startTime);
    }
    if (initialDetails.numberOfHours) {
      fullForm.setValue("numberOfHours", initialDetails.numberOfHours);
    }
    if (initialDetails.numberOfPassengers) {
      fullForm.setValue("numberOfPassengers", initialDetails.numberOfPassengers);
    }
  }, [initialDetails, fullForm]);

  // Calculate price based on pricing tiers
  const calculatePrice = () => {
    const hours = fullForm.watch("numberOfHours") || initialForm.watch("numberOfHours") || 0;
    
    // Return 0 if there are no pricing tiers
    if (!boat.pricingTiers || boat.pricingTiers.length === 0) return 0;
    
    // Find an exact match for the number of hours
    const exactTier = boat.pricingTiers.find(tier => tier.hours === hours && tier.isActive);
    if (exactTier) return exactTier.price;
    
    // If no exact match, find the closest tier (prefer higher tier)
    const sortedTiers = [...boat.pricingTiers]
      .filter(tier => tier.isActive)
      .sort((a, b) => a.hours - b.hours);
    
    // Find the closest tier that covers the requested hours
    const closestTier = sortedTiers.find(tier => tier.hours >= hours);
    if (closestTier) return closestTier.price;
    
    // If no higher tier is found, use the highest available tier
    return sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].price : 0;
  };

  // Handle initial details submission (Step 1)
  async function onInitialSubmit(data: InitialBookingDetails) {
    setIsSubmitting(true);
    
    try {
      // Save the initial details
      setInitialDetails(data);
      
      // If user is already logged in, skip directly to final booking step
      if (user) {
        // Set the user as verified and move to final step
        setVerifiedUser(user);
        setCurrentStep("fullForm");
        return;
      }
      
      // For guest users, proceed to phone verification
      setCurrentStep("phoneInput");
    } catch (error) {
      console.error("Error processing initial details:", error);
      toast({
        title: "Error",
        description: "There was a problem with your reservation request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Handle phone verification completion (Step 2)
  function onPhoneVerificationComplete(verifiedUserData: any) {
    // Set the user data
    setVerifiedUser(verifiedUserData);
    
    // Check if this is a new minimal account that needs more details
    const needsMoreDetails = !verifiedUserData.email || 
                           !verifiedUserData.firstName || 
                           !verifiedUserData.lastName;
    
    if (needsMoreDetails) {
      // Show the complete account modal for new users
      setShowCompleteAccountModal(true);
    } else {
      // If user is complete, move to final booking form
      setCurrentStep("fullForm");
    }
  }

  // Handle final form submission (Step 3)
  async function onFinalSubmit(data: BookingRequest) {
    if (!verifiedUser) {
      toast({
        title: "Authentication required",
        description: "Please verify your phone number to complete the booking",
        variant: "destructive",
      });
      setCurrentStep("phoneInput");
      return;
    }
    
    setIsSubmitting(true);
    setCurrentStep("submitting");
    
    try {
      // Finalize the booking
      const result = await finalizeBooking(data, variant, boat.id) as BookingActionResponse;
      
      if (result.success) {
        // Show success message
        toast({
          title: isRequest ? "Booking request submitted" : "Booking created",
          description: result.message || `Your ${isRequest ? "request" : "booking"} has been received`,
        });
        
        // Handle different redirects for different booking types
        if (result.paymentUrl) {
          // For instant bookings with payment URL, direct to Stripe checkout
          window.location.href = result.paymentUrl;
        } else if (result.booking?.id) {
          // For requests with booking ID, go to confirmation page
          router.push(`/profile/bookings/`);
        } else {
          router.refresh();
        }
      } else {
        // Show error message
        toast({
          title: "Booking failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
        
        setCurrentStep("fullForm");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
      setCurrentStep("fullForm");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Go back to previous step
  function goBack() {
    if (currentStep === "phoneInput") {
      setCurrentStep("initialDetails");
    } else if (currentStep === "fullForm") {
      // If user is already logged in, go back to initial details
      // Otherwise, go back to phone verification
      if (user) {
        setCurrentStep("initialDetails");
      } else {
        setCurrentStep("phoneInput");
      }
    }
  }

  // Add onComplete handler for CompleteAccountModal
  async function handleCompleteAccount(data: { firstName: string; lastName: string; email: string; password: string }): Promise<void> {
    try {
      // Call the server action to complete the account
      if (!verifiedUser?.phoneNumber) {
        toast({
          title: "Error",
          description: "No phone number available",
          variant: "destructive",
        });
        return;
      }
      
      const result = await completeUserAccountAfterVerification(
        verifiedUser.phoneNumber,
        data
      );
      
      if (result.success && result.data?.user) {
        // Update the verified user with the new user data
        setVerifiedUser(result.data.user);
        setShowCompleteAccountModal(false);
        setCurrentStep("fullForm");
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleCompleteAccount:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  // Render different steps based on current step
  return (
    <div className="space-y-4">
      {/* Complete Account Modal for new users */}
      {showCompleteAccountModal && (
        <CompleteAccountModal
          isOpen={showCompleteAccountModal}
          onClose={() => setShowCompleteAccountModal(false)}
          onComplete={handleCompleteAccount}
        />
      )}
    
      {/* Initial Step: Date, Time, Duration, Passengers */}
      {currentStep === "initialDetails" && (
        <Form {...initialForm}>
          <form onSubmit={initialForm.handleSubmit(onInitialSubmit)} className="space-y-4">
            {/* Date Picker */}
            <FormField
              control={initialForm.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left", !field.value && "text-gray-500")}
                          aria-label="Select date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <FormField
                control={initialForm.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-label="Select start time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={initialForm.control}
                name="numberOfHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select 
                      onValueChange={v => field.onChange(parseInt(v))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Select duration">
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hourOptions.map(hours => (
                          <SelectItem key={hours} value={hours.toString()}>{hours} hour{hours !== 1 && 's'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passengers */}
            <FormField
              control={initialForm.control}
              name="numberOfPassengers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passengers</FormLabel>
                  <Select onValueChange={v => field.onChange(parseInt(v))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger aria-label="Select number of passengers">
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

            {/* Initial Price Preview */}
            <div className="rounded-lg bg-blue-50 p-3.5 border border-blue-100">
              <div className="flex justify-between">
                <span>Estimated total</span>
                <span className="font-medium">${calculatePrice().toFixed(2)}</span>
              </div>
            </div>

            {/* Continue Button */}
            <Button 
              type="submit" 
              className="w-full text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : user ? "Continue to Book" : "Continue"}
            </Button>
          </form>
        </Form>
      )}

      {/* Phone Verification Step - Only show for non-logged in users */}
      {!user && (currentStep === "phoneInput") && (
        <PhoneVerificationForm 
          onComplete={onPhoneVerificationComplete}
          onBack={goBack}
        />
      )}

      {/* Full Booking Form Step */}
      {currentStep === "fullForm" && (
        <Form {...fullForm}>
          <form onSubmit={fullForm.handleSubmit(onFinalSubmit)} className="space-y-4">
            {/* Back button */}
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className="pl-0 text-primary"
              size="sm"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            
            {/* Booking Summary */}
            <div className="rounded-lg border p-3.5 mb-4">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Date</span>
                  <span>{fullForm.watch("startDate") ? format(fullForm.watch("startDate"), "MMM d, yyyy") : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time</span>
                  <span>{fullForm.watch("startTime") ? format(new Date().setHours(parseInt(fullForm.watch("startTime")), 0), "h:mm a") : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{fullForm.watch("numberOfHours")} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Passengers</span>
                  <span>{fullForm.watch("numberOfPassengers")}</span>
                </div>
              </div>
            </div>

            {/* Captain option - only if not required */}
            {!boat.crewRequired && (
              <FormField
                control={fullForm.control}
                name="needsCaptain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Captain</FormLabel>
                    <div className="flex h-9 rounded-md overflow-hidden border" role="radiogroup">
                      <Button
                        type="button"
                        onClick={() => field.onChange(false)}
                        className={cn(
                          "flex-1 rounded-none",
                          !field.value ? "bg-primary text-white" : "bg-white"
                        )}
                        variant="ghost"
                        aria-checked={!field.value}
                        role="radio"
                      >
                        Self-Drive
                      </Button>
                      <div className="w-px bg-gray-200"></div>
                      <Button
                        type="button"
                        onClick={() => field.onChange(true)}
                        className={cn(
                          "flex-1 rounded-none",
                          field.value ? "bg-primary text-white" : "bg-white"
                        )}
                        variant="ghost"
                        aria-checked={field.value}
                        role="radio"
                      >
                        With Captain
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Special Requests */}
            <FormField
              control={fullForm.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests for the captain?"
                      className="h-20 resize-none"
                      {...field}
                      aria-label="Special requests"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Price Summary */}
            <div className="rounded-lg bg-blue-50 p-3.5 border border-blue-100">
              <h4 className="font-medium mb-2">Price Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total for booking</span>
                  <span className="font-medium">${calculatePrice().toFixed(2)}</span>
                </div>
                {boat.depositAmount && boat.depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Security deposit</span>
                    <span className="font-medium">${boat.depositAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full gap-2 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  {isRequest ? "Submitting Request..." : "Processing Booking..."}
                </div>
              ) : (
                <>
                  {isRequest ? <MessageCircle className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                  {isRequest ? "Request to Book" : "Instant Book"}
                </>
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
} 