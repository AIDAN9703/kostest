"use client";

import { Boat } from "@/lib/types/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/general-utils";

interface DescriptionProps {
  boat: Boat;
}

export function Description({ boat }: DescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const description = boat.description || "No description provided.";
  const isLongDescription = description.length > 350;
  const displayText = !expanded && isLongDescription
    ? description.substring(0, 350) + "..."
    : description;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold text-gray-900">
          About This Charter
        </h2>
      </div>
      
      <div className={cn(
        "rounded-xl border border-gray-200",
        "transition-all duration-200 hover:border-primary/20",
        "bg-white dark:bg-gray-900 dark:border-gray-800"
      )}>
        <div className="p-6">
          <AnimatePresence initial={false}>
            <motion.div
              key={expanded ? "expanded" : "collapsed"}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-gray-700 leading-relaxed dark:text-gray-300 whitespace-pre-line">
                {displayText}
              </p>
            </motion.div>
          </AnimatePresence>
          
          {isLongDescription && (
            <Button 
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls="description-text"
              className={cn(
                "mt-4 h-auto font-medium",
                "text-primary hover:bg-transparent hover:text-primary/90",
                "focus:ring-2 focus:ring-primary/20 focus:outline-none"
              )}
            >
              {expanded ? "Show less" : "Read more"}
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-1 text-xs"
              >
                ▼
              </motion.span>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
} 