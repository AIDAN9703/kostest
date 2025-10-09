import { ReactNode } from "react";
import { cn } from "@/shared/utils/general-utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl", 
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[90rem]",
  full: "max-w-none",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/**
 * Modern PageContainer - Provides consistent spacing and max-width constraints
 * 
 * Features:
 * - Responsive max-width constraints
 * - Consistent padding options
 * - Smooth scrolling behavior
 * - Mobile-first responsive design
 */
export function PageContainer({ 
  children, 
  className,
  maxWidth = "xl",
  padding = "md"
}: PageContainerProps) {
  return (
    <div 
      className={cn(
        // Base styles
        "w-full mx-auto",
        // Max width
        maxWidthClasses[maxWidth],
        // Padding
        paddingClasses[padding],
        // Smooth scrolling
        "scroll-smooth",
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * PageSection - For grouping related content with consistent spacing
 */
interface PageSectionProps {
  children: ReactNode;
  className?: string;
  spacing?: "none" | "sm" | "md" | "lg";
}

const spacingClasses = {
  none: "",
  sm: "space-y-4",
  md: "space-y-6", 
  lg: "space-y-8",
};

export function PageSection({ 
  children, 
  className,
  spacing = "md"
}: PageSectionProps) {
  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}

/**
 * PageGrid - Responsive grid layouts for admin pages
 */
interface PageGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}

const gridColsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 lg:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function PageGrid({ 
  children, 
  className,
  cols = 2
}: PageGridProps) {
  return (
    <div className={cn(
      "grid gap-6",
      gridColsClasses[cols],
      className
    )}>
      {children}
    </div>
  );
}
