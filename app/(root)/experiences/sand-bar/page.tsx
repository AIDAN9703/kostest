import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, Calendar, Users, Navigation, Globe } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sand Bar Excursions | KOSyachts",
  description: "Explore pristine sandbars and shallow water paradises with our luxury boat charters.",
};

// Related experiences
const relatedExperiences = [
  {
    id: "watersports",
    title: "Water Sports Adventures",
    description: "Get your adrenaline pumping with exciting water sports activities.",
    image: "/images/experiences/tiki.jpg",
    href: "/experiences/watersports",
  },
  {
    id: "celebrations",
    title: "Celebrations & Events",
    description: "Host your special occasions on the water for unforgettable memories.",
    image: "/images/experiences/yachtparty.jpg",
    href: "/experiences/celebrations",
  },
];

// FAQs
const faqs = [
  {
    question: "What exactly is a sandbar excursion?",
    answer: "A sandbar excursion takes you to shallow areas where sand has accumulated to create natural islands or platforms just below or slightly above the water's surface. These scenic spots are perfect for wading, swimming, and relaxing in crystal-clear shallow waters."
  },
  {
    question: "What should I bring for a sandbar trip?",
    answer: "We recommend bringing swimwear, towels, sunscreen, sunglasses, a hat, water shoes (optional but helpful), and a waterproof bag for personal items. We provide coolers with ice, fresh water, and can arrange food and beverages upon request."
  },
  {
    question: "Are sandbar excursions good for families with children?",
    answer: "Absolutely! Sandbars are perfect for families with children of all ages. The shallow, calm waters provide a safe environment for kids to play, and the natural beauty creates a wonderful setting for family memories."
  },
  {
    question: "How long do sandbar excursions typically last?",
    answer: "Our standard sandbar excursions range from 4-8 hours, with half-day and full-day options available. This gives you plenty of time to enjoy the sandbar, have lunch, swim, and relax. Custom durations can be arranged."
  },
  {
    question: "What if weather conditions change during our excursion?",
    answer: "Your captain continuously monitors weather conditions. If conditions become unsafe, we'll return to port or find alternative sheltered locations. Safety is our priority, and we may modify or reschedule trips when necessary."
  }
];

// Benefits of sandbar excursions
const benefits = [
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Pristine Locations",
    description: "Access beautiful sandbars only reachable by boat"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Family Friendly",
    description: "Safe, shallow waters perfect for all ages"
  },
  {
    icon: <Navigation className="h-6 w-6" />,
    title: "Expert Navigation",
    description: "Captains who know the best sandbar spots"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Natural Beauty",
    description: "Crystal clear waters and white sand paradise"
  }
];

// Popular sandbars
const sandbars = [
  {
    name: "Haulover Sandbar",
    location: "Miami Beach",
    description: "A popular gathering spot with crystal clear waters and festive atmosphere.",
    features: ["Shallow waters", "Nearby restaurants", "Family-friendly"],
    image: "/images/experiences/hauloversandbar.jpeg"
  },
  {
    name: "Nixon Sandbar",
    location: "Key Biscayne",
    description: "A beautiful stretch of sand perfect for swimming and relaxing.",
    features: ["Private atmosphere", "Wildlife viewing", "Pristine conditions"],
    image: "/images/experiences/nixonsandbar.avif"
  },
  {
    name: "Whale Harbor Sandbar",
    location: "Islamorada",
    description: "A tranquil sandbar with shallow, turquoise waters and great views.",
    features: ["Sunset views", "Snorkeling spots", "Calm waters"],
    image: "/images/experiences/whaleharbor.jpg"
  },
  {
    name: "Peanut Island",
    location: "West Palm Beach",
    description: "More than just a sandbar, featuring walking trails and snorkeling spots.",
    features: ["Historic site", "Snorkeling lagoon", "Picnic facilities"],
    image: "/images/experiences/peanutisland.webp"
  }
];

export default function SandBarPage() {
  return (
    <ExperienceLayout
      title="Sand Bar Excursions"
      description="Discover paradise on our sandbar excursions, where pristine white sands meet crystal clear waters, accessible only by boat."
      heroImage="/images/experiences/peanutisland.webp"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
      buttonText="Book Now"
      buttonLink="/contact"
    >
      {/* Introduction Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Sand Bar Adventures</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            Island Paradise Experience
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light leading-relaxed">
            Discover the magic of Florida's hidden sandbars - natural white sand islands that emerge 
            in the shallow waters, creating perfect oases for relaxation and fun. These pristine 
            spots are only accessible by boat, offering a truly exclusive experience where you can wade in 
            knee-deep crystal clear water, collect seashells, play beach games, or simply relax in paradise.
          </p>
        </div>
        
        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full text-center">
                <div className="bg-gold/10 p-4 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <div className="text-gold">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="font-medium text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's Included Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">What's Included</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
            Everything You Need Included
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Our sandbar excursions come with everything you need for an amazing day on the water.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "Professional captain and crew",
            "Coolers with ice",
            "Fresh water and soft drinks",
            "Beach games and toys",
            "Floating mats and loungers",
            "Bluetooth sound system",
            "Snorkeling equipment",
            "Beach umbrellas and chairs"
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
              <span className="text-gray-700 font-light">{item}</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* Popular Sandbars Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Destinations</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
            Popular Sandbars
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Explore these stunning sandbar locations, each offering its own unique experience and natural beauty.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sandbars.map((sandbar, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={sandbar.image}
                  alt={sandbar.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Simple Logo Overlay */}
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
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm text-gray-500 font-light">{sandbar.location}</span>
                </div>
                <h3 className="text-xl font-medium text-primary mb-3">{sandbar.name}</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-4">{sandbar.description}</p>
                
                <div className="space-y-2">
                  {sandbar.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm text-gray-600 font-light">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ExperienceLayout>
  );
} 