"use client";

import { useState, useEffect } from "react";
import { Boat } from "@/lib/types";
import { User } from "next-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bookingRequestSchema } from "@/lib/validations";
import type { z } from "zod";
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

type FormData = z.infer<typeof bookingRequestSchema>;

interface BookingRequestFormProps {
  boat: Boat;
  user: User | undefined;
}

const defaultValues = {
  isMultiDay: false,
  startDate: undefined,
  startTime: "",
  endTime: "",
  numberOfPassengers: 1,
  specialRequests: "",
  needsCaptain: false,
  numberOfHours: undefined,
  endDate: undefined,
} as const;

export default function BookingRequestForm({ boat, user }: BookingRequestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof bookingRequestSchema>>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      ...defaultValues,
      needsCaptain: boat.crewRequired,
    },
  });

  const isMultiDay = form.watch("isMultiDay");
  const startTime = form.watch("startTime");
  const numberOfHours = form.watch("numberOfHours");

  useEffect(() => {
    if (!isMultiDay && startTime && numberOfHours) {
      const [hours] = startTime.split(":").map(Number);
      const endHour = hours + numberOfHours;
      
      if (endHour > 21) {
        form.setError("numberOfHours", {
          type: "manual",
          message: "Booking cannot extend beyond 9 PM"
        });
        return;
      }
      
      form.setValue("endTime", `${endHour.toString().padStart(2, "0")}:00`);
    }
  }, [startTime, numberOfHours, isMultiDay, form]);

  const calculateTotalAmount = (data: Partial<FormData>) => {
    if (!data.startDate) return 0;

    if (data.isMultiDay) {
      if (!data.endDate) return 0;
      const days = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
      return days * boat.fullDayPrice!;
    } else {
      if (!data.numberOfHours) return 0;
      return data.numberOfHours * boat.hourlyRate;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to make a booking request.",
        variant: "destructive",
      });
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boatId: boat.id,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phoneNumber,
          ...data,
          totalAmount: calculateTotalAmount(data),
          depositAmount: boat.depositAmount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit booking request");
      }

      toast({
        title: "Request submitted",
        description: "Your booking request has been submitted successfully.",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit booking request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time options from 9 AM to 9 PM
  const timeOptions = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 9;
    return {
      value: `${hour.toString().padStart(2, "0")}:00`,
      label: format(new Date().setHours(hour, 0), "h:mm a"),
    };
  });

  return (
    <Card className="p-6">
      <div className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">Request to Book</h2>
        <p className="text-sm text-gray-500">
          Fill out the form below to request a booking. We'll get back to you within 24 hours.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Booking Type Selection */}
          <FormField
            control={form.control}
            name="isMultiDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking Type</FormLabel>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={!field.value ? "default" : "outline"}
                    onClick={() => {
                      field.onChange(false);
                      form.resetField("endDate");
                    }}
                  >
                    Single Day
                  </Button>
                  <Button
                    type="button"
                    variant={field.value ? "default" : "outline"}
                    onClick={() => {
                      field.onChange(true);
                      form.resetField("numberOfHours");
                    }}
                  >
                    Multi Day
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Selection */}
          <div className={cn("grid gap-4", isMultiDay ? "grid-cols-2" : "grid-cols-1")}>
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isMultiDay ? "Start Date" : "Date"}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
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

            {isMultiDay && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => !form.getValues("startDate") || date <= form.getValues("startDate")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Time Selection */}
          <div className={cn("grid gap-4", isMultiDay ? "grid-cols-2" : "grid-cols-1")}>
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isMultiDay ? (
              <FormField
                control={form.control}
                name="numberOfHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={12}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          if (value !== undefined) {
                            const [hours] = (form.getValues("startTime") || "09:00").split(":").map(Number);
                            if (hours + value > 21) {
                              form.setError("numberOfHours", {
                                type: "manual",
                                message: "Booking cannot extend beyond 9 PM"
                              });
                              return;
                            }
                          }
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      Enter hours between 1-12 (must end by 9 PM)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions
                          .filter(time => {
                            if (!form.getValues("startTime")) return true;
                            return time.value > form.getValues("startTime");
                          })
                          .map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="numberOfPassengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Passengers</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={boat.numOfPassengers}
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">
                  Maximum {boat.numOfPassengers} passengers
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {!boat.crewRequired && (
            <FormField
              control={form.control}
              name="needsCaptain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you need a captain?</FormLabel>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={field.value ? "default" : "outline"}
                      onClick={() => field.onChange(true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={!field.value ? "default" : "outline"}
                      onClick={() => field.onChange(false)}
                    >
                      No
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="specialRequests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requests or requirements..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("startDate") && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-semibold">
                  ${calculateTotalAmount(form.getValues())}
                </span>
              </div>
              {boat.depositAmount && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Required Deposit</span>
                  <span>${boat.depositAmount}</span>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Request to Book"}
          </Button>

          {!user && (
            <p className="text-center text-sm text-gray-500">
              Please{" "}
              <Button
                variant="link"
                className="p-0 text-primary"
                onClick={() => router.push("/sign-in")}
              >
                sign in
              </Button>{" "}
              to make a booking request
            </p>
          )}
        </form>
      </Form>
    </Card>
  );
} 