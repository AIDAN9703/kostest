'use client';

import { useEffect } from 'react';
import { Button } from "@/shared/components/ui/button";
import { usePathname } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(`Error in ${pathname}:`, error);
  }, [error, pathname]);

  // Get more specific error message based on path and error
  const getErrorDetails = () => {
    // Path-specific messages
    if (pathname?.includes('/boats/search')) {
      return "We couldn't load the boat search results. This might be due to an issue with the search parameters or database connection.";
    }
    
    // Error type specific messages
    if (error.message.includes('fetch')) {
      return "We had trouble connecting to our servers. Please check your internet connection and try again.";
    }
    
    if (error.message.includes('timeout')) {
      return "The request took too long to complete. Our servers might be experiencing high traffic.";
    }
    
    // Generic message for other cases
    return "Something unexpected happened while loading this page.";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">We encountered an error</h1>
          <p className="text-gray-600 mb-6">{getErrorDetails()}</p>
          
          {/* Error code if available */}
          {error.digest && (
            <p className="text-xs text-gray-400 mb-6">
              Error reference: {error.digest}
            </p>
          )}
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => reset()}
              className="px-6 py-2 bg-[#1E293B] hover:bg-[#2C3E50] transition-colors"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="px-6 py-2"
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 