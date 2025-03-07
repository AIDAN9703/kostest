"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { ZodType } from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string; data?: { redirectUrl?: string; message: string } }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const YachtTips = [
  {
    icon: "⚓",
    title: "Premium Fleet",
    description: "Browse our collection of luxury yachts, from sleek speedboats to mega yachts"
  },
  {
    icon: "👨‍✈️",
    title: "Expert Crew",
    description: "Every yacht comes with a professional crew trained to provide 5-star service"
  },
  {
    icon: "🗺️",
    title: "Global Destinations",
    description: "Set sail to exotic locations worldwide with our international fleet"
  },
  {
    icon: "🛎️",
    title: "Concierge Service",
    description: "24/7 personal concierge to handle all your requests and itineraries"
  },
  {
    icon: "✨",
    title: "Luxury Amenities",
    description: "From gourmet dining to water toys, enjoy premium onboard experiences"
  },
  {
    icon: "📱",
    title: "Easy Booking",
    description: "Secure your dream yacht with our simple booking process"
  }
];

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();
  const isSignIn = type === "SIGN_IN";
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rotate through tips every 4 seconds
  useEffect(() => {
    if (isSignIn) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % YachtTips.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isSignIn]);

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);

      if (result.success) {
        toast({
          title: "Success",
          description: result.data?.message || (isSignIn
            ? "You have successfully signed in."
            : "You have successfully signed up."),
        });

        // Check if there's a redirectUrl in the response
        if (result.data?.redirectUrl) {
          router.push(result.data.redirectUrl);
        } else {
          router.push("/");
        }
      } else {
        // Check if there's a redirectUrl in the error response
        if (result.data?.redirectUrl) {
          toast({
            title: "Action Required",
            description: result.data.message || result.error || "Additional action required.",
          });
          router.push(result.data.redirectUrl);
        } else {
          toast({
            title: `Error ${isSignIn ? "signing in" : "signing up"}`,
            description: result.error ?? "An error occurred.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-8">
      {/* Mobile Logo - Only visible on small screens */}
      <div className="flex items-center justify-center mb-8 lg:hidden">
        <div className="flex items-center gap-3">
          <Image src="/icons/logo.png" alt="logo" width={40} height={40} />
          <h1 className="text-2xl font-bold text-primary font-serif">KOS Yachts</h1>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-primary font-serif">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isSignIn
              ? "Enter your credentials to continue your journey"
              : "Join us to start your luxury experience"}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              {Object.keys(defaultValues).map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field as Path<T>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-dark-400">
                        {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          type={
                            FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]
                          }
                          {...field}
                          className="h-12 bg-white border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                          placeholder={`Enter your ${((FIELD_NAMES[field.name as keyof typeof FIELD_NAMES] ?? field.name) || '').toLowerCase()}`}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary text-white h-12 rounded-lg w-full
                       hover:bg-primary/90 transition-all duration-300
                       disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>{isSignIn ? "Signing in..." : "Creating account..."}</span>
                </div>
              ) : (
                isSignIn ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>
        </Form>

        <div className="space-y-6 mt-8">
          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-500">or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 h-12 w-full border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300">
              <div className="relative w-5 h-5">
                <Image src="/icons/google.svg" alt="Google" fill className="object-contain" />
              </div>
              <span className="text-gray-700 text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-12 w-full border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300">
              <div className="relative w-5 h-5">
                <Image src="/icons/apple.svg" alt="Apple" fill className="object-contain" />
              </div>
              <span className="text-gray-700 text-sm font-medium">Apple</span>
            </button>
          </div>

          <div className="text-center pb-4">
            <p className="text-sm text-gray-600">
              {isSignIn ? "New to KOS Yachts? " : "Already have an account? "}
              <Link
                href={isSignIn ? "/sign-up" : "/sign-in"}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {isSignIn ? "Create an account" : "Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;