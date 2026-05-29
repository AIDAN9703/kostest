import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBoatById } from "@/features/boats/actions/boat-actions";
import AdminBoatCalendar from "@/features/boats/components/AdminBoatCalendar";
import { BoatIcalSubscribeCard } from "@/features/boats/components/admin/BoatIcalSubscribeCard";
import { buildFeedUrl } from "@/shared/lib/calendar/feed-tokens";
import { getBaseUrl } from "@/shared/lib/utils/base-url";

interface BoatCalendarPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoatCalendarPage({ params }: BoatCalendarPageProps) {
  const { id: boatId } = await params;
  const boat = await getBoatById(boatId);

  if (!boat) {
    notFound();
  }

  let icalFeedUrl: string | null = null;
  let icalFeedError: string | null = null;

  try {
    icalFeedUrl = buildFeedUrl(getBaseUrl(), {
      scope: "bookings",
      boatId,
    });
  } catch {
    icalFeedError =
      "Add CALENDAR_FEED_SECRET to .env.local (any long random string), then restart the dev server.";
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/boats/${boatId}`}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{boat.name}</h1>
          <p className="text-muted-foreground">Booking calendar</p>
        </div>
      </div>

      <BoatIcalSubscribeCard
        boatName={boat.name}
        feedUrl={icalFeedUrl}
        errorMessage={icalFeedError}
      />

      <AdminBoatCalendar
        boatId={boatId}
        boatName={boat.name}
        timezone={boat.timezone ?? undefined}
      />
    </div>
  );
}
