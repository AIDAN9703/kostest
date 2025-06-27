"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { Loader2, Phone, CheckCircle, User } from "lucide-react";
import Image from "next/image";

// Import existing server actions and schemas
import { phoneVerificationSchema, signUpSchema, signInSchema } from "@/lib/validation/validations";
import { sendOtpToPhoneNumber } from "@/lib/actions/auth/verification";
import { handlePhoneAndOtpForBooking, completeUserAccountAfterVerification, signInAction } from "@/lib/actions/auth/auth";
import { googleSignIn } from "@/lib/actions/auth/google-auth";

type AuthStep = 'choice' | 'phone' | 'verify' | 'user-details' | 'sign-in' | 'complete';

interface BookingAuthFlowProps {
  onAuthComplete: (user: any) => void;
}

interface PhoneFormData {
  phoneNumber: string;
}

interface VerificationFormData {
  phoneNumber: string;
  verificationCode: string;
}

interface UserDetailsFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
}

interface SignInFormData {
  email: string;
  password: string;
}

export default function BookingAuthFlow({ onAuthComplete }: BookingAuthFlowProps) {
  const [authStep, setAuthStep] = useState<AuthStep>('choice');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);

  // Phone number form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneVerificationSchema.pick({ phoneNumber: true })),
    defaultValues: { phoneNumber: '' }
  });

  // Verification form  
  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: { phoneNumber: '', verificationCode: '' },
    mode: "onChange"
  });

  // User details form (sign up)
  const userDetailsForm = useForm<UserDetailsFormData>({
    resolver: zodResolver(signUpSchema.omit({ phoneNumber: true, rememberMe: true })),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      birthday: ''
    }
  });

  // Sign in form
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema.omit({ rememberMe: true })),
    defaultValues: { email: '', password: '' }
  });

  // Ensure verification code field is clean when entering verify step
  useEffect(() => {
    if (authStep === 'verify') {
      // Small delay to ensure form is ready
      setTimeout(() => {
        verificationForm.setValue('verificationCode', '');
        verificationForm.clearErrors('verificationCode');
      }, 100);
    }
  }, [authStep, verificationForm]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signIn("google", { 
        callbackUrl: window.location.href,
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

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true);
    try {
      setPhoneNumber(data.phoneNumber);
      
      // Use existing server action to send verification code
      const result = await sendOtpToPhoneNumber(data.phoneNumber);
      
      if (result.success) {
        // Reset the verification form completely and set only the phone number
        verificationForm.reset({
          phoneNumber: data.phoneNumber,
          verificationCode: ''
        });
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

  const handleVerificationSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);
    try {
      // Use existing server action to verify OTP
      const result = await handlePhoneAndOtpForBooking(data.phoneNumber, data.verificationCode);
      
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

  const handleUserDetailsSubmit = async (data: UserDetailsFormData) => {
    setIsSubmitting(true);
    try {
      // Use existing function to complete user account after phone verification
      const result = await completeUserAccountAfterVerification(phoneNumber, data);
      
      if (result.success) {
        setAuthStep('complete');
        onAuthComplete(result.data?.user);
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        });
      } else {
        // Handle case where user might already exist
        if (result.error?.includes("already exists")) {
          setHasExistingAccount(true);
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

  const handleSignInSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    try {
      const result = await signInAction(data);
      
      if (result.success) {
        setAuthStep('complete');
        // For sign in, we don't get the user object directly, but the session is established
        // We'll pass a basic user object to indicate success
        onAuthComplete({ authenticated: true });
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in",
        });
      } else {
        if (result.data?.redirectUrl) {
          toast({
            title: "Verification required",
            description: result.data.message || "Please verify your phone number",
          });
          // Could redirect to verification page or handle inline
        } else {
          toast({
            title: "Sign in failed",
            description: result.error || "Please check your credentials",
            variant: "destructive"
          });
        }
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

  // Choice Step - Google or Phone
  if (authStep === 'choice') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Complete your booking</p>
          <p className="text-sm text-gray-600">Sign in or create an account to continue</p>
        </div>
        
        <div className="space-y-4">
          <form action={googleSignIn}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 flex items-center justify-center gap-2 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 disabled:opacity-50"
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
          </form>

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <Button
            onClick={() => setAuthStep('phone')}
            variant="outline"
            className="w-full h-12 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            Continue with Phone
          </Button>
          
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
          <p className="text-lg font-semibold text-gray-900 mb-1">Enter your phone number</p>
          <p className="text-sm text-gray-600">We'll send you a verification code</p>
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
                      className="h-12 bg-white/80 backdrop-blur-sm"
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

  // Verification Step
  if (authStep === 'verify') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Verify your phone</p>
          <p className="text-sm text-gray-600 mb-1">Enter the code sent to</p>
          <p className="text-sm font-medium text-gray-900">{phoneNumber}</p>
        </div>
        
        <Form {...verificationForm}>
          <form onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)} className="space-y-4">
            <FormField
              control={verificationForm.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="h-12 text-center text-lg tracking-widest bg-white/80 backdrop-blur-sm"
                      maxLength={6}
                      autoFocus
                      autoComplete="one-time-code"
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isSubmitting || verificationForm.watch('verificationCode').length !== 6}
              className="w-full h-12"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify code"
              )}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => handlePhoneSubmit({ phoneNumber })}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Didn't receive a code? Resend
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    verificationForm.reset({
                      phoneNumber: '',
                      verificationCode: ''
                    });
                    setAuthStep('phone');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to phone number
                </button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // User Details Step (for new users)
  if (authStep === 'user-details') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Complete your account</p>
          <p className="text-sm text-gray-600">Just a few more details to get started</p>
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
                        placeholder="John"
                        className="h-12 bg-white/80 backdrop-blur-sm"
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
                        placeholder="Doe"
                        className="h-12 bg-white/80 backdrop-blur-sm"
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
                      placeholder="john@example.com"
                      className="h-12 bg-white/80 backdrop-blur-sm"
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
                      className="h-12 bg-white/80 backdrop-blur-sm"
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
                  <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create a secure password"
                      className="h-12 bg-white/80 backdrop-blur-sm"
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
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Create account</span>
                </div>
              )}
            </Button>

            {hasExistingAccount && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setAuthStep('sign-in')}
                className="w-full h-12"
              >
                Already have an account? Sign in
              </Button>
            )}
          </form>
        </Form>
      </div>
    );
  }

  // Sign In Step (for existing users)
  if (authStep === 'sign-in') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">Welcome back!</p>
          <p className="text-sm text-gray-600">Sign in to your existing account</p>
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
                      className="h-12 bg-white/80 backdrop-blur-sm"
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
                      className="h-12 bg-white/80 backdrop-blur-sm"
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
                "Sign in"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setAuthStep('user-details')}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Need to create an account?
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  // Complete Step - Show success state
  if (authStep === 'complete') {
    return (
      <div className="flex items-center space-x-3 py-4 px-4 bg-emerald-50/50 backdrop-blur-sm rounded-xl">
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Account verified</p>
          <p className="text-xs text-gray-600 truncate">Ready to complete your booking</p>
        </div>
      </div>
    );
  }

  return null;
} 