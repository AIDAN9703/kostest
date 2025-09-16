"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BoatCalendar from "@/features-admin/boats/components/BoatCalendar";
import BoatCalendarManager from "@/features-admin/boats/components/BoatCalendarManager";

interface BoatCalendar {
  id: string;
  calendarName: string;
  calendarId: string;
  ownerType: 'ADMIN' | 'OWNER';
  syncEnabled: boolean;
  lastSyncAt?: Date;
  lastSyncStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
}

interface Boat {
  id: string;
  name: string;
  timezone?: string | null;
}

export default function BoatCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [boat, setBoat] = useState<Boat | null>(null);
  const [calendars, setCalendars] = useState<BoatCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [boatId, setBoatId] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        setBoatId(resolvedParams.id);
        
        // Fetch boat data
        const boatResponse = await fetch(`/api/admin/boats/${resolvedParams.id}`);
        if (!boatResponse.ok) {
          throw new Error('Failed to fetch boat');
        }
        const boatData = await boatResponse.json();
        setBoat(boatData);
        
        // Fetch calendars
        const calendarsResponse = await fetch(`/api/admin/boats/${resolvedParams.id}/calendars`);
        if (!calendarsResponse.ok) {
          throw new Error('Failed to fetch calendars');
        }
        const calendarsData = await calendarsResponse.json();
        setCalendars(calendarsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading boat data:', error);
        setLoading(false);
      }
    }

    loadData();
  }, [params]);

  const handleCalendarsChange = (newCalendars: BoatCalendar[]) => {
    setCalendars(newCalendars);
    // TODO: Persist to database via API call
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!boat) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/boats/${boat.id}`}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{boat.name}</h1>
          <p className="text-gray-500">Booking Calendar</p>
        </div>
      </div>

      {/* External Calendar Management */}
      <BoatCalendarManager
        boatId={boat.id}
        boatName={boat.name}
        calendars={calendars}
        onCalendarsChange={handleCalendarsChange}
      />

      {/* FullCalendar Component */}
      <BoatCalendar 
        boatId={boat.id} 
        boatName={boat.name}
        timezone={boat.timezone || undefined}
      />
    </div>
  );
} 