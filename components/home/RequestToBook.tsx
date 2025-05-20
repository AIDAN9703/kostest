'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Users, DollarSign, Timer, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { createGeneralInquiry, GeneralInquiryInput } from '@/lib/actions/booking/inquiry';
import { toast } from '@/hooks/use-toast';

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
  captcha: z.string().min(1, 'Please complete the CAPTCHA verification')
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
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaError, setCaptchaError] = useState("");
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
      captcha: '',
    },
  });

  // Form submission handler
  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Verify the captcha token server-side 
      const captchaResponse = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: values.captcha })
      });
      
      const captchaResult = await captchaResponse.json();
      
      if (!captchaResult.success) {
        setCaptchaError("CAPTCHA verification failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      // Call the server action with our form data
      const result = await createGeneralInquiry({
        name: values.name,
        email: values.email,
        phone: values.phone,
        date: values.date,
        time: values.time,
        budget: values.budget,
        guests: values.guests,
        message: values.message,
        termsAccepted: values.termsAgreed
      });
      
      if (result.success) {
        toast({
          title: "Request Submitted",
          description: result.message || "Your inquiry has been submitted. We'll contact you soon!",
        });
        
        form.reset();
        setCaptchaError("");
        
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
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

  // Handle CAPTCHA change
  const handleCaptchaChange = useCallback((token: string | null) => {
    if (token) {
      form.setValue('captcha', token);
      setCaptchaError("");
    } else {
      form.setValue('captcha', '');
      setCaptchaError("CAPTCHA verification failed. Please try again.");
    }
  }, [form]);

  return (
    <section className="py-6 sm:py-10 relative overflow-hidden">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-6"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
          <h2 className="font-poppins font-medium text-3xl sm:text-4xl md:text-5xl text-primary leading-tight mb-2">
            Ready for your next adventure?
          </h2>
          <p className="text-gray-600 text-lg font-poppins font-light">
            Let us help you plan your perfect day on the water
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-start">
          {/* Form Section */}
          <motion.div 
            className="lg:col-span-7"
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
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
                            className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20" 
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
                          className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
                          placeholder="+1 (555) 000-0000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Date</FormLabel>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <FormControl>
                            <Input
                              type="date"
                              className="rounded-xl border-gray-200 pl-10 focus:border-primary focus:ring-primary/20"
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
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Time</FormLabel>
                        <div className="relative">
                          <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <FormControl>
                            <Input
                              type="time"
                              className="rounded-xl border-gray-200 pl-10 focus:border-primary focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Budget</FormLabel>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <FormControl>
                            <Input
                              className="rounded-xl border-gray-200 pl-10 focus:border-primary focus:ring-primary/20"
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
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <FormControl>
                            <Input
                              type="number"
                              className="rounded-xl border-gray-200 pl-10 focus:border-primary focus:ring-primary/20"
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
                          className="resize-none min-h-[80px] rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Terms and Services Checkbox */}
                <FormField
                  control={form.control}
                  name="termsAgreed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal text-gray-700">
                          I agree to the{' '}
                          <Link href="/terms" className="text-primary hover:underline">
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
                
                {/* CAPTCHA */}
                <FormField
                  control={form.control}
                  name="captcha"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormControl>
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with real key in production
                          onChange={(token) => {
                            handleCaptchaChange(token);
                            field.onChange(token || '');
                          }}
                        />
                      </FormControl>
                      {captchaError && (
                        <p className="text-red-500 text-xs mt-1">{captchaError}</p>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <Button 
                    type="submit"
                    className="w-full rounded-xl bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Request'}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>

          {/* Direct Booking Info */}
          <motion.div 
            className="lg:col-span-5 flex items-center justify-center h-full"
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="h-full flex flex-col justify-center items-center text-center">
              <div className="rounded-2xl max-w-md mx-auto">
                <h3 className="font-poppins text-2xl sm:text-3xl text-primary mb-4">
                 Or Book Directly Online
                </h3>
                <p className="text-gray-600 mb-6">
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
                      className="group rounded-xl bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all"
                    >
                      <span>Explore Available Yachts</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}