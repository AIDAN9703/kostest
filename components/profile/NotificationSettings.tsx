"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

// Define notification preference types
type NotificationLevel = "ALL" | "IMPORTANT_ONLY" | "NONE";

interface NotificationPreferences {
  emailNotifications: NotificationLevel;
  pushNotifications: NotificationLevel;
  smsNotifications: NotificationLevel;
  marketingEmailsEnabled: boolean;
}

interface NotificationSettingsProps {
  user: any; // Using any for now, but should be properly typed with user schema
}

const NotificationSettings = ({ user }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize state with user preferences or defaults
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: user?.emailNotifications || "ALL",
    pushNotifications: user?.pushNotifications || "IMPORTANT_ONLY",
    smsNotifications: user?.smsNotifications || "NONE",
    marketingEmailsEnabled: user?.marketingEmailsEnabled || false,
  });

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (key === "marketingEmailsEnabled") {
      setPreferences((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    } else {
      // For enum values, we need to cycle through the options
      const options: NotificationLevel[] = ["ALL", "IMPORTANT_ONLY", "NONE"];
      
      const currentValue = preferences[key as keyof Omit<NotificationPreferences, "marketingEmailsEnabled">];
      const currentIndex = options.indexOf(currentValue as NotificationLevel);
      const nextIndex = (currentIndex + 1) % options.length;
      
      setPreferences((prev) => ({
        ...prev,
        [key]: options[nextIndex],
      }));
    }
  };

  const handleSavePreferences = async () => {
    setIsSubmitting(true);
    try {
      // For now, we'll just simulate a successful update
      // In a real app, you would call a server action here
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Notification Preferences</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Manage how and when you receive notifications from our platform.
        </p>
        
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Email Notifications</span>
              </div>
              <p className="text-xs text-gray-500">
                Receive notifications about bookings, messages, and updates via email.
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications !== "NONE"}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>
          
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Push Notifications</span>
              </div>
              <p className="text-xs text-gray-500">
                Receive notifications on your device when you're using our app.
              </p>
            </div>
            <Switch
              checked={preferences.pushNotifications !== "NONE"}
              onCheckedChange={() => handleToggle("pushNotifications")}
            />
          </div>
          
          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">SMS Notifications</span>
              </div>
              <p className="text-xs text-gray-500">
                Receive important notifications via text message.
              </p>
            </div>
            <Switch
              checked={preferences.smsNotifications !== "NONE"}
              onCheckedChange={() => handleToggle("smsNotifications")}
            />
          </div>
          
          {/* Marketing Emails */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Marketing Emails</span>
              </div>
              <p className="text-xs text-gray-500">
                Receive promotional emails, newsletters, and special offers.
              </p>
            </div>
            <Switch
              checked={preferences.marketingEmailsEnabled}
              onCheckedChange={() => handleToggle("marketingEmailsEnabled")}
            />
          </div>
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={handleSavePreferences} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-sm mb-2">Email</h4>
            <p className="text-sm text-gray-500">
              {user?.email || "No email address provided"}
              {user?.emailVerified ? (
                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Not verified
                </span>
              )}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-sm mb-2">Phone Number</h4>
            <p className="text-sm text-gray-500">
              {user?.phoneNumber ? (
                <>
                  {user.phoneNumber}
                  {user.phoneVerified ? (
                    <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Not verified
                    </span>
                  )}
                </>
              ) : (
                "No phone number provided"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 