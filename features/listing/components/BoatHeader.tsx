"use client";

import { Button } from "@/shared/components/ui/button";
import { Heart, Flag, Share2 } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Boat } from "@/shared/lib/types/types";

interface BoatHeaderProps {
  boat: Boat;
}

export function BoatHeader({ boat }: BoatHeaderProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="container flex items-center justify-between">
        <div>
          <h1 className="sr-only">{boat.name}</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1 text-sm text-gray-500">
              <li>
                <a href="/" className="hover:text-primary">
                  Home
                </a>
              </li>
              <li>
                <span className="mx-1">/</span>
              </li>
              <li>
                <a href="/boats" className="hover:text-primary">
                  Boats
                </a>
              </li>
              <li>
                <span className="mx-1">/</span>
              </li>
              <li className="text-gray-700 font-medium truncate max-w-[150px] sm:max-w-[300px]">
                {boat.name}
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={toggleFavorite}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
                    }`}
                  />
                  <span className="sr-only">
                    {isFavorite ? "Remove from favorites" : "Add to favorites"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isFavorite ? "Remove from favorites" : "Add to favorites"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-5 w-5 text-gray-500" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this boat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Flag className="h-5 w-5 text-gray-500" />
                  <span className="sr-only">Report</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Report this listing</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
