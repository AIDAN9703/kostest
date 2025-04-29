import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Calendar, Users, Navigation, Globe } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";
import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { Boat } from "@/types/types";
import BoatCard from "@/components/ui/boat-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Term Charters | KOSyachts",
  description: "Experience extended luxury voyages with our premium term charters.",
};

// FAQs
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
  },
  {
    question: "Can we customize our itinerary?",
    answer: "Absolutely! While we offer suggested itineraries, we work with you to customize your journey based on your interests, time frame, and preferences. Your captain may suggest modifications based on weather and sea conditions."
  }
];

// Benefits of term charters
const benefits = [
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Extended Duration",
    description: "From a few days to several weeks, experience true nautical living"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Professional Crew",
    description: "Expert captains and staff handling all vessel operations"
  },
  {
    icon: <Navigation className="h-6 w-6" />,
    title: "Multiple Destinations",
    description: "Explore various locations during a single journey"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Exclusive Access",
    description: "Reach secluded areas only accessible by private vessel"
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

export default async function TermChartersPage() {
  // Fetch term charter boats
  const termCharterBoats = await getTermCharterBoats();

  return (
    <ExperienceLayout
      title="Term Charters"
      description="Experience extended voyages with premium vessels and professional crews. Discover multiple destinations in ultimate comfort and luxury."
      heroImage="/images/experiences/termcharter.avif"
      buttonText="Request a Quote"
      buttonLink="mailto:contact@kosyachts.com"
      imageOverlayColor="from-[#0c4a6e]/70 to-[#0c4a6e]/40"
      faqs={faqs}
      relatedExperiences={[]}
    >
      <div className="max-w-7xl mx-auto space-y-10 px-6 font-poppins">
        {/* Modern Intro Section */}
        <section className="pt-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 md:p-12">
            <div className="flex flex-col max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-primary font-poppins">Extended Luxury Voyages</h2>
              <p className="text-gray-600 mb-8 leading-relaxed font-poppins">
                Our term charters combine luxury accommodations, professional crew, and the freedom to explore 
                multiple destinations. With all aspects of vessel operation handled for you, simply relax and 
                focus on creating unforgettable memories.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className=" p-2 mr-3 text-primary">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-primary font-poppins">{benefit.title}</h3>
                      <p className="text-sm text-gray-500 font-poppins">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* What's Included Section */}
        <section className="pb-12">
          <div className=" rounded-xl p-8 md:p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 text-[#0c4a6e] font-poppins">What's Included</h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
                Our term charters provide everything you need for an exceptional voyage.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                "Professional captain and crew",
                "Luxury accommodations onboard",
                "Navigation and vessel operation",
                "Itinerary planning assistance",
                "Daily cabin service",
                "Water toys and equipment",
                "24/7 shoreside support",
                "Comprehensive insurance"
              ].map((item, index) => (
                <div key={index} className=" p-4 flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-gray-700 font-poppins">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Available Boats Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-[#0c4a6e] font-poppins">Available Term Charter Boats</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
              Browse our selection of premier vessels available for extended journeys. 
              Each boat includes professional crew and luxury accommodations.
            </p>
          </div>
          <div className="text-right text-primary font-poppins p-2">Contact our charter team</div>
          
          {termCharterBoats.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {termCharterBoats.map(boat => (
                <BoatCard 
                  key={boat.id} 
                  boat={boat}
                  showPrice={false}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 font-poppins">Custom Term Charter Options</h3>
              <p className="text-gray-600 mb-6 font-poppins">
                We can arrange a custom term charter experience with any of our premium vessels. 
                Contact our team to discuss your specific requirements.
              </p>
              <Link href="/contact">
                <Button className="bg-primary hover:bg-primary/90 text-white font-poppins">
                  Contact Our Charter Team
                </Button>
              </Link>
            </div>
          )}
        </section>
        
      </div>
    </ExperienceLayout>
  );
} 