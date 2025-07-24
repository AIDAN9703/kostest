"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { toast } from "@/shared/hooks/use-toast";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Phone, CheckCircle, User } from "lucide-react";
import Image from "next/image";
import { z } from "zod";

// Import existing server actions
import { sendOtpToPhoneNumber } from "@/features/auth/actions/verification";
import { handlePhoneAndOtpForBooking, completeUserAccountAfterVerification, signInAction } from "@/features/auth/actions/auth";

type AuthStep = 'choice' | 'phone' | 'verify' | 'user-details' | 'sign-in' | 'complete';

interface BookingAuthFlowProps {
  onAuthComplete: (user: any) => void;
}

// Simple schemas for each step
const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits")
});

const verificationSchema = z.object({
  verificationCode: z.string().length(6, "Verification code must be 6 digits")
});

const userDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  birthday: z.string().min(1, "Birthday is required")
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export default function BookingAuthFlow({ onAuthComplete }: BookingAuthFlowProps) {
  const { update } = useSession();
  const [authStep, setAuthStep] = useState<AuthStep>('choice');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separate forms for each step
  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: '' }
  });

  const userDetailsForm = useForm({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      birthday: ''
    }
  });

  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  });

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      // Preserve current URL with all query parameters for callback
      const currentUrl = new URL(window.location.href);
      const callbackUrl = currentUrl.toString();
      
      await signIn("google", { 
        callbackUrl: callbackUrl,
        redirect: true
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handlePhoneSubmit = async (data: { phoneNumber: string }) => {
    setIsSubmitting(true);
    try {
      setPhoneNumber(data.phoneNumber);
      
      const result = await sendOtpToPhoneNumber(data.phoneNumber);
      
      if (result.success) {
        setVerificationCode(''); // Clear verification code state
        setAuthStep('verify');
        toast({
          title: "Code sent",
          description: "We've sent a verification code to your phone",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Phone submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsSubmitting(true);
    try {
      const result = await handlePhoneAndOtpForBooking(phoneNumber, verificationCode);
      
      if (result.success) {
        if (result.data?.existingUser) {
          // User already exists and is now signed in
          setAuthStep('complete');
          onAuthComplete(result.data.user);
          toast({
            title: "Welcome back!",
            description: "You have been successfully signed in",
          });
        } else {
          // New user - need to collect additional details
          setAuthStep('user-details');
          toast({
            title: "Phone verified",
            description: "Please complete your account details",
          });
        }
      } else {
        toast({
          title: "Verification failed",
          description: result.error || "Invalid verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserDetailsSubmit = async (data: z.infer<typeof userDetailsSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await completeUserAccountAfterVerification(phoneNumber, data);
      
      if (result.success) {
        // Update session to reflect new auth state
        await update();
        setAuthStep('complete');
        onAuthComplete(result.data?.user);
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        });
      } else {
        if (result.error?.includes("already exists")) {
          setAuthStep('sign-in');
          toast({
            title: "Account exists",
            description: "Please sign in to your existing account",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create account",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('User details submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await signInAction(data);
      
      if (result.success) {
        // Update session to reflect new auth state
        await update();
        setAuthStep('complete');
        onAuthComplete({ authenticated: true });
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in",
        });
      } else {
        toast({
          title: "Sign in failed",
          description: result.error || "Please check your credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Choice Step
  if (authStep === 'choice') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Complete your booking</p>
          <p className="text-sm text-gray-600">We just need to verify your details to proceed</p>
        </div>
        
        <div className="space-y-4">
          {/* Phone Number Input */}
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-3">
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Continue with phone number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={isSubmitting || !phoneForm.watch('phoneNumber')}
                className="w-full h-12"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending code...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Send verification code</span>
                  </div>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full h-12 flex items-center justify-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <div className="relative w-5 h-5">
                  <Image src="/icons/google.svg" alt="Google" fill className="object-contain" />
                </div>
                <span className="font-medium text-gray-700">Continue with Google</span>
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  // Phone Step
  if (authStep === 'phone') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Verify your phone number</p>
          <p className="text-sm text-gray-600">We'll send a quick code to confirm it's you</p>
        </div>
        
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending code...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Send verification code</span>
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setAuthStep('choice')}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to options
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  // Verification Step - Simple input box, no form
  if (authStep === 'verify') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Enter verification code</p>
          <p className="text-sm text-gray-600 mb-1">Code sent to</p>
          <p className="text-sm font-medium text-gray-900">{phoneNumber}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Verification Code</label>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              className="h-12 text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
            />
          </div>
          
          <Button
            onClick={handleVerificationSubmit}
            disabled={isSubmitting || verificationCode.length !== 6}
            className="w-full h-12"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Continue to booking"
            )}
          </Button>

          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => handlePhoneSubmit({ phoneNumber })}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Didn't receive a code? Resend
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthStep('phone');
                phoneForm.setValue('phoneNumber', phoneNumber);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Change number
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User Details Step
  if (authStep === 'user-details') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Complete your details</p>
          <p className="text-sm text-gray-600">We need a few details to finalize your booking</p>
        </div>
        
        <Form {...userDetailsForm}>
          <form onSubmit={userDetailsForm.handleSubmit(handleUserDetailsSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={userDetailsForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First name"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userDetailsForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last name"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={userDetailsForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={userDetailsForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Create Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Choose a secure password"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={userDetailsForm.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Birthday</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Complete booking setup</span>
                </div>
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  // Sign In Step
  if (authStep === 'sign-in') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Welcome back</p>
          <p className="text-sm text-gray-600">Sign in to continue with your booking</p>
        </div>
        
        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(handleSignInSubmit)} className="space-y-4">
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signInForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Continue to booking"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setAuthStep('choice')}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to options
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  // Complete Step
  if (authStep === 'complete') {
    return (
      <div className="py-4 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900 mb-2">All set!</p>
        <p className="text-sm text-gray-600">You can now complete your booking</p>
      </div>
    );
  }

  return null;
} 