"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryStates, parseAsString, parseAsInteger, parseAsBoolean } from "nuqs";
import { Loader2 } from "lucide-react";

import BookingSummary from "./BookingSummary";
import BookingAuthSection from "./BookingAuthSection";
import BookingHoldTimer from "./BookingHoldTimer";
import KnowBeforeYouGo from "./KnowBeforeYouGo";
import BookingPricingSection from "./BookingPricingSection";
import BookingSubmitButton from "./BookingSubmitButton";
import CharterDetailsForm from "./CharterDetailsForm";
import { AddOnsPicker } from "@/features/listing/components/booking-form/v2/fields";
import { useBoat } from "./BoatProvider";
import { calculateBookingPrice } from "@/shared/lib/utils/pricing-utils";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { BookingRequest } from "@/features/_validation/validations";
import { createInstantBooking } from "@/features/bookings/actions/instant";
import { createBookingRequest } from "@/features/bookings/actions/request";
import type { Session } from "next-auth";

export default function BookingDetailsClient({
  user,
  serviceFeeRate,
  holdMinutes,
}: {
  user: Session["user"] | null;
  /** Decimal service fee rate (e.g. 0.035) from app settings, fetched by the server page. */
  serviceFeeRate: number;
  holdMinutes: number;
}) {
  const router = useRouter();
  const boat = useBoat();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authModal, setAuthModal] = useState<
    "menu" | "sign-in" | "sign-up" | null
  >(null);

  const [bookingState, setBookingState] = useQueryStates({
    startDateTime: parseAsString,
    pricingTierId: parseAsString,
    numberOfPassengers: parseAsInteger.withDefault(1),
    needsCaptain: parseAsBoolean.withDefault(false),
    addOns: parseAsString,
  });

  const { startDateTime, pricingTierId, numberOfPassengers, needsCaptain, addOns } = bookingState;
  const isFormComplete = !!(startDateTime && pricingTierId && numberOfPassengers);

  // Paid add-on selection from the URL ([{addOnId, quantity}]). Prices are
  // always re-resolved on the server; this is only for the preview + payload.
  const selectedAddOns = useMemo<{ addOnId: string; quantity: number }[]>(() => {
    if (!addOns) return [];
    try {
      const parsed = JSON.parse(addOns);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [addOns]);

  // Resolve against the boat's offerings for the displayed breakdown:
  // complimentary auto-included + selected paid.
  const previewAddOns = useMemo(() => {
    const offered = (boat.boatAddOns ?? []).filter((a) => a.isActive);
    const qtyById = new Map(selectedAddOns.map((s) => [s.addOnId, s.quantity]));
    return offered
      .map((a) => {
        if (a.isComplimentary) {
          return { name: a.name, quantity: 1, total: 0, isComplimentary: true };
        }
        const qty = qtyById.get(a.addOnId) ?? 0;
        if (qty <= 0) return null;
        return {
          name: a.name,
          quantity: qty,
          total: (a.priceCents * qty) / 100,
          isComplimentary: false,
        };
      })
      .filter((x): x is { name: string; quantity: number; total: number; isComplimentary: boolean } => x !== null);
  }, [boat.boatAddOns, selectedAddOns]);

  // Interactive add-on selection lives on THIS page. Quantities are written back
  // to the `addOns` URL param so they survive refresh + the sign-in round-trip.
  const offeredAddOns = useMemo(
    () => (boat.boatAddOns ?? []).filter((a) => a.isActive),
    [boat.boatAddOns],
  );
  const hasAddOns = offeredAddOns.length > 0;
  const addOnQuantities = useMemo(
    () => Object.fromEntries(selectedAddOns.map((s) => [s.addOnId, s.quantity])),
    [selectedAddOns],
  );
  const handleAddOnChange = useCallback(
    (addOnId: string, quantity: number) => {
      const next = selectedAddOns.filter((s) => s.addOnId !== addOnId);
      if (quantity > 0) next.push({ addOnId, quantity });
      setBookingState({ addOns: next.length > 0 ? JSON.stringify(next) : null });
    },
    [selectedAddOns, setBookingState],
  );

  useEffect(() => {
    if (!isFormComplete) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ No booking data found, redirecting to boat page");
      }
      router.push(`/boats/${boat.id}`);
    }
  }, [isFormComplete, boat.id, router]);

  const selectedTier = useMemo(() => {
    return boat.pricingTiers?.find((t) => t.id === pricingTierId) || null;
  }, [boat.pricingTiers, pricingTierId]);

  const priceBreakdown = useMemo(() => {
    if (!selectedTier || !boat) return null;
    return calculateBookingPrice(selectedTier.price, boat.cleaningFee || 0, 0, serviceFeeRate);
  }, [selectedTier, boat, serviceFeeRate]);

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
    [boat],
  );

  const totalLabel = useMemo(() => {
    if (!priceBreakdown) return "";
    return formatCurrency(priceBreakdown.totalPrice, safeBoat.currency);
  }, [priceBreakdown, safeBoat.currency]);

  const handleBookingSubmit = useCallback(
    async (paymentMethod: "request" | "instant") => {
      if (!isFormComplete || !boat || !priceBreakdown) {
        return;
      }
      if (!user) {
        setAuthModal("menu");
        return;
      }

      setIsSubmitting(true);

      try {
        const payload: BookingRequest & { boatId: string } = {
          startDateTime: startDateTime!,
          pricingTierId: selectedTier!.id,
          numberOfPassengers: numberOfPassengers!,
          needsCaptain: !!needsCaptain,
          boatId: boat.id,
          ...(selectedAddOns.length > 0 ? { addOns: selectedAddOns } : {}),
        };

        const result =
          paymentMethod === "instant"
            ? await createInstantBooking(payload)
            : await createBookingRequest(payload);

        if (result?.success) {
          if (paymentMethod === "instant" && "paymentUrl" in result && result.paymentUrl) {
            window.location.href = result.paymentUrl;
          } else if (paymentMethod === "request" && "booking" in result && result.booking) {
            router.push(
              `/bookings/${boat.id}/success?bookingId=${result.booking.id}&type=request`,
            );
          }
        }
      } catch (error) {
        console.error("Booking submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isFormComplete,
      user,
      boat,
      startDateTime,
      selectedTier,
      numberOfPassengers,
      needsCaptain,
      selectedAddOns,
      router,
      priceBreakdown,
    ],
  );

  if (!isFormComplete || !selectedTier) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 lg:pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:px-8 lg:pt-14 lg:pb-12">
        <header className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              You&apos;re almost there
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Complete your charter
            </h1>
          </div>
          <BookingHoldTimer minutes={holdMinutes} />
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_380px]">
          <main className="min-w-0">
            <BookingSummary
              boat={safeBoat}
              selectedTier={selectedTier}
              bookingData={{
                startDateTime: startDateTime!,
                numberOfPassengers: numberOfPassengers!,
              }}
            />

            {hasAddOns && (
              <div className="mt-5 border-t border-gray-100 pt-5 sm:mt-6 sm:pt-6">
                <AddOnsPicker
                  addOns={offeredAddOns}
                  quantities={addOnQuantities}
                  onChange={handleAddOnChange}
                  currency={safeBoat.currency}
                />
              </div>
            )}

            <div className="mt-5 border-t border-gray-100 pt-5 sm:mt-6 sm:pt-6">
              <CharterDetailsForm />
            </div>

            <div className="mt-8 space-y-6 border-t border-gray-100 pt-5 sm:mt-9 sm:pt-6 lg:hidden">
              <KnowBeforeYouGo boatName={boat.name} />
              <BookingPricingSection
                boat={safeBoat}
                selectedTier={selectedTier}
                serviceFeeRate={serviceFeeRate}
                addOns={previewAddOns}
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
                addOns={previewAddOns}
              />
              <BookingSubmitButton
                user={user}
                boat={{ instantBook: boat.instantBook }}
                isSubmitting={isSubmitting}
                onSubmit={handleBookingSubmit}
                onNeedAuth={() => setAuthModal("menu")}
              />
            </div>
          </aside>
        </div>

        <BookingAuthSection
          authModal={authModal}
          onAuthModalChange={setAuthModal}
        />
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90 lg:hidden safe-area-pb">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {totalLabel}
            </p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="ml-auto shrink-0">
            <BookingSubmitButton
              user={user}
              boat={{ instantBook: boat.instantBook }}
              isSubmitting={isSubmitting}
              onSubmit={handleBookingSubmit}
              onNeedAuth={() => setAuthModal("menu")}
              layout="bar"
            />
          </div>
        </div>
        {boat.instantBook && user && (
          <p className="mx-auto mt-2 max-w-5xl text-center text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => handleBookingSubmit("request")}
              disabled={isSubmitting}
              className="font-medium text-foreground underline-offset-2 hover:underline disabled:opacity-50"
            >
              Send request instead
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
