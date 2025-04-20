'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { CalendarDays, Users2, Send, ArrowRight, DollarSign, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Move schema outside component to prevent recreation on each render
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  date: z.string().optional(),
  time: z.string().optional(),
  budget: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().optional(),
  captcha: z.string().min(1, 'Please complete the CAPTCHA verification')
});

// Use a custom hook to create animation variants
function useAnimationVariants(prefersReducedMotion: boolean | null) {
  return useMemo(() => ({
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: (delay = 0) => ({ 
      duration: prefersReducedMotion ? 0 : 0.5, 
      delay: prefersReducedMotion ? 0 : delay 
    })
  }), [prefersReducedMotion]);
}

export default function RequestToBook() {
  const prefersReducedMotion = useReducedMotion();
  const fadeInUpAnimation = useAnimationVariants(prefersReducedMotion);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [submitted, setSubmitted] = useState(false);
  const [captchaError, setCaptchaError] = useState("");

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
      captcha: '',
    },
  });

  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    try {
      // First verify the captcha token
      const verifyResponse = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: values.captcha }),
      });
      
      const verifyResult = await verifyResponse.json();
      
      if (!verifyResult.success) {
        setCaptchaError("CAPTCHA verification failed. Please try again.");
        return;
      }
      
      // If verification passes, submit the rest of the form data
      console.log("Form data:", values);
      
      // Here you would typically send the form data to your backend
      // const submitResponse = await fetch('/api/submit-booking', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });
      
      alert('Form submitted successfully!');
      form.reset();
      setSubmitted(true);
      setCaptchaError("");
      
      // Reset the captcha
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setCaptchaError("Verification failed. Please try again.");
    }
  }, [form]);

  const handleCaptchaChange = (token: string | null) => {
    if (token) {
      form.setValue('captcha', token);
      setCaptchaError("");
    } else {
      form.setValue('captcha', '');
      setCaptchaError("CAPTCHA verification failed. Please try again.");
    }
  };

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - use will-change to hint browser about upcoming animations */}
        <motion.div 
          className="text-center mb-8 sm:mb-12 md:mb-16 will-change-transform"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 sm:mb-4">
            Ready for your next adventure?
          </h2>
          <p className="text-sm sm:text-base md:text-md text-primary max-w-2xl mx-auto font-light leading-relaxed">
            Let us help you plan your perfect day on the water
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Form Section - optimize animation with will-change and transform */}
          <motion.div
            className="will-change-transform"
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={fadeInUpAnimation.transition(0.1)}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <h3 className="text-xl sm:text-2xl font-medium text-primary mb-5 sm:mb-8">
                Request to Book
              </h3>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 text-primary">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} className="text-sm sm:text-base h-9 sm:h-10" />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} className="text-sm sm:text-base h-9 sm:h-10" />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} className="text-sm sm:text-base h-9 sm:h-10" />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Preferred Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarDays className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              <Input type="date" className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Time</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Timer className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              <Input type="time" className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Budget</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              <Input className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10" placeholder="5000" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Guests</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users2 className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              <Input type="number" className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10" placeholder="4" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Additional Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about your plans..."
                            className="resize-none text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Add CAPTCHA field */}
                  <FormField
                    control={form.control}
                    name="captcha"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center">
                        <FormControl>
                          <div className="flex justify-center my-2">
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // This is a test key - replace with your actual key in production
                              onChange={(token) => {
                                handleCaptchaChange(token);
                                field.onChange(token || '');
                              }}
                            />
                          </div>
                        </FormControl>
                        {captchaError && (
                          <p className="text-red-700 text-sm mt-1">{captchaError}</p>
                        )}
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full rounded-full border-2 border-[#1E293B] text-primary 
                             hover:bg-[#1E293B] hover:text-white transition-all duration-300 bg-transparent 
                             font-poppins text-sm sm:text-base md:text-lg py-2 sm:py-3 md:py-4 h-auto
                             flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Send Request
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>

          {/* Direct Booking Section - optimize animation */}
          <motion.div
            className="flex items-center justify-center h-full will-change-transform"
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={fadeInUpAnimation.transition(0.3)}
          >
            <div className="max-w-md">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-poppins text-primary mb-4 sm:mb-6">
                Or Book Instantly Online
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-primary font-light leading-relaxed mb-6 sm:mb-8 md:mb-12">
                Browse our fleet and book your perfect yacht directly through our website. 
                Real-time availability, instant confirmation.
              </p>
              <Link href="/boats/search">
                <Button
                  size="lg"
                  className="font-poppins text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 rounded-full border-2 border-[#1E293B] text-primary 
                           hover:bg-[#1E293B] hover:text-white transition-all duration-300 bg-transparent h-auto
                           flex items-center"
                >
                  Explore Available Yachts
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 