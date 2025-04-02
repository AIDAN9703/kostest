import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Boat Experiences | KOSyachts",
  description: "Discover unforgettable boating experiences in top destinations.",
};

// Define all experience types with their details
const experiences = [
  {
    id: "fishing",
    title: "Fishing Charters",
    description: "Experience the thrill of deep-sea fishing with professional guides.",
    image: "/images/experiences/fishing.jpg",
    imageAlt: "Fishing boat with anglers",
    href: "/experiences/fishing",
  },
  {
    id: "watersports",
    title: "Water Sports Adventures",
    description: "Get your adrenaline pumping with jet skis, wakeboarding, and more.",
    image: "/images/experiences/watersports.jpg",
    imageAlt: "People enjoying watersports behind a boat",
    href: "/experiences/watersports",
  },
  {
    id: "sand-bar",
    title: "Sand Bar Excursions",
    description: "Relax and enjoy pristine sandbar locations only accessible by boat.",
    image: "/images/experiences/sandbar.jpg",
    imageAlt: "Boats anchored at a beautiful sandbar",
    href: "/experiences/sand-bar",
  },
  {
    id: "celebrations",
    title: "Celebrations & Events",
    description: "Host your special occasions on the water for unforgettable memories.",
    image: "/images/experiences/celebrations.jpg",
    imageAlt: "Group celebrating on a yacht",
    href: "/experiences/celebrations",
  },
  {
    id: "term-charters",
    title: "Term Charters",
    description: "Extended voyages with premium vessels and professional crews.",
    image: "/images/experiences/term-charters.jpg",
    imageAlt: "Luxury yacht for term charter",
    href: "/experiences/term-charters",
  },
];

export default function ExperiencesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/70 to-[#1E293B]/40 z-10" />
        <div 
          className="h-[50vh] md:h-[60vh] bg-cover bg-center" 
          style={{ backgroundImage: `url('/images/experiences/hero-bg.jpg')` }}
        />
        <div className="container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Unforgettable Boating Experiences
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Discover unique adventures on the water customized for every occasion.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white rounded-full"
            asChild
          >
            <Link href="#explore">
              Explore Experiences
            </Link>
          </Button>
        </div>
      </div>

      {/* Experiences Grid */}
      <div id="explore" className="container py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Choose Your Perfect Experience
        </h2>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {experiences.map((experience) => (
            <Link 
              key={experience.id}
              href={experience.href}
              className="group overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 z-10" />
                <img
                  src={experience.image}
                  alt={experience.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {experience.title}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  {experience.description}
                </p>
                <div className="flex items-center text-primary font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#F8FAFC] py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our experienced captains and premium vessels await to make your dream experience a reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
                asChild
              >
                <Link href="/boats/search">
                  Find a Boat
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="rounded-full"
                asChild
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 