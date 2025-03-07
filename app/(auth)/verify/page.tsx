"use client";

import React, { useState, useEffect, useRef } from "react";
import { phoneVerificationSchema } from "@/lib/validations";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { verifyPhoneCode, sendVerificationCode } from "@/lib/actions/auth/verification";
import { useSession } from "next-auth/react";

const VerifyPage = () => {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [initialCodeSent, setInitialCodeSent] = useState(false);
  const codeSentRef = useRef(false);
  const initialLoadTimeRef = useRef(Date.now());
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Use the phone number from the URL or from the session
  const phoneNumber = phoneParam || session?.user?.phoneNumber || "";
  
  const form = useForm({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      phoneNumber: phoneNumber,
      verificationCode: "",
    },
  });
  
  // Update form value when phone number is available
  useEffect(() => {
    if (phoneNumber && form.getValues("phoneNumber") !== phoneNumber) {
      form.setValue("phoneNumber", phoneNumber);
    }
  }, [phoneNumber, form]);

  // Redirect if user is already verified and signed in
  useEffect(() => {
    if (session?.user?.phoneVerified && status === "authenticated") {
      router.push("/");
    }
  }, [session, router, status]);

  // Helper function to get user ID from session or token
  const getUserId = async () => {
    // If we have a session, use the user ID from it
    if (session?.user?.id) {
      return { userId: session.user.id, success: true };
    }
    
    // If not signed in but have email and token, find the user
    if (email && token) {
      try {
        const response = await fetch(`/api/users/verify-token?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success && data.user?.id) {
          return { userId: data.user.id, success: true };
        } else {
          toast({
            title: "Error",
            description: "Invalid or expired verification link. Please try signing in again.",
            variant: "destructive",
          });
          router.push("/sign-in");
          return { success: false };
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try signing in again.",
          variant: "destructive",
        });
        router.push("/sign-in");
        return { success: false };
      }
    }
    
    // If we don't have a user ID, show an error
    toast({
      title: "Error",
      description: "Unable to identify user. Please try signing in again.",
      variant: "destructive",
    });
    router.push("/sign-in");
    return { success: false };
  };

  // Helper function to send verification code
  const sendCode = async (phone: string) => {
    setIsResending(true);
    
    try {
      const { userId, success } = await getUserId();
      if (!success) {
        setIsResending(false);
        return false;
      }
      
      const result = await sendVerificationCode(userId, phone);
      
      if (result.success) {
        toast({
          title: "Verification code sent",
          description: "A verification code has been sent to your phone.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send verification code.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsResending(false);
    }
  };

  // Send verification code only if this is the first time after signup
  useEffect(() => {
    // Only send a code automatically if:
    // 1. We have a phone number
    // 2. This is the first load of the page
    // 3. We haven't sent a code yet
    // 4. We have a "fresh" URL parameter (indicating we just came from signup)
    if (phoneNumber && isFirstLoad && !codeSentRef.current && phoneParam) {
      setIsFirstLoad(false);
      codeSentRef.current = true;
      setInitialCodeSent(true);
      sendCode(phoneNumber);
    }
  }, [phoneNumber, phoneParam, isFirstLoad]);

  const handleResendCode = async () => {
    const phone = form.getValues("phoneNumber");
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    await sendCode(phone);
  };

  // Helper function to sign in with token
  const signInWithToken = async () => {
    if (!email || !token) return false;
    
    try {
      const signInResponse = await fetch(`/api/users/sign-in-with-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });
      
      const signInData = await signInResponse.json();
      
      if (signInData.success) {
        return true;
      } else {
        toast({
          title: "Error signing in",
          description: "Your phone was verified but we couldn't sign you in automatically. Please sign in manually.",
          variant: "destructive",
        });
        router.push("/sign-in");
        return false;
      }
    } catch (error) {
      toast({
        title: "Error signing in",
        description: "An unexpected error occurred. Please try signing in manually.",
        variant: "destructive",
      });
      router.push("/sign-in");
      return false;
    }
  };

  const onSubmit = async (data: { phoneNumber: string, verificationCode: string }) => {
    setIsVerifying(true);
    
    try {
      const { userId, success } = await getUserId();
      if (!success) {
        setIsVerifying(false);
        return;
      }
      
      const result = await verifyPhoneCode(
        userId,
        data.phoneNumber,
        data.verificationCode
      );
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Your phone number has been verified successfully.",
        });
        
        // Now sign in the user if we have a token
        if (email && token) {
          const signedIn = await signInWithToken();
          if (signedIn) {
            // Refresh the session
            router.push("/");
          }
        } else {
          // Redirect to home page if already signed in
          router.push("/");
        }
      } else {
        toast({
          title: "Verification failed",
          description: result.error || "Please check your verification code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Image src="/icons/logo.png" alt="logo" width={45} height={45} />
            <h1 className="text-2xl font-bold text-primary font-serif">KOS Yachts</h1>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 font-serif text-center">Verify Your Phone</h2>
          <p className="text-gray-600 text-center">
            We've sent a verification code to your phone. Please enter it below to verify your account.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          required
                          type="tel"
                          {...field}
                          className="h-12 bg-white border border-gray-200 rounded-lg text-gray-800"
                          placeholder="Enter your phone number"
                          disabled={!!phoneNumber}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          required
                          type="text"
                          {...field}
                          className="h-12 bg-white border border-gray-200 rounded-lg text-gray-800"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                type="submit" 
                className="bg-primary text-white h-12 rounded-lg w-full hover:bg-primary/90 transition-all duration-300"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Phone"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={handleResendCode}
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend Code"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <p className="text-center text-sm text-gray-600 bg-white px-4">
                Having trouble? 
                <button 
                  onClick={() => router.push("/")}
                  className="ml-1 font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Skip for now
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage; 