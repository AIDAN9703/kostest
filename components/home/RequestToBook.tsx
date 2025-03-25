'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { CalendarDays, Users2, Clock, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  date: z.string().min(1, 'Please select a date'),
  guests: z.string().min(1, 'Please enter number of guests'),
  duration: z.string().min(1, 'Please enter duration'),
  message: z.string().optional(),
});

// Reusable animation variants for DRY code
const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ 
    duration: 0.5, 
    delay 
  })
};

export default function RequestToBook() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      date: '',
      guests: '',
      duration: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle form submission
  }

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 sm:mb-4">
            Ready to set Sail?
          </h2>
          <p className="text-sm sm:text-base md:text-md text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Let us help you plan your perfect day on the water
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Form Section */}
          <motion.div
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={fadeInUpAnimation.transition(0.1)}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <h3 className="text-xl sm:text-2xl font-medium text-[#1E293B] mb-5 sm:mb-8">
                Request to Book
              </h3>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Full Name</FormLabel>
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
                          <FormLabel className="text-sm sm:text-base">Email</FormLabel>
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
                        <FormLabel className="text-sm sm:text-base">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} className="text-sm sm:text-base h-9 sm:h-10" />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="col-span-2 sm:col-span-1">
                          <FormLabel className="text-sm sm:text-base">Preferred Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarDays className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              <Input type="date" className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10" {...field} />
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
                              <Users2 className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              <Input type="number" className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10" placeholder="4" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Hours</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
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
                        <FormLabel className="text-sm sm:text-base">Additional Details (Optional)</FormLabel>
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

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full rounded-full border-2 border-[#1E293B] text-[#1E293B] 
                             hover:bg-[#1E293B] hover:text-white transition-all duration-300 bg-transparent 
                             font-serif text-sm sm:text-base md:text-lg py-2 sm:py-3 md:py-4 h-auto
                             flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Send Request
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>

          {/* Direct Booking Section */}
          <motion.div
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={fadeInUpAnimation.transition(0.3)}
            className="flex items-center justify-center h-full"
          >
            <div className="max-w-md">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1E293B] mb-4 sm:mb-6">
                Or Book Instantly Online
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed mb-6 sm:mb-8 md:mb-12">
                Browse our fleet and book your perfect yacht directly through our website. 
                Real-time availability, instant confirmation.
              </p>
              <Link href="/boats/search">
                <Button
                  size="lg"
                  className="font-serif text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 rounded-full border-2 border-[#1E293B] text-[#1E293B] 
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