"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, KeyRound, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";

// Simple form without zod validation
interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettingsProps {
  user: any; // Using any for now, but should be properly typed with user schema
}

const SecuritySettings = ({ user }: SecuritySettingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const { toast } = useToast();

  // Use React Hook Form without zod resolver
  const form = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordForm) => {
    setIsSubmitting(true);
    
    // Basic validation
    if (data.newPassword.length < 8) {
      form.setError("newPassword", {
        type: "manual",
        message: "Password must be at least 8 characters"
      });
      setIsSubmitting(false);
      return;
    }
    
    if (data.newPassword !== data.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match"
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Simulate a successful password update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      form.reset();
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    
    toast({
      title: twoFactorEnabled ? "Two-factor authentication disabled" : "Two-factor authentication enabled",
      description: twoFactorEnabled 
        ? "Your account is now less secure. We recommend enabling two-factor authentication." 
        : "Your account is now more secure.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Password Change Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Change Password</h3>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters and include uppercase, lowercase, 
                    number and special character.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </Form>
      </div>
      
      {/* Two-Factor Authentication Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Add an extra layer of security to your account
            </p>
            <p className="text-xs text-gray-500 mt-1">
              We'll send you a code to verify your identity when you sign in on a new device.
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={handleTwoFactorToggle}
          />
        </div>
        
        {!twoFactorEnabled && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              We strongly recommend enabling two-factor authentication for added security.
            </p>
          </div>
        )}
      </div>
      
      {/* Account Activity Section */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4">Recent Account Activity</h3>
        
        {user?.lastLoginAt ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Last login</p>
                  <p className="text-sm text-gray-500">
                    {new Date(user.lastLoginAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{user.lastLoginIp || "Unknown IP"}</p>
                  <p className="text-xs text-gray-500">{user.lastLoginDevice || "Unknown device"}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recent activity to display</p>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings; 