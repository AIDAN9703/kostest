import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Calendar, Users, Navigation, Globe } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Fishing Charters | KOSyachts",
  description: "Experience the thrill of deep-sea fishing with professional guides and premium boats.",
};

// Related experiences
const relatedExperiences = [
  {
    id: "watersports",
    title: "Water Sports Adventures",
    description: "Enjoy thrilling watersports activities for all skill levels.",
    image: "/images/experiences/watersports.jpg",
    href: "/experiences/watersports",
  },
  {
    id: "sand-bar",
    title: "Sand Bar Excursions",
    description: "Relax and enjoy pristine sandbar locations only accessible by boat.",
    image: "/images/experiences/sandbar.jpg",
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
    question: "Is fishing license included?",
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

// Benefits of fishing charters
const benefits = [
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Expert Guidance",
    description: "Professional captains who know the best fishing spots"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "All-Inclusive Experience",
    description: "Premium equipment, licenses, and bait provided"
  },
  {
    icon: <Navigation className="h-6 w-6" />,
    title: "Multiple Locations",
    description: "Access to both nearshore and offshore fishing grounds"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Diverse Catches",
    description: "Target various game fish based on season and location"
  }
];

export default function FishingPage() {
  return (
    <ExperienceLayout
      title="Fishing Charters"
      description="Experience world-class fishing with our professional guides and premium vessels, perfect for both novice and experienced anglers."
      heroImage="/images/experiences/fishing.jpg"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
      buttonText="Book Now"
      buttonLink="/experiences/fishing/book"
      imageOverlayColor="from-[#0c4a6e]/70 to-[#0c4a6e]/40"
    >
      <div className="max-w-7xl mx-auto space-y-10 px-6 font-poppins">
        {/* Modern Intro Section */}
        <section className="pt-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 md:p-12">
            <div className="flex flex-col max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-primary font-poppins">The Ultimate Fishing Experience</h2>
              <p className="text-gray-600 mb-8 leading-relaxed font-poppins">
                Whether you're an experienced angler looking for your next trophy catch or a beginner 
                wanting to learn the ropes, our fishing charters provide unforgettable experiences on 
                the water with expert captains who know the best fishing spots and premium vessels 
                equipped with top-of-the-line gear.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="p-2 mr-3 text-primary">
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
          <div className="rounded-xl p-8 md:p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 text-primary font-poppins">What's Included</h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
                Our fishing charters provide everything you need for a successful day on the water.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                "Professional fishing captain and crew",
                "Premium fishing equipment and tackle",
                "Fishing license for all guests",
                "Bait and lures for target species",
                "Fish cleaning and filleting service",
                "Ice and coolers for your catch",
                "Comfortable vessel with shade",
                "Safety equipment and instructions"
              ].map((item, index) => (
                <div key={index} className="p-4 flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-gray-700 font-poppins">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        
        {/* Charter Options Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-primary font-poppins">Charter Options</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
              Choose from a variety of charter options to suit your schedule and fishing preferences.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3 font-poppins">Half-Day Charter (4 Hours)</h3>
              <p className="text-gray-600 mb-3 font-poppins">
                Perfect for beginners or those with limited time. These trips typically stay in 
                nearshore waters and target abundant species like snapper and mahi-mahi.
              </p>
              <p className="font-medium font-poppins">Starting from $600</p>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3 font-poppins">Full-Day Charter (8 Hours)</h3>
              <p className="text-gray-600 mb-3 font-poppins">
                Our most popular option, allowing time to reach offshore fishing grounds and 
                target multiple species. Includes drinks and lunch on board.
              </p>
              <p className="font-medium font-poppins">Starting from $1,100</p>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3 font-poppins">Specialty Charters</h3>
              <p className="text-gray-600 mb-3 font-poppins">
                We also offer specialty trips including night fishing, tournament preparation, 
                and species-specific excursions for serious anglers.
              </p>
              <p className="font-medium font-poppins">Custom pricing</p>
              <div className="mt-4">
                <Link href="/contact">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-poppins">
                    Contact Our Charter Team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ExperienceLayout>
  );
} 