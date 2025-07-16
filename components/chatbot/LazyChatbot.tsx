"use client";

import { lazy, Suspense, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleClick}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  // Load the full chatbot component with lazy loading and auto-open
  return (
    <Suspense fallback={
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          disabled
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600"
          size="lg"
        >
          <MessageCircle className="h-6 w-6 animate-pulse" />
        </Button>
      </div>
    }>
      <ChatBot initialOpen={true} />
    </Suspense>
  );
} 