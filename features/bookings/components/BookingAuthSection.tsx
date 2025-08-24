"use client";

import React, { useState } from "react";
import { User, Phone, ArrowRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendOtpToPhoneNumber } from "@/features/auth/actions/verification";
import { handlePhoneAndOtpForBooking } from "@/features/auth/actions/auth";
import { googleSignIn } from "@/features/auth/actions/google-auth";

interface BookingAuthSectionProps {
  user?: {
    name?: string | null;
    id: string;
  } | null;
}

export default function BookingAuthSection({ user }: BookingAuthSectionProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [callbackUrl, setCallbackUrl] = useState("");
  const router = useRouter();

  // Get current URL with parameters for Google auth callback
  React.useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    setCallbackUrl(`/booking-details?${currentParams.toString()}`);
  }, []);

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) return;
    
    setIsLoading(true);

    try {
      const result = await sendOtpToPhoneNumber(phoneNumber);
      
      if (result.success) {
        setStep('otp');
      } else {
        console.error('Failed to send OTP:', result.error);
        // Could show a toast here
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim() || !phoneNumber) return;
    
    setIsLoading(true);

    try {
      const result = await handlePhoneAndOtpForBooking(phoneNumber, otp);
      
      if (result.success && result.data) {
        const currentParams = new URLSearchParams(window.location.search);
        const callbackUrl = `/booking-details?${currentParams.toString()}`;
        
        if (result.data.existingUser) {
          // User exists, go to sign-in modal with email pre-filled
          const email = result.data.user?.email || '';
          router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(email)}`);
        } else {
          // New user, go to sign-up modal with phone pre-filled
          router.push(`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}&phone=${encodeURIComponent(phoneNumber)}`);
        }
      } else {
        console.error('OTP verification failed:', result.error);
        // Could reset to phone step or show error
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200 ring-1 ring-emerald-100">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            <span className="font-medium">Welcome back, {user.name || 'there'}!</span> You'll earn points for this charter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          {/* Header */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-1">Verify your phone number</h3>
            <p className="text-sm text-gray-600">We'll send you a verification code to continue</p>
          </div>

          {/* Phone Input */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {phoneNumber && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield className="w-3 h-3" />
                <span>We'll send you a 6-digit verification code</span>
              </div>
            )}

            <button
              onClick={handlePhoneSubmit}
              disabled={!phoneNumber.trim() || isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  <span>Send code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form action={googleSignIn}>
            <input 
              type="hidden" 
              name="callbackUrl" 
              value={callbackUrl} 
            />
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 py-3 px-4 rounded-xl text-sm font-medium transition-all bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </>
      ) : (
        <>
          {/* OTP Step */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-1">Enter verification code</h3>
            <p className="text-sm text-gray-600">
              We sent a 6-digit code to <span className="font-medium">{phoneNumber}</span>
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-center text-lg tracking-widest"
              maxLength={6}
            />

            <button
              onClick={handleOtpSubmit}
              disabled={otp.length !== 6 || isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={() => setStep('phone')}
              className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
            >
              ← Back to phone number
            </button>
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 text-center leading-relaxed">
        {step === 'phone' 
          ? 'We use phone verification for security and booking updates'
          : 'Check your messages for the verification code'
        }
      </p>
    </div>
  );
}
