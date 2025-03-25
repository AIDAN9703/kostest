"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";

interface BackToDashboardProps {
  className?: string;
}

const BackToDashboard = ({ className = "" }: BackToDashboardProps) => {
  const pathname = usePathname();
  return (
    <div className={`px-6 ${className}`}>
      {pathname !== '/profile' && (
        <Button
        variant="outline"
        size="sm"
        className="border-primary/20 text-primary hover:bg-primary/5"
        asChild
      >
        <Link href="/profile" className="flex items-center gap-1.5">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        </Button>
      )}
    </div>
  );
};

export default BackToDashboard; 