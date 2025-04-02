import { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, Anchor, MapPin } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";

export const metadata: Metadata = {
  title: "Term Charters | KOSyachts",
  description: "Experience extended luxury voyages with our premium term charters.",
};

// Related experiences
const relatedExperiences = [
  {
    id: "celebrations",
    title: "Celebrations & Events",
    description: "Host your special occasions on the water for unforgettable memories.",
    image: "/images/experiences/celebrations.jpg",
    href: "/experiences/celebrations",
  },
  {
    id: "fishing",
    title: "Fishing Charters",
    description: "Experience the thrill of deep-sea fishing with professional guides.",
    image: "/images/experiences/fishing.jpg",
    href: "/experiences/fishing",
  }
];

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
    question: "How far in advance should I book a term charter?",
    answer: "We recommend booking at least 6-12 months in advance, especially for peak season (December-April). Popular vessels and dates can be booked up to a year or more in advance."
  },
  {
    question: "Can we customize our itinerary?",
    answer: "Absolutely! While we offer suggested itineraries, we work with you to customize your journey based on your interests, time frame, and preferences. Your captain may suggest modifications based on weather and sea conditions."
  }
];

// Popular destinations
const destinations = [
  {
    name: "The Bahamas",
    description: "Crystal clear waters, pristine beaches, and island-hopping adventures just a short distance from Florida.",
    activities: ["Island hopping", "Snorkeling", "Beach exploration"],
    duration: "7-14 days recommended",
    image: "/images/experiences/bahamas.jpg"
  },
  {
    name: "Florida Keys",
    description: "A string of tropical islands with unique charm, excellent diving, and beautiful sunsets.",
    activities: ["Diving", "Fishing", "Sunset cruising"],
    duration: "5-10 days recommended",
    image: "/images/experiences/florida-keys.jpg"
  },
  {
    name: "Caribbean Islands",
    description: "Explore multiple islands with diverse cultures, cuisines, and stunning natural beauty.",
    activities: ["Cultural experiences", "Snorkeling", "Island exploration"],
    duration: "14+ days recommended",
    image: "/images/experiences/caribbean.jpg"
  },
  {
    name: "Virgin Islands",
    description: "Pristine waters, national parks, and excellent sailing conditions.",
    activities: ["Sailing", "National park visits", "Snorkeling"],
    duration: "7-14 days recommended",
    image: "/images/experiences/virgin-islands.jpg"
  }
];

// Yacht categories
const yachtCategories = [
  {
    name: "Motor Yachts",
    description: "Luxury vessels with spacious accommodations, multiple entertainment areas, and powerful engines for covering longer distances.",
    features: ["Speed & comfort", "Spacious interiors", "Multiple decks"],
    sizeRange: "60-120+ feet",
    image: "/images/experiences/motor-yacht.jpg"
  },
  {
    name: "Sailing Yachts",
    description: "Classic vessels combining the romance of sailing with luxury accommodations for an authentic maritime experience.",
    features: ["Eco-friendly", "Peaceful sailing", "Authentic experience"],
    sizeRange: "50-100+ feet",
    image: "/images/experiences/sailing-yacht.jpg"
  },
  {
    name: "Catamarans",
    description: "Stable, spacious vessels with shallow drafts perfect for accessing secluded bays and beaches.",
    features: ["Stability", "Spacious layout", "Shallow draft"],
    sizeRange: "45-80+ feet",
    image: "/images/experiences/catamaran.jpg"
  }
];

export default function TermChartersPage() {
  return (
    <ExperienceLayout
      title="Term Charters"
      description="Experience extended voyages with premium vessels and professional crews. Discover multiple destinations in ultimate comfort and luxury."
      heroImage="/images/experiences/term-charters-hero.jpg"
      imageOverlayColor="from-[#0c4a6e]/70 to-[#0c4a6e]/40"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
    >
      <div className="space-y-16">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-6">Extended Luxury Voyages</h2>
            <p className="text-gray-600 mb-4">
              Our term charters offer the ultimate boating experience, combining luxury accommodations, 
              professional crew, and the freedom to explore multiple destinations during a single journey. 
              Unlike day trips, these extended charters allow you to truly immerse yourself in the boating lifestyle.
            </p>
            <p className="text-gray-600 mb-4">
              Whether you're planning a weeklong family vacation, a two-week island-hopping adventure, 
              or even a month-long exploration, our diverse fleet of term charter vessels provides 
              the perfect floating home away from home.
            </p>
            <p className="text-gray-600 mb-6">
              With a professional captain and crew handling all aspects of vessel operation, navigation, 
              and maintenance, you're free to relax and enjoy your journey, focusing on creating 
              memories rather than managing logistics.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">What's Included:</h3>
            <ul className="space-y-3">
              {[
                "Professional captain and crew",
                "Luxury accommodations onboard",
                "Navigation and vessel operation",
                "Itinerary planning assistance",
                "Daily cabin service",
                "Water toys and equipment",
                "Welcome basket upon arrival",
                "24/7 shoreside support"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative h-[400px] md:h-auto rounded-2xl overflow-hidden">
            <Image
              src="/images/experiences/term-charters-content.jpg"
              alt="Luxury yacht for term charter"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Destinations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {destinations.map((destination, index) => (
              <div key={index} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-60">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-xl font-bold text-white">{destination.name}</h3>
                    <div className="flex items-center text-white/90 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{destination.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-3">{destination.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {destination.activities.map((activity, aIndex) => (
                      <span 
                        key={aIndex}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[#F8F9FC] rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">The Term Charter Experience</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Anchor className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Freedom & Flexibility</h3>
              <p className="text-gray-600">
                Your itinerary can be adjusted daily based on weather, interests, and discoveries. 
                Wake up to new views each morning and decide where the day will take you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                  <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3Z" />
                  <path d="M8 17v4" />
                  <path d="M16 17v4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Luxury Service</h3>
              <p className="text-gray-600">
                Experienced crew handles all aspects from navigation to meal preparation and housekeeping. 
                Enjoy 5-star service while exploring multiple destinations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                  <path d="M7 12h10" />
                  <path d="M12 7v10" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Exclusive Access</h3>
              <p className="text-gray-600">
                Reach secluded beaches, private coves, and pristine snorkeling spots only accessible by boat. 
                Experience destinations without the crowds.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Vessel Options</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {yachtCategories.map((yacht, index) => (
              <div key={index} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="relative h-48">
                  <Image
                    src={yacht.image}
                    alt={yacht.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-xl font-semibold mb-2">{yacht.name}</h3>
                  <p className="text-gray-600 mb-3 flex-grow">{yacht.description}</p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <span>Size range:</span>
                      <span className="font-medium">{yacht.sizeRange}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {yacht.features.map((feature, fIndex) => (
                        <span 
                          key={fIndex}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Term Charter Packages</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Weekend Escape</h3>
              <p className="text-gray-600 mb-4">
                A perfect introduction to term chartering with a 3-4 day experience.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• 3-4 days</li>
                <li>• Professional captain</li>
                <li>• Provisioning options available</li>
                <li>• Near-coastal destinations</li>
              </ul>
              <p className="font-medium">Starting from $15,000</p>
            </div>
            
            <div className="p-6 border rounded-xl bg-primary/5 relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-3">Week of Luxury</h3>
              <p className="text-gray-600 mb-4">
                Our most popular option, providing the perfect balance of destinations and relaxation.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• 7 days</li>
                <li>• Full professional crew</li>
                <li>• Half-board or full-board options</li>
                <li>• Diverse destinations</li>
                <li>• Customized itinerary</li>
              </ul>
              <p className="font-medium">Starting from $35,000</p>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Extended Voyage</h3>
              <p className="text-gray-600 mb-4">
                For those seeking a comprehensive exploration and the full yachting lifestyle.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• 14+ days</li>
                <li>• Premium crew including chef</li>
                <li>• Full-board gourmet dining</li>
                <li>• Multiple destination regions</li>
                <li>• Exclusive experiences at each stop</li>
              </ul>
              <p className="font-medium">Starting from $75,000</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            All packages can be customized to fit your preferences, group size, and desired destinations.
          </p>
        </div>
      </div>
    </ExperienceLayout>
  );
} 