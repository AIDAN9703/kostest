import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/database/db";
import { boats } from "@/database/schema-calendar-test";
import { eq } from "drizzle-orm";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConnectCalendarButton from "@/components/admin/calendar/ConnectCalendarButton";

export const metadata: Metadata = {
  title: "Boat Calendar | Admin Dashboard",
  description: "Manage boat calendar integrations",
};

export default async function BoatCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Resolve the params promise
  const resolvedParams = await params;
  
  // Fetch boat by ID
  const boatData = await db
    .select()
    .from(boats)
    .where(eq(boats.id, resolvedParams.id))
    .limit(1);

  if (!boatData.length) {
    notFound();
  }

  const boat = boatData[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/boats"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{boat.name}</h1>
          <p className="text-gray-500">Calendar Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Connection</CardTitle>
              <CardDescription>
                Connect this boat to Google Calendar to manage its availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                {boat.hasCalendar ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center bg-green-50 text-green-700 h-12 w-12 rounded-full mx-auto">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-center font-medium">Calendar Connected</h3>
                    <p className="text-center text-sm text-gray-500">
                      This boat is connected to Google Calendar. You can manage its
                      availability and view upcoming bookings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center bg-blue-50 text-blue-700 h-12 w-12 rounded-full mx-auto">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-center font-medium">
                      Connect to Google Calendar
                    </h3>
                    <p className="text-center text-sm text-gray-500">
                      Connect this boat to Google Calendar to automatically manage
                      its availability and sync bookings.
                    </p>
                    <div className="flex justify-center">
                      <ConnectCalendarButton 
                        boatId={boat.id.toString()}
                        boatName={boat.name}
                        hasCalendar={boat.hasCalendar}
                      />
                    </div>
                  </div>
                )}
              </div>

              {boat.hasCalendar && (
                <div className="space-y-4">
                  <h3 className="font-medium">Sync Settings</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Auto-sync frequency</p>
                        <p className="text-sm text-gray-500">
                          How often the calendar syncs with Google Calendar
                        </p>
                      </div>
                      <div>
                        <select className="border p-2 rounded-md">
                          <option>15 minutes</option>
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Sync Now</p>
                        <p className="text-sm text-gray-500">
                          Manually sync the calendar with Google Calendar
                        </p>
                      </div>
                      <div>
                        <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm">
                          Sync
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Calendar Details</CardTitle>
              <CardDescription>Calendar connection information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-sm font-medium">
                  {boat.hasCalendar ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-red-600">Not Connected</span>
                  )}
                </p>
              </div>
              
              {boat.hasCalendar && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Last Synced
                    </p>
                    <p className="text-sm">Today at 10:30 AM</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Sync Frequency
                    </p>
                    <p className="text-sm">Every 15 minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Actions</p>
                    <div className="space-y-2 mt-2">
                      <ConnectCalendarButton 
                        boatId={boat.id.toString()}
                        boatName={boat.name}
                        hasCalendar={boat.hasCalendar}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 