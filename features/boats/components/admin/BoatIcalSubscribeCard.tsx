"use client";

import { useState } from "react";
import { Check, Copy, Rss } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface BoatIcalSubscribeCardProps {
  boatName: string;
  feedUrl: string | null;
  errorMessage: string | null;
}

export function BoatIcalSubscribeCard({
  boatName,
  feedUrl,
  errorMessage,
}: BoatIcalSubscribeCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-medium">iCal feed unavailable</p>
        <p className="mt-1 text-amber-800/90 dark:text-amber-300/90">{errorMessage}</p>
      </div>
    );
  }

  if (!feedUrl) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-2">
          <Rss className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-foreground">Subscribe in Google Calendar (iCal)</p>
            <p className="text-xs text-muted-foreground">
              Paste this URL under Google Calendar → Settings → Add calendar → From URL. Shows
              confirmed, approved, and pending bookings for {boatName}. Google may take up to an hour
              to refresh.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy link
            </>
          )}
        </Button>
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          readOnly
          value={feedUrl}
          className="h-9 font-mono text-xs text-muted-foreground"
          onFocus={(e) => e.target.select()}
        />
      </div>
    </div>
  );
}
