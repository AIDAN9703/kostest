"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

const VerifyPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect authenticated users to home
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xs">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Image src="/icons/logo.png" alt="logo" width={45} height={45} />
            <h1 className="text-2xl font-bold text-primary font-serif">KOS Yachts</h1>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Phone verification no longer required
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We've simplified our signup process! You can now create an account and start browsing immediately. 
              Phone verification will only be required when you make a booking.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleGoHome}
              className="w-full h-12 bg-primary text-white hover:bg-primary/90"
            >
              Browse Boats
            </Button>
            
            <Button 
              onClick={handleSignIn}
              variant="outline"
              className="w-full h-12"
            >
              Sign In to Your Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage; 