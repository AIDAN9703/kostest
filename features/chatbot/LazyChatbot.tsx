"use client";

import { lazy, Suspense, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

// Lazy load the full chatbot component
const ChatBot = lazy(() => import('./ChatBot'));

export default function LazyChatbot() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Only load the full component when user clicks
  const handleClick = () => {
    setIsLoaded(true);
  };

  if (!isLoaded) {
    // Show only the toggle button - no heavy components loaded
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        className="fixed bottom-4 right-0 z-50 h-14 w-14 p-0 rounded-l-full rounded-r-none bg-white text-primary border border-gray-200 shadow-md hover:shadow-lg transition"
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  // Load the full chatbot component with lazy loading and auto-open
  return (
    <Suspense fallback={
      <Button
        variant="outline"
        disabled
        className="fixed bottom-4 right-0 z-50 h-14 w-14 p-0 rounded-l-full rounded-r-none bg-white text-primary border border-gray-200 shadow-md"
        aria-label="Loading chat"
      >
        <MessageSquare className="h-6 w-6 animate-pulse" />
      </Button>
    }>
      <ChatBot initialOpen={true} />
    </Suspense>
  );
} 