"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { handlePhoneNumberStep, handleOtpVerificationStep } from "@/lib/actions/booking/orchestrator";
import { Loader2, ArrowRight, Phone, Shield } from "lucide-react";

interface PhoneVerificationFormProps {
  onComplete: (user: any) => void;
  onBack?: () => void;
}

export default function PhoneVerificationForm({ onComplete, onBack }: PhoneVerificationFormProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Handle phone number submission
  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await handlePhoneNumberStep(phoneNumber);

      if (result.success) {
        toast({
          title: "Verification code sent",
          description: "Please check your phone for the verification code",
        });
        setStep("otp");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handlePhoneSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle OTP submission
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await handleOtpVerificationStep(phoneNumber, otp);

      if (result.success) {
        onComplete(result.data?.user || { phoneNumber });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to verify code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleOtpSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle resend code
  async function resendCode() {
    setIsSubmitting(true);
    try {
      const result = await handlePhoneNumberStep(phoneNumber);

      if (result.success) {
        toast({
          title: "Verification code resent",
          description: "Please check your phone for the new verification code",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Go back to phone input step
  function goBackToPhone() {
    setOtp(""); // Clear OTP when going back
    setStep("phone");
  }

  return (
    <div className="space-y-6">
      {step === "phone" ? (
        <>
          <div className="text-center mb-6">
            <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-lg font-semibold">Phone Verification</h3>
            <p className="text-sm text-muted-foreground">
              We'll send a verification code to your phone
            </p>
          </div>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              <Button
                type="submit"
                className="flex-1 gap-2 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-lg font-semibold">
              {isExistingUser ? "Welcome Back" : "Verify Your Number"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isExistingUser 
                ? "Enter the code to sign in to your account" 
                : "We sent a code to " + phoneNumber}
            </p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="otp-code">
                Verification Code
              </label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
              <p className="text-xs text-center mt-1 text-muted-foreground">
                Enter the 6-digit code sent to your phone
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full gap-2 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  isExistingUser ? "Sign In & Continue" : "Verify & Continue"
                )}
              </Button>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBackToPhone}
                  className="text-xs"
                  size="sm"
                >
                  Change Phone Number
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resendCode}
                  className="text-xs"
                  size="sm"
                  disabled={isSubmitting}
                >
                  Resend Code
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
} 