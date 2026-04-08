"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { User } from "lucide-react";

import AuthForm from "@/features/auth/components/AuthForm";
import { signInSchema, signUpSchema } from "@/features/_validation/validations";
import { signInAction, signUpAction } from "@/features/auth/actions/auth";
import { googleSignIn } from "@/features/auth/actions/google-auth";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface BookingAuthSectionProps {
  user?: {
    name?: string | null;
    id: string;
  } | null;
  authModal: "sign-in" | "sign-up" | null;
  onAuthModalChange: (next: "sign-in" | "sign-up" | null) => void;
}

export default function BookingAuthSection({
  user,
  authModal,
  onAuthModalChange,
}: BookingAuthSectionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  if (user) {
    return (
      <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200 ring-1 ring-emerald-100">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            <span className="font-medium">Welcome back, {user.name || "there"}!</span> You&apos;ll
            earn points for this charter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="booking-auth" className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-gray-900">Sign in to book</h3>
        <p className="text-sm text-gray-600 mt-1">
          Your date and pricing choices stay on this page. Use Google, email sign-in, or create an
          account—then submit your request.
        </p>
      </div>

      <form action={googleSignIn} className="w-full">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99]"
        >
          <Image src="/icons/google.svg" alt="" width={18} height={18} className="shrink-0" />
          Continue with Google
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">or</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="flex-1 rounded-xl"
          onClick={() => onAuthModalChange("sign-in")}
        >
          Sign in with email
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1 rounded-xl"
          onClick={() => onAuthModalChange("sign-up")}
        >
          Create account
        </Button>
      </div>

      <Dialog
        open={authModal !== null}
        onOpenChange={(open) => {
          if (!open) onAuthModalChange(null);
        }}
      >
        <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{authModal === "sign-up" ? "Create account" : "Sign in"}</DialogTitle>
            <DialogDescription>
              {authModal === "sign-up"
                ? "Create an account to complete this booking. You’ll return here with your trip details."
                : "Sign in with your email and password. You’ll return to this page with your trip details."}
            </DialogDescription>
          </DialogHeader>

          {authModal === "sign-in" ? (
            <AuthForm
              key="booking-sign-in"
              type="SIGN_IN"
              schema={signInSchema}
              defaultValues={{
                email: "",
                password: "",
              }}
              onSubmit={signInAction}
              embeddedCallbackUrl={callbackUrl}
              variant="embedded"
              hideHeading
              onSwitchToSignUp={() => onAuthModalChange("sign-up")}
            />
          ) : authModal === "sign-up" ? (
            <AuthForm
              key="booking-sign-up"
              type="SIGN_UP"
              schema={signUpSchema}
              defaultValues={{
                email: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                password: "",
              }}
              onSubmit={signUpAction}
              embeddedCallbackUrl={callbackUrl}
              variant="embedded"
              hideHeading
              onSwitchToSignIn={() => onAuthModalChange("sign-in")}
            />
          ) : null}
        </DialogContent>
      </Dialog>

    </div>
  );
}
