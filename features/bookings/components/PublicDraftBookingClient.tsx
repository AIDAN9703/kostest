"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DraftProposalTripDetails,
  DraftProposalBoatsList,
  DraftProposalAddOns,
  DraftProposalPricingCard,
  DraftProposalActions,
} from "./draft-proposal";
import type { DraftProposalData } from "@/features/bookings/lib/draft-proposal.types";

const DEFAULT_IMAGE = "/images/herooption22.jpg";

export default function PublicDraftBookingClient({
  data,
  publicToken,
}: {
  data: DraftProposalData;
  publicToken: string;
}) {
  const [customerNote, setCustomerNote] = useState("");
  const heroImage = data.bookings[0]?.boatMainImage ?? DEFAULT_IMAGE;
  const startDate = new Date(data.startDateTime);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-6">
          {/* Hero card - horizontal header */}
          <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[21/9]">
              <Image
                src={heroImage}
                alt={data.bookings[0]?.boatName ?? "Charter"}
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 640px) 100vw, 1280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end">
                <div className="w-full bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
                    Your Charter Proposal
                  </p>
                  <h1 className="mt-1 font-poppins text-2xl font-bold text-white drop-shadow-md sm:text-3xl md:text-4xl">
                    {data.customerName}&rsquo;s Experience
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/90">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {startDate.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {data.numberOfPassengers} {data.numberOfPassengers === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Left column - trip details & what's included */}
            <div className="space-y-6">
              <Card className="rounded-2xl border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <DraftProposalTripDetails data={data} />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">What&apos;s Included</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Boats
                    </p>
                    <DraftProposalBoatsList bookings={data.bookings} />
                  </div>
                  {data.bookings.some((b) => (b.addOns ?? []).length > 0) && (
                    <div>
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Add-ons
                      </p>
                      <DraftProposalAddOns bookings={data.bookings} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column - payment summary & actions */}
            <div className="space-y-6">
              <Card className="rounded-2xl border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-8">
                  <DraftProposalPricingCard bookings={data.bookings} />
                  <DraftProposalActions
                    publicToken={publicToken}
                    customerNote={customerNote}
                    onCustomerNoteChange={setCustomerNote}
                    allowPayment={data.allowPayment}
                    isAccepted={!!data.acceptedAt}
                    depositAmountCents={data.depositAmountCents}
                    totalAmountCents={data.totalAmountCents}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
