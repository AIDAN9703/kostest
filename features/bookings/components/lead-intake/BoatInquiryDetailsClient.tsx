"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates, parseAsString, parseAsInteger, parseAsBoolean } from "nuqs";
import { Loader2 } from "lucide-react";

import BookingSummary from "@/features/bookings/components/BookingSummary";
import BookingPricingSection from "@/features/bookings/components/BookingPricingSection";
import KnowBeforeYouGo from "@/features/bookings/components/KnowBeforeYouGo";
import { useBoat } from "@/features/bookings/components/BoatProvider";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { calculateBookingPrice } from "@/shared/lib/utils/pricing-utils";
import { toast } from "@/shared/lib/hooks/use-toast";
import { createBoatLead } from "@/features/bookings/actions/lead-intake.actions";
import type { BoatInquiryContactFormData } from "@/shared/lib/validation/inquiry";
import InquiryContactForm from "@/features/bookings/components/lead-intake/InquiryContactForm";

/** Signed-in visitor's account details, prefilled into the contact step. */
export interface InquiryCurrentUser {
  name: string;
  email: string;
  phone: string;
}

export default function BoatInquiryDetailsClient({
  serviceFeeRate,
  currentUser,
}: {
  /** Decimal service fee rate (e.g. 0.035) from app settings. */
  serviceFeeRate: number;
  currentUser: InquiryCurrentUser | null;
}) {
  const router = useRouter();
  const boat = useBoat();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [inquiryState] = useQueryStates({
    startDateTime: parseAsString,
    pricingTierId: parseAsString,
    numberOfPassengers: parseAsInteger.withDefault(1),
    needsCaptain: parseAsBoolean.withDefault(false),
  });

  const { startDateTime, pricingTierId, numberOfPassengers, needsCaptain } = inquiryState;
  const isTripComplete = !!(startDateTime && pricingTierId && numberOfPassengers);

  useEffect(() => {
    if (!isTripComplete) {
      router.push(`/boats/${boat.id}`);
    }
  }, [isTripComplete, boat.id, router]);

  const selectedTier = useMemo(
    () => boat.pricingTiers?.find((t) => t.id === pricingTierId) || null,
    [boat.pricingTiers, pricingTierId]
  );

  const priceBreakdown = useMemo(() => {
    if (!selectedTier) return null;
    return calculateBookingPrice(selectedTier.price, boat.cleaningFee || 0, 0, serviceFeeRate);
  }, [selectedTier, boat.cleaningFee, serviceFeeRate]);

  const safeBoat = useMemo(
    () => ({
      id: boat.id,
      name: boat.name,
      mainImage: boat.mainImage ?? null,
      instantBook: !!boat.instantBook,
      cleaningFee: boat.cleaningFee ?? null,
      locationLabel: boat.locationLabel ?? null,
      timezone: (boat.timezone as string | null) ?? null,
      currency: boat.currency ?? "USD",
    }),
    [boat]
  );

  const totalLabel = useMemo(() => {
    if (!priceBreakdown) return "";
    return formatCurrency(priceBreakdown.totalPrice, safeBoat.currency);
  }, [priceBreakdown, safeBoat.currency]);

  const handleContactSubmit = useCallback(
    async (contact: BoatInquiryContactFormData) => {
      if (!isTripComplete || !selectedTier || !startDateTime) return;

      setIsSubmitting(true);
      try {
        const result = await createBoatLead({
          boatId: boat.id,
          startDateTime,
          pricingTierId: selectedTier.id,
          numberOfPassengers,
          needsCaptain: !!needsCaptain,
          ...contact,
        });

        if (result.success && result.bookingId) {
          // CRM sync happens server-side inside createBoatLead.
          setSubmitted(true);
          toast({
            title: "Request submitted",
            description: result.message,
          });
        } else {
          toast({
            title: "Could not submit request",
            description: result.error ?? "Please try again.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      boat.id,
      isTripComplete,
      needsCaptain,
      numberOfPassengers,
      selectedTier,
      startDateTime,
    ]
  );

  if (!isTripComplete || !selectedTier) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white pb-16">
        <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Request received
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Thanks for your interest in {boat.name}. Our team will review availability and reach
            out shortly.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-xl">
              <a href={`/boats/${boat.id}`}>Back to boat</a>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/">Explore more yachts</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 lg:pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:px-8 lg:pt-14 lg:pb-12">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            You&apos;re almost there
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Complete your request
          </h1>
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_380px]">
          <main className="min-w-0">
            <BookingSummary
              boat={safeBoat}
              selectedTier={selectedTier}
              bookingData={{
                startDateTime: startDateTime!,
                numberOfPassengers,
              }}
            />

            <div className="mt-5 border-t border-gray-100 pt-5 sm:mt-6 sm:pt-6">
              <InquiryContactForm
                onSubmit={handleContactSubmit}
                isSubmitting={isSubmitting}
                currentUser={currentUser}
              />
            </div>

            <div className="mt-8 space-y-6 border-t border-gray-100 pt-5 sm:mt-9 sm:pt-6 lg:hidden">
              <KnowBeforeYouGo boatName={boat.name} />
              <BookingPricingSection
                boat={safeBoat}
                selectedTier={selectedTier}
                serviceFeeRate={serviceFeeRate}
              />
            </div>
          </main>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6 rounded-2xl bg-gray-50 p-6">
              <KnowBeforeYouGo boatName={boat.name} />
              <BookingPricingSection
                boat={safeBoat}
                selectedTier={selectedTier}
                serviceFeeRate={serviceFeeRate}
              />
              <Button
                type="submit"
                form="inquiry-contact-form"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Request availability"
                )}
              </Button>
              <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
                No payment required. Our team will confirm availability and follow up.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90 lg:hidden safe-area-pb">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {totalLabel}
            </p>
            <p className="text-sm text-muted-foreground">Estimated total</p>
          </div>
          <Button
            type="submit"
            form="inquiry-contact-form"
            disabled={isSubmitting}
            className="h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
