'use client'

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { Users, MapPin, Anchor } from 'lucide-react';
import Image from 'next/image';
import { TypeAnimation } from 'react-type-animation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HeroSection() {
  const [location, setLocation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    if (!location) {
      setError('Please enter a destination');
      return;
    }
    setError(null);
    console.log('Searching with:', { location });
  };

  const rotatingTexts = [
    'Day Charter',
    3000,
    'Vacation',
    3000,
    'Family Cruise',
    3000,
    'Island Adventure',
    3000,
    'Yacht Party',
    3000,
    'Sunset Cruise',
    3000,
  ];

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        <video 
          src="/images/hero-video.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="h-full w-full object-cover brightness-110"
        />
        {/* Bottom fade for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-[1000px] mx-auto w-full text-center space-y-10">
          {/* Hero Text */}
          <div className="flex flex-col items-center">
            <h1 className="text-7xl lg:text-8xl xl:text-[105px] font-bebas-neue text-white">
              <div className="mb-2">Find <span className="text-primary">Your</span> Perfect</div>
              <TypeAnimation
                sequence={rotatingTexts}
                wrapper="div"
                speed={50}
                repeat={Infinity}
                className="ml-12 bg-gradient-to-r from-primary via-primary to-primary text-transparent bg-clip-text"
              />
            </h1>
          </div>

          {/* Search Box */}
          <motion.div
            ref={searchBoxRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto w-full mt-12 px-4 sm:px-0"
          >
            <div className="relative flex w-full">
              <Input
                type="text"
                placeholder="Where would you like to set sail?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-r-none border-r-0 h-12 text-base bg-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                onClick={handleSearch}
                variant="default"
                className="rounded-l-none h-12 px-6 bg-primary text-white hover:bg-primary/90"
              >
                <FiSearch className="w-5 h-5" />
                <span className="hidden sm:inline ml-2">Search</span>
              </Button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto w-full mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center space-y-3">
                <Users className="w-10 h-10 text-primary drop-shadow-md" strokeWidth={1.5} />
                <span className="text-4xl font-bold text-white drop-shadow-lg">15,000+</span>
                <span className="text-lg text-white font-medium drop-shadow-md">Happy Clients</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <Anchor className="w-10 h-10 text-primary drop-shadow-md" strokeWidth={1.5} />
                <span className="text-4xl font-bold text-white drop-shadow-lg">200+</span>
                <span className="text-lg text-white font-medium drop-shadow-md">Premium Boats</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <MapPin className="w-10 h-10 text-primary drop-shadow-md" strokeWidth={1.5} />
                <span className="text-4xl font-bold text-white drop-shadow-lg">15</span>
                <span className="text-lg text-white font-medium drop-shadow-md">Locations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 