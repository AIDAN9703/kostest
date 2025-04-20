"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Boat } from "@/types/types";
import BookingForm from "./BookingForm";
import Image from "next/image";
import { CalendarClock } from "lucide-react";
import { User } from "next-auth";

interface BookingFormToggleProps {
  boat: Boat;
  user: User | undefined;
}

export default function BookingFormToggle({ boat, user }: BookingFormToggleProps) {
  const [activeTab, setActiveTab] = useState<string>("request");
  
  return (
    <div className="p-5">
      <Tabs
        defaultValue="request"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="mb-6">
          <div className="flex w-full border-b border-gray-200">
            <button
              onClick={() => setActiveTab("request")}
              className={`flex items-center justify-center gap-1.5 py-3 px-3 flex-1 font-medium text-sm ${
                activeTab === "request"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CalendarClock className="h-4 w-4" />
              <span>Request to Book</span>
            </button>
            <button
              onClick={() => setActiveTab("instant")}
              className={`flex items-center justify-center gap-1.5 py-3 px-3 flex-1 font-medium text-sm ${
                activeTab === "instant"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Image 
                src="/icons/instant-book.svg" 
                width={16} 
                height={16} 
                alt="Instant Book" 
                className="h-4 w-4" 
              />
              <span>Instant Book</span>
            </button>
          </div>
        </div>
        
        <TabsContent value="request" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <BookingForm variant="REQUEST" boat={boat} user={user} />
        </TabsContent>
        
        <TabsContent value="instant" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <BookingForm variant="INSTANT" boat={boat} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 