import { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, MapPin } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";

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
    image: "/images/experiences/watersports.jpg",
    href: "/experiences/watersports",
  },
  {
    id: "celebrations",
    title: "Celebrations & Events",
    description: "Host your special occasions on the water for unforgettable memories.",
    image: "/images/experiences/celebrations.jpg",
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

// Popular sandbars
const sandbars = [
  {
    name: "Haulover Sandbar",
    location: "Miami Beach",
    description: "A popular gathering spot with crystal clear waters and festive atmosphere.",
    features: ["Shallow waters", "Nearby restaurants", "Family-friendly"],
    image: "/images/experiences/haulover.jpg"
  },
  {
    name: "Nixon Sandbar",
    location: "Key Biscayne",
    description: "A beautiful stretch of sand perfect for swimming and relaxing.",
    features: ["Private atmosphere", "Wildlife viewing", "Pristine conditions"],
    image: "/images/experiences/nixon.jpg"
  },
  {
    name: "Whale Harbor Sandbar",
    location: "Islamorada",
    description: "A tranquil sandbar with shallow, turquoise waters and great views.",
    features: ["Sunset views", "Snorkeling spots", "Calm waters"],
    image: "/images/experiences/whale-harbor.jpg"
  },
  {
    name: "Peanut Island",
    location: "West Palm Beach",
    description: "More than just a sandbar, featuring walking trails and snorkeling spots.",
    features: ["Historic site", "Snorkeling lagoon", "Picnic facilities"],
    image: "/images/experiences/peanut-island.jpg"
  }
];

export default function SandBarPage() {
  return (
    <ExperienceLayout
      title="Sand Bar Excursions"
      description="Discover paradise on our sandbar excursions, where pristine white sands meet crystal clear waters, accessible only by boat."
      heroImage="/images/experiences/sandbar-hero.jpg"
      imageOverlayColor="from-[#0e7490]/60 to-[#0e7490]/30"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
    >
      <div className="space-y-16">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-6">Island Paradise Experience</h2>
            <p className="text-gray-600 mb-4">
              Discover the magic of Florida's hidden sandbars - natural white sand islands that emerge 
              in the shallow waters, creating perfect oases for relaxation and fun. These pristine 
              spots are only accessible by boat, offering a truly exclusive experience.
            </p>
            <p className="text-gray-600 mb-4">
              Our sandbar excursions take you to the most scenic and enjoyable sandbars in the area, 
              where you can wade in knee-deep crystal clear water, collect seashells, play beach games, 
              or simply relax in paradise.
            </p>
            <p className="text-gray-600 mb-6">
              Whether you're looking for a lively atmosphere with music and other boaters or a secluded 
              slice of paradise, our captains know exactly where to take you for the perfect day on the water.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">What's Included:</h3>
            <ul className="space-y-3">
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
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative h-[400px] md:h-auto rounded-2xl overflow-hidden">
            <Image
              src="/images/experiences/sandbar-content.jpg"
              alt="People enjoying a beautiful sandbar"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Sandbars</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sandbars.map((sandbar, index) => (
              <div key={index} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-60">
                  <Image
                    src={sandbar.image}
                    alt={sandbar.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-xl font-bold text-white">{sandbar.name}</h3>
                    <div className="flex items-center text-white/90 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{sandbar.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-3">{sandbar.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {sandbar.features.map((feature, fIndex) => (
                      <span 
                        key={fIndex}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Excursion Options</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Half-Day Escape (4 Hours)</h3>
              <p className="text-gray-600 mb-4">
                A perfect taste of sandbar life with enough time to relax, swim, and enjoy the scenery.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• Visit to one premium sandbar</li>
                <li>• Basic refreshments included</li>
                <li>• All water toys and equipment</li>
              </ul>
              <p className="font-medium">Starting from $700</p>
            </div>
            
            <div className="p-6 border rounded-xl bg-primary/5 relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-3">Full-Day Paradise (8 Hours)</h3>
              <p className="text-gray-600 mb-4">
                The complete sandbar experience with time to visit multiple locations and fully unwind.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• Visit 2-3 different sandbars</li>
                <li>• Gourmet lunch included</li>
                <li>• Premium bar package available</li>
              </ul>
              <p className="font-medium">Starting from $1,200</p>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Sunset Sandbar (4 Hours)</h3>
              <p className="text-gray-600 mb-4">
                Experience the magic of a sandbar as the sun sets, creating a perfect evening atmosphere.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• Afternoon to sunset timing</li>
                <li>• Light appetizers included</li>
                <li>• Perfect for couples</li>
              </ul>
              <p className="font-medium">Starting from $800</p>
            </div>
          </div>
        </div>
        
        <div className="bg-primary/5 p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Perfect For All Occasions</h2>
          <p className="text-gray-600 mb-6">
            Sandbar excursions are versatile and ideal for many different occasions:
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Family Outings", description: "Safe, shallow waters perfect for all ages" },
              { title: "Friend Gatherings", description: "Social atmosphere with plenty of fun activities" },
              { title: "Special Celebrations", description: "Unique setting for birthdays or anniversaries" },
              { title: "Romantic Escapes", description: "Secluded locations for couples seeking privacy" }
            ].map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExperienceLayout>
  );
} 