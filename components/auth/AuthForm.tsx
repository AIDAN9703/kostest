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
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
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
    const result = await onSubmit(data);

    if (result.success) {
      toast({
        title: "Success",
        description: isSignIn
          ? "You have successfully signed in."
          : "You have successfully signed up.",
      });

      router.push("/");
    } else {
      toast({
        title: `Error ${isSignIn ? "signing in" : "signing up"}`,
        description: result.error ?? "An error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="auth-content">
      {/* Left Side - Dynamic Content */}
      <div className="auth-branding">
        <div className="auth-branding-top">
          <div className="auth-logo">
            <Image src="/icons/logo.png" alt="logo" width={45} height={45} className="drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-white">KOSyachts</h1>
          </div>
          <p className="text-xl text-white/80 font-light">
          Crafting one unforgettable experience at a time.          </p>
        </div>

        <div className="auth-branding-content">
          {isSignIn ? (
            <>
              <h2 className="text-lg font-medium text-white/90">Discover KOSyachts</h2>
              <div className="relative h-[120px]"> {/* Fixed height container for tips */}
                {YachtTips.map((tip, index) => (
                  <div 
                    key={tip.title}
                    className={`tip-card absolute w-full transition-opacity duration-500 ${
                      index === currentTipIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 text-xl">
                        {tip.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{tip.title}</h3>
                        <p className="text-white/70 text-sm">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1 mt-4">
                {YachtTips.map((_, index) => (
                  <button
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentTipIndex ? "bg-primary w-3" : "bg-white/20"
                    }`}
                    onClick={() => setCurrentTipIndex(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-medium text-white/90">Why Our Customers Love Us</h2>
              <div className="space-y-6">
                <div className="testimonial-card">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Image src="/icons/quote.svg" alt="quote" width={20} height={20} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm italic">"The most luxurious experience of my life. The crew was exceptional and the yacht was stunning."</p>
                      <div className="mt-3 flex items-center gap-2">
                        <p className="text-white font-medium">James Wilson</p>
                        <div className="text-primary text-sm">★★★★★</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Image src="/icons/quote.svg" alt="quote" width={20} height={20} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm italic">"Impeccable service from start to finish. KOSyachts made our anniversary truly unforgettable."</p>
                      <div className="mt-3 flex items-center gap-2">
                        <p className="text-white font-medium">Sarah Chen</p>
                        <div className="text-primary text-sm">★★★★★</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Image src="/icons/quote.svg" alt="quote" width={20} height={20} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm italic">"From the moment we stepped aboard, everything was perfect. The attention to detail and personalized service exceeded all expectations."</p>
                      <div className="mt-3 flex items-center gap-2">
                        <p className="text-white font-medium">Michael Roberts</p>
                        <div className="text-primary text-sm">★★★★★</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-container">
        <div className="space-y-3 mb-8">
          <h2 className="auth-heading">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-white/60">
            {isSignIn
              ? "Enter your credentials to continue your journey"
              : "Join us to start your luxury experience"}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <div className="space-y-4">
              {Object.keys(defaultValues).map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field as Path<T>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/80">
                        {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            required
                            type={
                              FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]
                            }
                            {...field}
                            className="auth-input"
                            placeholder={`Enter your ${((FIELD_NAMES[field.name as keyof typeof FIELD_NAMES] ?? field.name) || '').toLowerCase()}`}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button type="submit" className="auth-button">
              {isSignIn ? "Sign In" : "Create Account"}
              
            </Button>
          </form>
        </Form>

        <div className="mt-8 space-y-6">
          <div className="relative flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
            <span className="text-sm text-white/40">or continue with</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-white/5 via-white/10 to-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="auth-social-button group">
              <div className="relative w-5 h-5">
                <Image src="/icons/google.svg" alt="Google" fill className="object-contain group-hover:scale-110 transition-transform" />
              </div>
              <span>Google</span>
            </button>
            <button className="auth-social-button group">
              <div className="relative w-5 h-5">
                <Image src="/icons/apple.svg" alt="Apple" fill className="object-contain group-hover:scale-110 transition-transform" />
              </div>
              <span>Apple</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <p className="text-center text-sm text-white/60 bg-transparent px-4">
                {isSignIn ? "New to KOSyachts? " : "Already have an account? "}
                <Link
                  href={isSignIn ? "/sign-up" : "/sign-in"}
                  className="font-medium text-primary hover:text-white transition-colors"
                >
                  {isSignIn ? "Create an account" : "Sign in"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;