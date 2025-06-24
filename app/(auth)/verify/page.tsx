"use client";

import React, { useState, useEffect, useRef } from "react";
import { phoneVerificationSchema } from "@/lib/validation/validations";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { verifyOtpAndSignIn, resendVerificationCode } from "@/lib/actions/auth/verification";
import { useSession } from "next-auth/react";

const VerifyPage = () => {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
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
      router.push(callbackUrl);
    }
  }, [session, router, status, callbackUrl]);

  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Missing email information. Please try signing in again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsResending(true);
    
    try {
      const result = await resendVerificationCode(email);
      
      if (result.success) {
        toast({
          title: "Code sent",
          description: result.data?.message || "A new verification code has been sent to your phone.",
        });
      } else {
        toast({
          title: "Failed to resend",
          description: result.error || "Please try again.",
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
      setIsResending(false);
    }
  };

  const onSubmit = async (data: { phoneNumber: string, verificationCode: string }) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Missing email information. Please try signing in again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Use our updated consolidated server action without token
      const result = await verifyOtpAndSignIn(
        email,
        data.verificationCode
      );
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.data?.message || "Your phone number has been verified successfully.",
        });
        
        // Redirect to the callbackUrl
        router.push(callbackUrl);
      } else {
        toast({
          title: "Verification failed",
          description: result.error || "Please check your verification code and try again.",
          variant: "destructive",
        });
        
        // If there's a redirect URL in the error response, go there
        if (result.data?.redirectUrl) {
          router.push(result.data.redirectUrl);
        }
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

        {/* Small helper text for booking flow */}
        {callbackUrl !== "/" && (
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              After verification, you'll return to complete your booking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage; 