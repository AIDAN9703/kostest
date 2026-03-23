"use client";

import Image from "next/image";
import { CalendarDays, Users } from "lucide-react";
import type { DraftProposalData } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalHeroProps {
  data: DraftProposalData;
}

const DEFAULT_HERO = "/images/herooption22.jpg";

export function DraftProposalHero({ data }: DraftProposalHeroProps) {
  const heroImage = data.bookings[0]?.boatMainImage ?? DEFAULT_HERO;
  const startDate = new Date(data.startDateTime);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Boat image - positioned so subject is top-right, white fade from left */}
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[21/9]">
        <Image
          src={heroImage}
          alt={data.bookings[0]?.boatName ?? "Charter"}
          fill
          className="object-cover object-right-top"
          priority
          quality={90}
          sizes="100vw"
        />
        {/* White fade: strong on left, transparent on right - image shows through on right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, white 0%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.4) 50%, transparent 75%)",
          }}
        />
        {/* Subtle bottom fade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        {/* Content overlay - bottom left */}
        <div className="absolute inset-0 flex items-end justify-start p-6 sm:p-8 md:p-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">
              Your Charter Proposal
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-primary drop-shadow-sm sm:text-3xl md:text-4xl">
              {data.customerName}&rsquo;s Experience
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-primary/90">
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
                {data.numberOfPassengers}{" "}
                {data.numberOfPassengers === 1 ? "guest" : "guests"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
