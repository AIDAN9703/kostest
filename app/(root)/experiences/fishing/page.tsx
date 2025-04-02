import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";

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

export default function FishingPage() {
  return (
    <ExperienceLayout
      title="Fishing Charters"
      description="Experience world-class fishing with our professional guides and premium vessels, perfect for both novice and experienced anglers."
      heroImage="/images/experiences/fishing-hero.jpg"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
    >
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">The Ultimate Fishing Experience</h2>
          <p className="text-gray-600 mb-4">
            Whether you're an experienced angler looking for your next trophy catch or a beginner 
            wanting to learn the ropes, our fishing charters provide unforgettable experiences on 
            the water.
          </p>
          <p className="text-gray-600 mb-4">
            With expert captains who know the best fishing spots and premium vessels equipped with 
            top-of-the-line gear, you'll have everything you need for a successful day of fishing.
          </p>
          <p className="text-gray-600 mb-6">
            We offer a variety of fishing experiences, from nearshore excursions to deep-sea 
            adventures, tailored to your preferences and the seasonal fishing conditions.
          </p>
          
          <h3 className="text-xl font-semibold mb-4">What's Included:</h3>
          <ul className="space-y-3 mb-8">
            {[
              "Professional fishing captain and crew",
              "Premium fishing equipment and tackle",
              "Fishing license for all guests",
              "Bait and lures appropriate for target species",
              "Fish cleaning and filleting service",
              "Ice and coolers for your catch",
              "Comfortable vessel with shade and seating",
              "Safety equipment and instructions"
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
            src="/images/experiences/fishing-content.jpg"
            alt="Anglers with a large catch on a fishing charter"
            fill
            className="object-cover"
          />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-6">Target Species</h2>
          <p className="text-gray-600 mb-6">
            Our waters are home to a diverse range of game fish. Depending on the season and 
            location, you might target:
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Mahi-Mahi", season: "Year-round, peak in summer" },
              { name: "Sailfish", season: "Winter and spring" },
              { name: "Marlin", season: "Summer and fall" },
              { name: "Tuna", season: "Year-round" },
              { name: "Wahoo", season: "Winter months" },
              { name: "Snapper", season: "Year-round" },
              { name: "Grouper", season: "Year-round" },
              { name: "Kingfish", season: "Winter and spring" }
            ].map((fish, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold text-lg">{fish.name}</h4>
                <p className="text-sm text-gray-500">Season: {fish.season}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-6">Charter Options</h2>
          <div className="space-y-6">
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Half-Day Charter (4 Hours)</h3>
              <p className="text-gray-600 mb-3">
                Perfect for beginners or those with limited time. These trips typically stay in 
                nearshore waters and target abundant species like snapper and mahi-mahi.
              </p>
              <p className="font-medium">Starting from $600</p>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Full-Day Charter (8 Hours)</h3>
              <p className="text-gray-600 mb-3">
                Our most popular option, allowing time to reach offshore fishing grounds and 
                target multiple species. Includes drinks and lunch on board.
              </p>
              <p className="font-medium">Starting from $1,100</p>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Specialty Charters</h3>
              <p className="text-gray-600 mb-3">
                We also offer specialty trips including night fishing, tournament preparation, 
                and species-specific excursions for serious anglers.
              </p>
              <p className="font-medium">Custom pricing based on requirements</p>
            </div>
          </div>
        </div>
      </div>
    </ExperienceLayout>
  );
} 