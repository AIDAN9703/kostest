"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";

export default function CookiesConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem("cookie-consent");
    if (!savedConsent) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 rounded-tr-2xl rounded-tl-2xl  bg-white/95 backdrop-blur-lg border-t border-primary/10 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left side - Icon and main content */}
          <div className="flex items-start space-x-4 flex-1">
           
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary mb-2">
                🍪 Cookie Preferences
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic, and personalize content.
                Please read our{" "}
                <a
                  href="/cookies"
                  className="text-primary hover:text-primary/80 underline font-medium transition-colors"
                >
                  Cookie Policy
                </a>
                {" "}and{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:text-primary/80 underline font-medium transition-colors"
                >
                  Privacy Policy
                </a>
                {" "}before closing this banner.
              </p>
            </div>
          </div>

          {/* Right side - Close button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center lg:shrink-0 w-full sm:w-auto">
            <Button
              size="lg"
              onClick={handleClose}
              className="bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
