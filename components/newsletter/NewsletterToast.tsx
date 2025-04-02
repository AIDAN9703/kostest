'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import Image from 'next/image';

export function useNewsletterToast() {
  const { toast } = useToast();
  const [hasShown, setHasShown] = useState(false);

  const showNewsletterToast = () => {
    // Don't show if we've already shown it in this session
    if (hasShown) return;
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Check if the user has already seen/dismissed the newsletter toast
    const newsletterStatus = localStorage.getItem('newsletter_shown');
    if (newsletterStatus === 'dismissed' || newsletterStatus === 'subscribed') return;
    
    // Show toast after a delay
    setTimeout(() => {
      const { dismiss } = toast({
        title: "",
        description: (
          <div className="w-full">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image 
                    src="/icons/logo.png"
                    alt="KOS Logo"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-primary text-lg">Insider access to yachts, events, and the world of yachting.</h3>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Join the KOS Yacht Club Newsletter!
            </p>
            
            <NewsletterForm onSuccess={() => {
              dismiss();
              localStorage.setItem('newsletter_shown', 'subscribed');
              
              // Show success toast
              toast({
                title: "Success!",
                description: "Your discount code has been sent to your email.",
                duration: 5000,
              });
            }} />
          </div>
        ),
        duration: Infinity, // Stay open indefinitely until dismissed
      });
      
      setHasShown(true);
    }, 5000); // Show after 5 seconds
  };

  return { showNewsletterToast };
}

function NewsletterForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate sending to API
    try {
      // Here you'd normally send to your API
      // await fetch('/api/newsletter', { 
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Just simulate a delay for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="w-full border-gray-200 focus:border-primary focus:ring-primary"
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Subscribing...' : 'Get My Discount'}
        <Send className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
} 