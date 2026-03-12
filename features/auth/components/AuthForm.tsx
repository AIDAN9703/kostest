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

import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/shared/lib/constants";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { googleSignIn } from "@/features/auth/actions/google-auth";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (
    data: T
  ) => Promise<{
    success: boolean;
    error?: string;
    data?: { redirectUrl?: string; message: string };
  }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const searchParams = useSearchParams();
  const isSignIn = type === "SIGN_IN";
  const { isSubmitting, handleAuth } = useAuth<T>();

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const prefilledEmail = searchParams.get("email") || "";
  const prefilledPhone = searchParams.get("phone") || "";

  const mergedDefaultValues = {
    ...defaultValues,
    ...(prefilledEmail && { email: prefilledEmail }),
    ...(prefilledPhone && { phoneNumber: prefilledPhone }),
  } as DefaultValues<T>;

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: mergedDefaultValues,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const successMessage = isSignIn
      ? "You have successfully signed in."
      : "You have successfully signed up.";
    await handleAuth(data, onSubmit, callbackUrl, successMessage);
  };

  return (
    <div className="bg-white rounded-xl border width-[400px] border-gray-200 p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 sm:mb-7 text-center">
        <h1 className="text-lg sm:text-xl font-semibold text-primary">
          {isSignIn ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {isSignIn
            ? "Welcome back! Please enter your details."
            : "Get started with your free account."}
        </p>
      </div>

      {/* Google Sign In */}
      <form action={googleSignIn} className="mb-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button
          type="submit"
          className="flex items-center justify-center gap-2.5 h-11 sm:h-10 w-full border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm active:scale-[0.98]"
        >
          <Image
            src="/icons/google.svg"
            alt="Google"
            width={18}
            height={18}
            className="sm:w-4 sm:h-4"
          />
          <span className="text-gray-600 font-medium">
            Continue with Google
          </span>
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 ml-1">
                    {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      type={FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]}
                      {...field}
                      className="h-10 text-sm"
                      placeholder={`Enter your ${((FIELD_NAMES[field.name as keyof typeof FIELD_NAMES] ?? field.name) || "").toLowerCase()}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 sm:h-10 mt-2 text-sm font-medium active:scale-[0.98] transition-transform"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isSignIn ? "Signing in..." : "Creating account..."}</span>
              </div>
            ) : isSignIn ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>

      {/* Footer */}
      <p className="text-sm text-gray-500 mt-6 text-center">
        {isSignIn ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={
            (isSignIn ? "/sign-up" : "/sign-in") +
            (callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "")
          }
          className="font-medium text-primary hover:underline"
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </Link>
        <br />
        <br />
        This site is protected by reCAPTCHA, Google <Link href="https://policies.google.com/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link> and <Link href="/https://policies.google.com/terms" className="font-medium text-primary hover:underline">Terms of Service</Link> apply.
      </p>
      
    </div>
  );
};

export default AuthForm;
