"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  boatInquiryContactSchema,
  type BoatInquiryContactFormData,
} from "@/shared/lib/validation/inquiry";

const inputClass =
  "h-11 rounded-xl border-border bg-muted/10 focus-visible:ring-2 focus-visible:ring-ring";

interface InquiryContactFormProps {
  onSubmit: (values: BoatInquiryContactFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  id?: string;
  /** Signed-in visitor's account details — prefills the form when present. */
  currentUser?: { name: string; email: string; phone: string } | null;
}

/**
 * Step 2 contact capture for boat inquiries. Signed-in users get their
 * account details prefilled (still editable — booking for someone else, or a
 * missing phone, are both real cases); guests get a sign-in shortcut that
 * returns here with the trip selection intact.
 */
export default function InquiryContactForm({
  onSubmit,
  isSubmitting = false,
  id = "inquiry-contact-form",
  currentUser = null,
}: InquiryContactFormProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(
    `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`
  )}`;

  const form = useForm<BoatInquiryContactFormData>({
    resolver: zodResolver(boatInquiryContactSchema),
    defaultValues: {
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      phone: currentUser?.phone ?? "",
      message: "",
      termsAgreed: false,
    },
    mode: "onChange",
  });

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Your details</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {currentUser ? (
            <>Filled in from your account — edit anything that needs updating.</>
          ) : (
            <>
              We&apos;ll use this to confirm availability and follow up about your charter.{" "}
              <Link
                href={signInHref}
                className="font-medium text-primary-strong underline-offset-4 hover:underline"
              >
                Have an account? Sign in to autofill.
              </Link>
            </>
          )}
        </p>
      </div>

      <Form {...form}>
        <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="px-4 py-3">
                  <FormLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={inputClass}
                      type="tel"
                      autoComplete="tel"
                      placeholder="(555) 555-5555"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="px-4 py-3">
                  <FormLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={inputClass}
                      autoComplete="name"
                      placeholder="Your name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="px-4 py-3">
                  <FormLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={inputClass}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes{" "}
                  <span className="font-normal normal-case text-muted-foreground/70">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[88px] rounded-xl border-border bg-muted/10"
                    placeholder="Anything we should know about your trip?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAgreed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-muted-foreground">
                    I agree to the{" "}
                    <Link
                      href="/terms-of-service"
                      className="text-primary-strong underline-offset-4 hover:underline"
                    >
                      terms and conditions
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {isSubmitting && (
            <p className="text-center text-sm text-muted-foreground">Submitting your request…</p>
          )}
        </form>
      </Form>
    </section>
  );
}
