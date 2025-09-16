'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Users, DollarSign, Timer, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { createGeneralInquiry, GeneralInquiryInput } from '@/features/bookings/actions/inquiry';
import { toast } from '@/shared/hooks/use-toast';

import { ghlWebhookService } from "@/shared/services/ghl-webhook.service";

// Form schema with validation rules
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  date: z.string().optional(),
  time: z.string().optional(),
  budget: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().optional(),
  termsAgreed: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  smsConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to receive SMS messages to submit this form',
  }),

});

// Reusable animation variants for consistency with other components
const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ 
    duration: 0.5, 
    delay 
  })
};


export default function RequestToBook() {
  const prefersReducedMotion = useReducedMotion();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      budget: '',
      guests: '',
      message: '',
      termsAgreed: false,
      smsConsent: false,

    },
  });

  // Function to trigger GHL webhook
  const triggerGHLWebhook = async (formData: z.infer<typeof formSchema>) => {
    try {
      const webhookPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date || '',
        time: formData.time || '',
        budget: formData.budget || '',
        guests: formData.guests || '',
        message: formData.message || '',
        sms_consent: formData.smsConsent || false,
        source: 'KOS Yacht Club - Request to Book Form',
        lead_type: 'Charter Inquiry',
        submitted_at: new Date().toISOString()
      };

      await ghlWebhookService.sendInquiry(webhookPayload);
    } catch (error) {
      console.warn('GHL webhook error:', error);
      // Don't throw error - we don't want to fail the whole form if webhook fails
    }
  };

  // Form submission handler
  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      

      
      // Call the server action with our form data
      // termsAccepted is true only if both boxes are checked
      const result = await createGeneralInquiry({
        name: values.name,
        email: values.email,
        phone: values.phone,
        date: values.date,
        time: values.time,
        budget: values.budget,
        guests: values.guests,
        message: values.message,
        termsAccepted: values.termsAgreed && (values.smsConsent || false)
      });
      
      if (result.success) {
        // Trigger GHL webhook after successful form submission
        await triggerGHLWebhook(values);
        
        toast({
          title: "Request Submitted",
          description: result.message || "Your inquiry has been submitted. We'll contact you soon!",
        });
        
        form.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "There was a problem with your submission. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);



  return (
    <section className="py-10 sm:py-16 md:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
          <h2 className="font-poppins font-medium text-3xl sm:text-4xl md:text-5xl text-primary leading-tight mb-4">
            Ready for your next adventure?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg font-poppins font-light max-w-2xl mx-auto">
            Let us help you plan your perfect day on the water
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form Section */}
          <motion.div 
            className="lg:col-span-7 bg-white rounded-2xl shadow-lg p-6 sm:p-8"
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50 h-12"
                            placeholder="John Smith"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50 h-12" 
                            placeholder="you@example.com"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50 h-12"
                          placeholder="+1 (555) 000-0000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50 h-12 text-base w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50 h-12 text-base w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Budget</FormLabel>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                          <FormControl>
                            <Input
                              className="rounded-lg border-gray-200 pl-10 focus:border-primary focus:ring-primary/20 bg-gray-50 h-12"
                              placeholder="5000"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Guests</FormLabel>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                          <FormControl>
                            <Input
                              type="number"
                              className="rounded-lg border-gray-200 pl-10 focus:border-primary focus:ring-primary/20 bg-gray-50 h-12"
                              placeholder="4"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us more about your plans..."
                          className="resize-none min-h-[120px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="termsAgreed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal text-gray-700">
                          I agree to the{' '}
                          <Link href="/terms-of-service" className="text-primary hover:underline">
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage className="text-xs" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* SMS Consent */}
                <FormField
                  control={form.control}
                  name="smsConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal text-gray-700">
                          By checking this box, you agree to receive recurring SMS messages from KOS Yachts about bookings, promotions, and events. Message & data rates may apply. Text STOP to unsubscribe, HELP for help.
                        </FormLabel>
                        <FormMessage className="text-xs" />
                      </div>
                    </FormItem>
                  )}
                />

                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <Button 
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Request'}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>

          {/* Divider - Horizontal on mobile, Vertical on desktop */}
          <div className="relative flex items-center justify-center lg:flex-col">
            <div className="w-full h-px lg:h-full lg:w-px bg-gray-200"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-sm font-medium bg-white px-4">or</span>
            </div>
          </div>

          {/* Direct Booking Info */}
          <motion.div 
            className="lg:col-span-4 flex items-center justify-center"
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex flex-col justify-center items-center text-center">
              <h3 className="font-poppins text-2xl sm:text-3xl text-primary mb-4">
                Book Instantly Online
              </h3>
              <p className="text-gray-600 text-base mb-8">
                Browse our fleet and book your perfect yacht directly through our website. 
                Real-time availability, instant confirmation.
              </p>
              
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className="flex justify-center"
              >
                <Link href="/boats/search">
                  <Button
                    variant="default"
                    size="lg"
                    className="group h-12"
                  >
                    <span>Explore Available Yachts</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}