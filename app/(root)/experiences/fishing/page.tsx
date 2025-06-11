import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Calendar, Users, Navigation, Globe, Fish, Shield, Clock } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Deep Sea Fishing Charters | KOSyachts",
  description: "Experience world-class deep sea fishing with professional guides, premium equipment, and luxury vessels in Miami's best fishing grounds.",
};

// Related experiences
const relatedExperiences = [
  {
    id: "watersports",
    title: "Water Sports Adventures",
    description: "Enjoy thrilling watersports activities for all skill levels.",
    image: "/images/experiences/tiki.jpg",
    href: "/experiences/watersports",
  },
  {
    id: "sand-bar",
    title: "Sand Bar Excursions",
    description: "Relax and enjoy pristine sandbar locations only accessible by yacht.",
    image: "/images/experiences/hauloversandbar.jpeg",
    href: "/experiences/sand-bar",
  },
];

// FAQs
const faqs = [
  {
    question: "Do I need to bring my own fishing gear?",
    answer: "No, all our fishing charters include professional-grade fishing gear and equipment. However, if you have a preference for your own gear, you're welcome to bring it along."
  },
  {
    question: "Is a fishing license included?",
    answer: "Yes, our charters include fishing licenses for all guests on board. You don't need to worry about arranging this separately."
  },
  {
    question: "What fish species can I expect to catch?",
    answer: "Depending on the season and location, you may catch mahi-mahi, sailfish, marlin, tuna, wahoo, snapper, and more. Our captains know the best spots for the season."
  },
  {
    question: "Are fishing charters suitable for beginners?",
    answer: "Absolutely! Our experienced captains and crew provide guidance for anglers of all skill levels, from first-timers to experienced fishermen."
  },
  {
    question: "Can we keep the fish we catch?",
    answer: "Yes, you can keep your legal catch. Our crew will clean and fillet your fish upon request, ready for you to take home or to a local restaurant for preparation."
  }
];

// Key features of fishing charters
const features = [
  {
    icon: <Navigation className="h-6 w-6" />,
    title: "Expert Captains",
    description: "Professional guides who know the best fishing spots and techniques for each season"
  },
  {
    icon: <Fish className="h-6 w-6" />,
    title: "Premium Equipment",
    description: "Top-of-the-line fishing gear, tackle, and safety equipment included"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "All Licenses Included",
    description: "Fishing licenses, permits, and insurance coverage for all guests"
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Flexible Duration",
    description: "Half-day, full-day, and multi-day charter options available"
  }
];

// Charter options
const charterOptions = [
  {
    title: "Half-Day Charter",
    duration: "4 Hours",
    description: "Perfect for beginners or those with limited time. These trips typically stay in nearshore waters targeting abundant species like snapper and mahi-mahi.",
    highlights: ["Nearshore fishing", "Beginner-friendly", "Light tackle fishing", "Refreshments included"],
    price: "Starting from $600"
  },
  {
    title: "Full-Day Charter",
    duration: "8 Hours",
    description: "Our most popular option, allowing time to reach offshore fishing grounds and target multiple species. Includes drinks and lunch on board.",
    highlights: ["Offshore fishing", "Multiple species", "Lunch included", "Professional photos"],
    price: "Starting from $1,100",
    popular: true
  },
  {
    title: "Tournament Prep",
    duration: "Custom",
    description: "Specialized training and practice sessions for serious anglers preparing for fishing tournaments with expert guidance.",
    highlights: ["Expert coaching", "Tournament techniques", "Strategy development", "Custom duration"],
    price: "Custom pricing"
  }
];

export default function FishingPage() {
  return (
    <ExperienceLayout
      title="Deep Sea Fishing Charters"
      description="Experience world-class fishing with our professional guides and premium vessels, perfect for both novice and experienced anglers seeking the ultimate catch."
      heroImage="/images/experiences/deepseafishing.jpg"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
      buttonText="Book Your Charter"
      buttonLink="/boats/search"
    >
      {/* Introduction Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">About Fishing Charters</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            The Ultimate Fishing Adventure
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light leading-relaxed">
            Whether you're an experienced angler looking for your next trophy catch or a beginner 
            wanting to learn the ropes, our fishing charters provide unforgettable experiences on 
            Miami's pristine waters with expert captains and premium vessels.
          </p>
        </div>
        
        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full text-center">
                <div className="bg-gold/10 p-4 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <div className="text-gold">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-medium text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's Included Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Charter Inclusions</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
            Everything You Need Included
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Our fishing charters provide everything you need for a successful and memorable day on the water.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Included Items */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-medium text-primary mb-6">Included in Every Charter</h3>
            <div className="space-y-4">
              {[
                "Professional fishing captain and crew",
                "Premium fishing equipment and tackle",
                "Fishing licenses for all guests",
                "Fresh bait and lures for target species",
                "Fish cleaning and filleting service",
                "Ice and coolers for your catch",
                "Safety equipment and briefing",
                "Comfortable vessel with shade areas"
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-gray-700 font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Species */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-medium text-primary mb-6">Target Species</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Mahi-Mahi", "Sailfish", "Marlin", "Tuna",
                "Wahoo", "Snapper", "Grouper", "King Mackerel"
              ].map((species, index) => (
                <div key={index} className="flex items-center">
                  <Fish className="h-4 w-4 text-primary mr-2" />
                  <span className="text-gray-700 font-light">{species}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-light">
                Species availability varies by season and weather conditions. Our experienced captains will target the best opportunities for your trip.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Charter Options Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Charter Options</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
            Choose Your Charter Experience
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Select from our range of charter options designed to suit your schedule and fishing preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {charterOptions.map((option, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg p-8 border-2 transition-all duration-300 hover:shadow-lg ${
                option.popular 
                  ? 'border-primary shadow-lg relative' 
                  : 'border-gray-100 hover:border-primary/30'
              }`}
            >
              {option.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-medium text-primary mb-2">{option.title}</h3>
                <p className="text-primary/70 font-medium mb-4">{option.duration}</p>
                <p className="text-gray-600 font-light leading-relaxed mb-6">{option.description}</p>
                
                <div className="space-y-2 mb-6">
                  {option.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm text-gray-600 font-light">{highlight}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-lg font-medium text-primary mb-4">{option.price}</p>
                  <Button 
                    className={`w-full ${
                      option.popular 
                        ? 'bg-primary hover:bg-primary/90 text-white' 
                        : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                    }`}
                    asChild
                  >
                    <Link href="/boats/search">
                      {index === 2 ? 'Contact Us' : 'Book Now'}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ExperienceLayout>
  );
} 