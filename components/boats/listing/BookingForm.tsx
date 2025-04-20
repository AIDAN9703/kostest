"use client";

import { useState, useEffect } from "react";
import { Boat, BookingRequest } from "@/types/types";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MessageCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bookingRequestSchema } from "@/lib/validations";
import { createBookingRequest, createInstantBooking } from "@/lib/actions/booking";
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

export default function BookingForm({ variant, boat, user }: BookingFormProps) {
  const router = useRouter();
  const isRequest = variant === "REQUEST";
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  
  const form = useForm<BookingRequest>({
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
    mode: "onChange" // This enables validation on form field changes
  });

  // Calculate price based on hourly rate
  const calculatePrice = () => {
    const hours = form.watch("numberOfHours") || 0;
    return hours * (boat.hourlyRate || 0);
  };

  // Watch for changes to update endTime
  useEffect(() => {
    const startTime = form.watch("startTime");
    const hours = form.watch("numberOfHours");
    
    if (startTime && hours) {
      try {
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const endHour = startHour + hours;
        
        // Check if end time exceeds 24 hours
        if (endHour >= 24) {
          form.setError("numberOfHours", {
            type: "manual",
            message: "End time cannot be after midnight"
          });
        } else {
          form.clearErrors("numberOfHours");
          const endTime = `${endHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
          form.setValue("endTime", endTime);
        }
      } catch (error) {
        console.error("Error calculating end time:", error);
      }
    }
  }, [form.watch("startTime"), form.watch("numberOfHours")]);

  // Form submission handler
  async function onSubmit(data: BookingRequest) {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book this boat",
        variant: "destructive",
      });
      router.push("/sign-in");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the appropriate server action based on variant
      const serverAction = isRequest 
        ? createBookingRequest 
        : createInstantBooking;
      
      // Call the server action with the form data
      const result = await serverAction({
        ...data,
        boatId: boat.id,
      }) as BookingActionResponse;
      
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
        
        // Handle auth error
        if (result.errorType === "AUTH") {
          router.push("/sign-in");
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Date Picker */}
        <FormField
          control={form.control}
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
            control={form.control}
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
            control={form.control}
            name="numberOfHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select 
                  onValueChange={v => {
                    const value = parseInt(v);
                    
                    // Check if this duration would result in ending after 24:00
                    const startTime = form.getValues("startTime");
                    if (startTime) {
                      const [startHour] = startTime.split(":").map(Number);
                      if (startHour + value >= 24) {
                        form.setError("numberOfHours", {
                          message: "End time cannot be after midnight"
                        });
                      } else {
                        field.onChange(value);
                      }
                    } else {
                      field.onChange(value);
                    }
                  }} 
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
          control={form.control}
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

        {/* Captain option - only if not required */}
        {!boat.crewRequired && (
          <FormField
            control={form.control}
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
          control={form.control}
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

        {/* Submit Button Section */}
        {user ? (
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
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Sign in to book this boat
            </p>
            <Button 
              type="button" 
              className="w-full text-white"
              onClick={() => router.push("/sign-in")}
            >
              Sign In to Continue
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
} 