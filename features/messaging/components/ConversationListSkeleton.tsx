import React from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/general-utils";

interface ConversationListSkeletonProps {
  className?: string;
  itemCount?: number;
}

export function ConversationListSkeleton({ 
  className, 
  itemCount = 8 
}: ConversationListSkeletonProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {/* Header skeleton */}
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {/* Search skeleton */}
        <div className="p-4 border-b">
          <div className="relative">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Conversation list skeleton */}
        <div className="divide-y divide-border">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Avatar skeleton */}
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    {/* Name skeleton */}
                    <Skeleton className="h-4 w-24" />
                    {/* Time skeleton */}
                    <Skeleton className="h-3 w-12" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {/* Message preview skeleton */}
                    <Skeleton className="h-3 w-32" />
                    {/* Badge skeleton */}
                    {index % 3 === 0 && (
                      <Skeleton className="h-5 w-5 rounded-full" />
                    )}
                  </div>
                  
                  {/* Type badge skeleton */}
                  {index % 4 === 0 && (
                    <Skeleton className="h-5 w-16 rounded-full mt-2" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Header skeleton */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Messages area skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div 
            key={index} 
            className={cn(
              "flex gap-3",
              index % 2 === 0 ? "justify-start" : "justify-end"
            )}
          >
            {index % 2 === 0 && (
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            )}
            
            <div className={cn(
              "max-w-[70%] space-y-1",
              index % 2 === 0 ? "items-start" : "items-end flex flex-col"
            )}>
              <Skeleton className={cn(
                "h-16 rounded-lg",
                index % 2 === 0 ? "w-48" : "w-40"
              )} />
              <Skeleton className="h-3 w-12" />
            </div>
            
            {index % 2 === 1 && (
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </div>
  );
} 