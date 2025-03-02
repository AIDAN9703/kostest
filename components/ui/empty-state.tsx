import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  iconClassName = "bg-primary/10 text-primary",
}: EmptyStateProps) {
  return (
    <Card className="w-full border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className={`rounded-full p-4 mb-6 ${iconClassName} animate-pulse`}>
          <Icon className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 text-center max-w-md mb-8">
          {description}
        </p>
        <div className="flex gap-3">
          {actionLabel && actionHref && (
            <Button asChild className="bg-primary hover:bg-primary/90 text-white px-6 transition-all duration-300 hover:translate-y-[-2px]">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Button variant="outline" asChild className="border-amber-200 text-amber-800 hover:bg-amber-50 px-6 transition-all duration-300 hover:translate-y-[-2px]">
              <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 