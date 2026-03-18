"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Receipt } from "lucide-react";

export function StripePortalButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="gap-1.5"
    >
      <Receipt className="h-4 w-4" />
      {loading ? "Loading..." : "Receipts & Invoices"}
    </Button>
  );
}
