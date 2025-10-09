"use client";

import { useState } from "react";
import { Switch } from "@/shared/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ActiveStatusToggleProps {
  boatId: string;
  initialStatus: boolean;
}

export default function ActiveStatusToggle({ 
  boatId, 
  initialStatus 
}: ActiveStatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/boats/${boatId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: checked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setIsActive(checked);
      toast({
        title: "Status updated",
        description: `Boat has been ${checked ? "activated" : "deactivated"}.`,
      });
      
      // Refresh the page to reflect updated status
      router.refresh();
    } catch (error) {
      console.error("Error updating boat status:", error);
      toast({
        title: "Error",
        description: "Failed to update boat status. Please try again.",
        variant: "destructive",
      });
      // Revert the switch to its previous state
      setIsActive(initialStatus);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <span className="text-sm font-medium">
        {isLoading ? (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating...
          </div>
        ) : (
          isActive ? "Active" : "Inactive"
        )}
      </span>
    </div>
  );
} 