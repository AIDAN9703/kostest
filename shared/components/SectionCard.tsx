import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils/general-utils";

interface SectionCardProps {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  children,
  className = "",
  action,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-1 flex-col rounded-2xl border-border/60 shadow-sm",
        className,
      )}
    >
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1 p-0">{children}</CardContent>
    </Card>
  );
}
