import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, Navigation, Shield, Anchor, Clock, MapPin, Star, CheckCircle } from "lucide-react";
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
      faqs={faqs}
      relatedExperiences={[]}
    >
      {/* Benefits Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Why Choose Term Charters</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            Extended Luxury on the Water
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Discover the freedom of multi-day adventures with our premium term charter experiences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
            <div className="bg-gold/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-medium text-primary mb-2">Extended Adventures</h3>
            <p className="text-gray-600 font-light">Multi-day journeys from weekend getaways to month-long expeditions</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
            <div className="bg-gold/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-medium text-primary mb-2">Professional Crew</h3>
            <p className="text-gray-600 font-light">Experienced captains and crew handle all navigation and service</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
            <div className="bg-gold/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-medium text-primary mb-2">Multiple Destinations</h3>
            <p className="text-gray-600 font-light">Explore different ports, islands, and coastal destinations</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
            <div className="bg-gold/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-medium text-primary mb-2">All-Inclusive Options</h3>
            <p className="text-gray-600 font-light">Comprehensive packages including meals, beverages, and activities</p>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Popular Destinations</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            Where Will You Go?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Explore stunning destinations with our extended charter experiences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="relative h-48">
              <Image
                src="/images/experiences/sunset.jpg"
                alt="Bahamas Waters"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-4 left-4">
                <Image
                  src="/icons/kosupdatedlogo.webp"
                  alt="KOS Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-medium text-primary mb-2">Bahamas</h3>
              <p className="text-gray-600 font-light mb-4">Crystal clear waters, pristine beaches, and vibrant marine life in this tropical paradise.</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>3-14 days recommended</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="relative h-48">
              <Image
                src="/images/experiences/family.jpg"
                alt="Florida Keys"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-4 left-4">
                <Image
                  src="/icons/kosupdatedlogo.webp"
                  alt="KOS Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-medium text-primary mb-2">Florida Keys</h3>
              <p className="text-gray-600 font-light mb-4">Island-hopping adventures through America's Caribbean with world-class fishing and diving.</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>2-7 days recommended</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="relative h-48">
              <Image
                src="/images/experiences/yachtparty.jpg"
                alt="Caribbean Waters"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-4 left-4">
                <Image
                  src="/icons/kosupdatedlogo.webp"
                  alt="KOS Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-medium text-primary mb-2">Caribbean</h3>
              <p className="text-gray-600 font-light mb-4">Exotic islands, turquoise waters, and endless summer in the world's premier yachting destination.</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>7-30 days recommended</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">What's Included</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            Everything You Need
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Our term charters include comprehensive services for a worry-free experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-medium text-primary mb-6">Standard Inclusions</h3>
            <div className="space-y-4">
              {[
                "Luxury yacht with full accommodations",
                "Professional captain and crew",
                "All safety equipment and insurance",
                "Basic utilities (water, power, Wi-Fi)",
                "Standard deck equipment and water toys",
                "Initial provisioning and setup"
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span className="text-gray-600 font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-medium text-primary mb-6">Optional Add-ons</h3>
            <div className="space-y-4">
              {[
                "Gourmet chef and custom meal service",
                "Premium bar and beverage packages",
                "Water sports equipment and instruction",
                "Spa services and wellness programs",
                "Shore excursions and guided tours",
                "Special event planning and coordination"
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <Star className="h-5 w-5 text-gold mr-3 flex-shrink-0" />
                  <span className="text-gray-600 font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">How It Works</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            Simple Planning Process
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            From initial consultation to departure, we handle every detail of your extended voyage
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary font-semibold text-xl">1</span>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">Consultation</h3>
            <p className="text-gray-600 font-light text-sm">Discuss your vision, preferences, and requirements with our specialists</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary font-semibold text-xl">2</span>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">Custom Proposal</h3>
            <p className="text-gray-600 font-light text-sm">Receive a detailed proposal with vessel options, itinerary, and pricing</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary font-semibold text-xl">3</span>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">Planning & Booking</h3>
            <p className="text-gray-600 font-light text-sm">Finalize details, complete contracts, and coordinate all arrangements</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary font-semibold text-xl">4</span>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">Departure</h3>
            <p className="text-gray-600 font-light text-sm">Board your vessel and begin your unforgettable extended adventure</p>
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section id="request-quote">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Request Quote</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            Plan Your Extended Voyage
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Share your vision and we'll create a custom term charter experience perfectly tailored to your needs.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <RequestTermCharter />
        </div>
      </section>
      
      {/* Available Boats Section */}
      {termCharterBoats.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="text-primary font-medium text-sm tracking-wide uppercase">Our Fleet</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
              Available Vessels
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
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
    </ExperienceLayout>
  );
} 