'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { CalendarDays, Users, DollarSign, Timer, ArrowRight, Globe, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGeneralInquiry } from '@/lib/actions/booking/inquiry';
import { toast } from '@/hooks/use-toast';

// Form schema with validation rules for term charter inquiries
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  destination: z.string().optional(),
  guests: z.string().optional(),
  budget: z.string().optional(),
  accommodations: z.string().optional(),
  message: z.string().optional(),
  termsAgreed: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),

});

export default function RequestTermCharter() {

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      startDate: '',
      duration: '',
      destination: '',
      guests: '',
      budget: '',
      accommodations: '',
      message: '',
      termsAgreed: false,

    },
  });

  // Form submission handler
  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      

      
      // Format the message to include term charter specific fields
      const formattedMessage = `
Term Charter Inquiry:
- Preferred Start Date: ${values.startDate || 'Not specified'}
- Duration: ${values.duration || 'Not specified'}
- Destination: ${values.destination || 'Not specified'}
- Accommodations Needed: ${values.accommodations || 'Not specified'}
- Additional Details: ${values.message || 'None provided'}
      `.trim();
      
      // Call the server action with our form data
      const result = await createGeneralInquiry({
        name: values.name,
        email: values.email,
        phone: values.phone,
        date: values.startDate,
        time: values.duration, // Repurposing the time field for duration
        budget: values.budget,
        guests: values.guests,
        message: formattedMessage,
        termsAccepted: values.termsAgreed
      });
      
      if (result.success) {
        toast({
          title: "Request Submitted",
          description: "Your term charter inquiry has been submitted. Our specialists will contact you soon!",
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
    <div className="max-w-6xl mx-auto">
     

      {/* Form Section */}
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary mb-2">Contact Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
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
                          className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20" 
                          placeholder="you@example.com"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
                          placeholder="+1 (555) 000-0000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Charter Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary mb-2">Charter Details</h3>
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Preferred Start Date</FormLabel>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <FormControl>
                          <Input
                            type="date"
                            className="rounded-lg border-gray-200 pl-10 focus:border-primary focus:ring-primary/20"
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
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Charter Duration</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3-6 days">3-6 days</SelectItem>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="2 weeks">2 weeks</SelectItem>
                            <SelectItem value="3+ weeks">3+ weeks</SelectItem>
                            <SelectItem value="Flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Number of Guests</FormLabel>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <FormControl>
                            <Input
                              type="number"
                              className="rounded-lg border-gray-200 pl-10 focus:border-primary focus:ring-primary/20"
                              placeholder="4"
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
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Budget Range</FormLabel>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="rounded-lg border-gray-200 pl-10 focus:border-primary focus:ring-primary/20">
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="$0-$10,000">$0-$10,000</SelectItem>
                                <SelectItem value="$10,000-$25,000">$10,000-$25,000</SelectItem>
                                <SelectItem value="$25,000-$50,000">$25,000-$50,000</SelectItem>
                                <SelectItem value="$50,000-$100,000">$50,000-$100,000</SelectItem>
                                <SelectItem value="$100,000+">$100,000+</SelectItem>
                                <SelectItem value="Flexible">Flexible</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary mb-2">Additional Details</h3>
              
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Preferred Destination</FormLabel>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="rounded-lg border-gray-200 pl-10 focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bahamas">Bahamas</SelectItem>
                            <SelectItem value="Caribbean">Caribbean Islands</SelectItem>
                            <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                            <SelectItem value="Florida Keys">Florida Keys</SelectItem>
                            <SelectItem value="Other">Other (specify in message)</SelectItem>
                            <SelectItem value="Flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accommodations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Accommodation Preferences</FormLabel>
                    <div className="relative">
                      <Anchor className="absolute left-3 top-3 h-4 w-4 text-primary" />
                      <FormControl>
                        <Textarea 
                          placeholder="Number of cabins needed, preferred layout, etc."
                          className="resize-none min-h-[80px] rounded-lg border-gray-200 pl-10 focus:border-primary focus:ring-primary/20"
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
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Additional Requests</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Special requests, activities, dietary requirements, etc."
                        className="resize-none min-h-[80px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
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
            


            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Term Charter Request'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 