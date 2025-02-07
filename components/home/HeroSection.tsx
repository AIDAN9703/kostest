'use client'

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { TypeAnimation } from 'react-type-animation';

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
    'Corporate Event',
    3000,
    'Wedding',
    3000,
    'Birthday Party',
    3000,
    'Sunset Cruise',
    3000,
  ];

  return (
    <div className="hero-container">
      {/* Background Image with Overlay */}
      <div className="hero-background">
        <Image 
          src="/images/boats/aerial4.jpg" 
          alt="Luxury Yacht Experience" 
          fill 
          className="hero-background-image"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="hero-overlay-gradient" />
        <div className="hero-overlay-gradient-2" />
      </div>

      {/* Main Content */}
      <div className="hero-content">
        <div className="hero-content-wrapper">
          {/* Hero Text */}
          <div className="hero-text-container">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hero-title"
            >
              Find Your Perfect
              <div className="hero-title-gradient">
                <TypeAnimation
                  sequence={rotatingTexts}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="block"
                />
              </div>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-description"
            >
              Discover and book unforgettable yacht charters with verified captains worldwide
            </motion.p>
          </div>

          {/* Search Box */}
          <motion.div
            ref={searchBoxRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto w-full px-4 sm:px-6"
          >
            <div className="relative">
              <div className="relative flex items-center bg-white/95 rounded-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <FiSearch className="absolute left-5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Where would you like to set sail?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent border-none py-3.5 pl-12 pr-28
                           text-gray-900 placeholder:text-gray-400 text-[15px] focus:outline-none focus:ring-0"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 bg-[#21336a] hover:bg-[#2a4086] text-white px-5 py-2 
                           rounded-full transition-all duration-300 text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-2 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 