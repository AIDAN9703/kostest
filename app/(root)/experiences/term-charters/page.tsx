import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, Navigation, Shield, Anchor } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";
import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { Boat } from "@/lib/types/types";
import BoatCard from "@/components/ui/boat-card";
import { Button } from "@/components/ui/button";
import RequestTermCharter from "./RequestTermCharter";

export const metadata: Metadata = {
  title: "Term Charters | KOSyachts",
  description: "Experience extended luxury voyages with our premium term charters.",
};

// FAQs - reduced to just most important ones
const faqs = [
  {
    question: "What is a term charter?",
    answer: "A term charter is an extended boat rental, typically ranging from several days to weeks or even months. Unlike day charters, term charters include overnight accommodations and allow for exploration of multiple destinations."
  },
  {
    question: "What's included in a term charter?",
    answer: "Our term charters include the vessel, professional crew (captain and additional crew depending on vessel size), onboard accommodations, insurance, standard equipment, and basic amenities. Food, beverages, fuel, dockage fees, and special requests are typically additional but can be included in custom packages."
  },
  {
    question: "Do I need boating experience for a term charter?",
    answer: "No experience is necessary as our term charters include professional crew who handle all aspects of vessel operation. You can be as involved or hands-off as you prefer."
  }
];

// Function to get term charter boats
async function getTermCharterBoats(): Promise<Boat[]> {
  try {
    const results = await db
      .select()
      .from(boats)
      .where(and(eq(boats.termCharter, true), eq(boats.active, true)))
      .limit(6);
    
    return results as unknown as Boat[];
  } catch (error) {
    console.error("Error fetching term charter boats:", error);
    return [];
  }
}

// Destinations for gallery
const destinations = [
  {
    name: "Bahamas",
    image: "/images/experiences/bahamas.jpg",
    altText: "Crystal clear Bahamian waters with yacht"
  },
  {
    name: "Caribbean",
    image: "/images/experiences/caribbean.jpg",
    altText: "Luxury yacht in Caribbean waters"
  },
  {
    name: "Mediterranean",
    image: "/images/experiences/mediterranean.jpg",
    altText: "Yacht cruising along Mediterranean coast"
  },
  {
    name: "Florida Keys",
    image: "/images/experiences/keys.jpg",
    altText: "Yacht in Florida Keys with sunset"
  }
];

export default async function TermChartersPage() {
  // Fetch term charter boats
  const termCharterBoats = await getTermCharterBoats();

  return (
    <ExperienceLayout
      title="Term Charters"
      description="Experience extended voyages with premium vessels and professional crews. Discover multiple destinations in ultimate comfort and luxury."
      heroImage="/images/experiences/termcharter.avif"
      buttonText="Get Started"
      buttonLink="#request-quote"
      imageOverlayColor="from-[#0c4a6e]/70 to-[#0c4a6e]/40"
      faqs={faqs}
      relatedExperiences={[]}
    >
      <div className="space-y-16">
        {/* Request Form */}
        <section id="request-quote" className=" py-12 px-6 md:px-12 -mx-8">
          <div className="max-w-5xl mx-auto bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <RequestTermCharter />
          </div>
        </section>
        
        {/* Available Boats Section */}
        {termCharterBoats.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 text-primary">Available Vessels</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our selection of premier vessels available for extended journeys
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {termCharterBoats.map(boat => (
                <BoatCard 
                  key={boat.id} 
                  boat={boat}
                  showPrice={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </ExperienceLayout>
  );
} 