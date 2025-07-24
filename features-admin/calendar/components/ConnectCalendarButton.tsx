"use client";

import { Button } from "@/shared/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ConnectCalendarButtonProps {
  boatId: string;
  boatName: string;
  hasCalendar?: boolean;
}

export default function ConnectCalendarButton({
  boatId,
  boatName,
  hasCalendar = false,
}: ConnectCalendarButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Get authorization URL from the server
      const response = await fetch(`/api/calendar/auth-url?boatId=${boatId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to get authorization URL: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirect to Google's OAuth page
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Error connecting calendar:", error);
      alert("Failed to connect calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect the calendar for ${boatName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/disconnect?boatId=${boatId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect calendar: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh the page to show updated status
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to disconnect calendar");
      }
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      alert("Failed to disconnect calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (hasCalendar) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center text-sm text-green-600">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Calendar connected</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/boats/${boatId}/calendar`)}
          >
            Manage Calendar
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDisconnect}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              "Disconnect"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4" />
          Connect Google Calendar
        </>
      )}
    </Button>
  );
} 