"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { acceptDraftBookingAction } from "@/features/bookings/actions/draft-booking-actions";
import type { AcceptDraftBookingResponse } from "@/features/bookings/actions/draft-booking-actions";

import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { centsToDollars } from "@/shared/lib/utils/money-utils";

import {
  Anchor,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

type DraftBookingDisplay = {
  id: string;
  boatId: string;
  boatName: string;
  boatMainImage: string | null;
  totalCents: number;
  addOns: unknown;
};

type DraftBookingGroup = {
  id: string;
  customerName: string;
  customerEmail: string;
  startDateTime: Date;
  endDateTime: Date | null;
  numberOfPassengers: number;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  allowPayment: boolean;
  paymentType: string | null;
  acceptedAt: Date | null;
  bookings: DraftBookingDisplay[];
};

const initialActionState: AcceptDraftBookingResponse = { success: false };

export default function PublicDraftBookingClient({
  data,
  publicToken,
}: {
  data: DraftBookingGroup;
  publicToken: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [actionState, setActionState] =
    useState<AcceptDraftBookingResponse>(initialActionState);
  const [customerNote, setCustomerNote] = useState("");

  const totalCents = data.bookings.reduce((s, b) => s + b.totalCents, 0);
  const serviceFeeCents = Math.round(totalCents * 0.035);
  const grandTotalCents = totalCents + serviceFeeCents;

  const heroImage =
    data.bookings[0]?.boatMainImage || "/images/herooption22.jpg";
  const isAccepted = !!data.acceptedAt;

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "success" && sessionId) {
      const verifyAndRedirect = async () => {
        try {
          const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
          const dataRes = await res.json();

          if (res.status === 202) {
            setTimeout(verifyAndRedirect, 2000);
            return;
          }

          if (dataRes.success && dataRes.bookingId) {
            router.push(`/bookings/payment-success/${dataRes.bookingId}`);
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      };
      verifyAndRedirect();
    }
  }, [searchParams, router]);

  const handleAccept = (payNow: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("publicToken", publicToken);
      formData.set("payNow", String(payNow));
      formData.set("customerNote", customerNote);

      const result = await acceptDraftBookingAction(
        initialActionState,
        formData
      );
      setActionState(result);

      if (result.success && result.data?.hostedInvoiceUrl && payNow) {
        window.location.href = result.data.hostedInvoiceUrl;
      } else if (result.success && !payNow) {
        window.location.reload();
      }
    });
  };

  return (
    <>
      <div className="relative h-[40vh] w-full overflow-hidden">
        <Image
          src={heroImage}
          alt={data.customerName}
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-white/60 to-white" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-6 pb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Your Charter Booking
            </p>
            <h1 className="font-poppins text-3xl font-bold text-primary drop-shadow-md md:text-5xl">
              {data.customerName}&rsquo;s Experience
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-primary">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {new Date(data.startDateTime).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {data.numberOfPassengers} guests
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="-mt-10 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <CardHeader className="border-b border-gray-100 bg-gray-50/60 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-6 md:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Start
                    </p>
                    <p className="mt-1 font-medium text-gray-900">
                      {new Date(data.startDateTime).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}{" "}
                      at{" "}
                      {new Date(data.startDateTime).toLocaleTimeString(
                        undefined,
                        { hour: "numeric", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Pickup
                    </p>
                    <p className="mt-1 font-medium text-gray-900">
                      {data.pickupLocation || "To be confirmed"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <CardHeader className="border-b border-gray-100 bg-gray-50/60 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Anchor className="h-5 w-5 text-primary" />
                  Boats Included
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {data.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4 transition-all duration-300 hover:shadow-md md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex gap-4">
                      <Link
                        href={`/boats/${b.boatId}`}
                        className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-gray-200"
                      >
                        <Image
                          src={b.boatMainImage || "/images/herooption22.jpg"}
                          alt={b.boatName}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="112px"
                        />
                      </Link>
                      <div>
                        <Link
                          href={`/boats/${b.boatId}`}
                          className="text-base font-semibold text-gray-900 transition-colors hover:text-primary"
                        >
                          {b.boatName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Base charter
                        </p>
                        <div className="mt-2">
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(centsToDollars(b.totalCents))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <CardHeader className="border-b border-gray-100 bg-gray-50/60 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Notes or Change Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Label className="text-xs font-medium text-muted-foreground">
                  Your message
                </Label>
                <Textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Anything you'd like to adjust?"
                  className="mt-2 rounded-xl border-gray-200 bg-gray-50/60 placeholder:text-gray-400 focus-visible:ring-primary"
                  disabled={isAccepted}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <CardHeader className="border-b border-gray-100 bg-gray-50/60 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6 text-sm">
                {data.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/60 p-4"
                  >
                    <p className="font-semibold text-gray-900">{b.boatName}</p>
                    <div className="flex justify-between font-medium text-primary">
                      <span>Subtotal</span>
                      <span>{formatCurrency(centsToDollars(b.totalCents))}</span>
                    </div>
                  </div>
                ))}
                <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(centsToDollars(totalCents))}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Processing Fee (3.5%)</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(centsToDollars(serviceFeeCents))}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(centsToDollars(grandTotalCents))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {isAccepted ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  Booking accepted. Our team will follow up with payment
                  details.
                </div>
              ) : (
                <>
                  {data.allowPayment && (
                    <Button
                      size="lg"
                      className="w-full rounded-xl text-base font-semibold shadow-md transition-all duration-300"
                      disabled={pending}
                      onClick={() => handleAccept(true)}
                    >
                      {pending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Accept & Pay Now"
                      )}
                    </Button>
                  )}
                  <Button
                    variant={data.allowPayment ? "outline" : "default"}
                    size="lg"
                    className="w-full rounded-xl text-base font-semibold shadow-md transition-all duration-300"
                    disabled={pending}
                    onClick={() => handleAccept(false)}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      data.allowPayment ? "Accept & Pay Later" : "Accept Booking"
                    )}
                  </Button>
                </>
              )}

              {actionState.error && (
                <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
                  {actionState.error}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
