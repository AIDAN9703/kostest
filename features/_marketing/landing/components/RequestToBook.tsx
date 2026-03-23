"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Users, ArrowRight } from "lucide-react";
import { createGeneralInquiry } from "@/features/inquiries/inquiry.actions";
import { toast } from "@/shared/lib/hooks/use-toast";
import { ghlWebhookService } from "@/shared/lib/services/ghl-webhook.service";
import {
  requestToBookSchema,
  type RequestToBookFormData,
} from "@/shared/lib/validation/inquiry";

//UI Imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const inputClass =
  "h-11 rounded-xl border-border bg-muted/10 focus-visible:ring-2 focus-visible:ring-ring";

export default function RequestToBook() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<RequestToBookFormData>({
    resolver: zodResolver(requestToBookSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      budget: "",
      guests: "",
      message: "",
      termsAgreed: false,
      smsConsent: false,
    },
  });

  const onSubmit = useCallback(
    async (values: RequestToBookFormData) => {
      try {
        setIsSubmitting(true);

        const result = await createGeneralInquiry({
          name: values.name,
          email: values.email,
          phone: values.phone,
          date: values.date || undefined,
          time: values.time || undefined,
          budget: values.budget || undefined,
          guests: values.guests || undefined,
          message: values.message || undefined,
          termsAccepted: values.termsAgreed && values.smsConsent,
        });

        if (result.success) {
          await ghlWebhookService.sendInquiry({
            name: values.name,
            email: values.email,
            phone: values.phone,
            date: values.date || "",
            time: values.time || "",
            budget: values.budget || "",
            guests: values.guests || "",
            message: values.message || "",
            sms_consent: values.smsConsent,
            source: "KOS Yacht Club - Request to Book Form",
            lead_type: "Charter Inquiry",
            submitted_at: new Date().toISOString(),
          });

          toast({
            title: "Request Submitted",
            description: result.message ?? "We'll contact you soon!",
          });
          form.reset();
        } else {
          toast({
            title: "Error",
            description: result.error ?? "Please try again.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form],
  );

  return (
    <section className="py-10 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left sm:text-center mb-6 sm:mb-12">
          <h2 className="text-primary text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Ready for your next adventure?
          </h2>
          <p className="hidden lg:block text-gray-500 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Let us help you plan your perfect day on the water
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-primary text-xl sm:text-2xl font-bold">
                  Request a Quote
                </CardTitle>
                <CardDescription>
                  Share your details and we&apos;ll get back within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                className={inputClass}
                                placeholder="John Smith"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                className={inputClass}
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              className={inputClass}
                              placeholder="+1 (555) 000-0000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className={inputClass}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Time</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                className={inputClass}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget</FormLabel>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              <FormControl>
                                <Input
                                  className={`${inputClass} pl-10`}
                                  placeholder="e.g. 5000"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guests</FormLabel>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  className={`${inputClass} pl-10`}
                                  placeholder="4"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              className={`${inputClass} min-h-[100px] resize-none`}
                              placeholder="Tell us about your plans..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsAgreed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer text-foreground">
                            I agree to the{" "}
                            <Link
                              href="/terms-of-service"
                              className="text-primary hover:underline"
                            >
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy"
                              className="text-primary hover:underline"
                            >
                              Privacy Policy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smsConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer text-foreground">
                            I agree to receive SMS updates. Message & data rates
                            may apply.
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 rounded-xl"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Request"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="relative flex items-center lg:flex-col">
            <div className="flex-1 h-px lg:h-full lg:w-px bg-border" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-sm text-muted-foreground">
              or
            </span>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
            <h3 className="text-primary text-xl font-bold mb-2">
              Book Instantly Online
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Browse our fleet and book directly. Real-time availability,
              instant confirmation.
            </p>
            <Link href="/boats/search" className="w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full h-12 rounded-xl group"
              >
                Explore Available Yachts
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
