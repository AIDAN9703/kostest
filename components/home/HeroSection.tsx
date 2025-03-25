'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  const subtitles = [
    'Luxury Yachts in 50+ Destinations',
    'Unforgettable Ocean Adventures',
    'Premium Charter Experiences',
    'Exclusive Yacht Getaways'
  ];
  
  const typingSpeed = 80; // milliseconds per character
  const deletingSpeed = 40; // milliseconds per character
  const pauseTime = 2000; // time to pause after typing
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isTyping) {
      if (displayText.length < subtitles[subtitleIndex].length) {
        // Still typing the current subtitle
        timeout = setTimeout(() => {
          setDisplayText(subtitles[subtitleIndex].substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing, pause before deleting
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, pauseTime);
      }
    } else {
      if (displayText.length > 0) {
        // Deleting the current subtitle
        timeout = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        // Move to the next subtitle
        setSubtitleIndex((subtitleIndex + 1) % subtitles.length);
        setIsTyping(true);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, subtitleIndex, subtitles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  // Animation variants for reusability
  const fadeInAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: (isLoaded: boolean) => ({
      opacity: isLoaded ? 1 : 0,
      y: isLoaded ? 0 : 20
    }),
    transition: (delay: number) => ({
      duration: 0.8,
      delay
    })
  };

  return (
    <section className="relative h-screen w-full overflow-hidden" aria-label="Hero Section">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/herooption6.png" 
          alt="Luxury yachts in crystal clear waters"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-full">
          {/* Hero Content */}
          <div className="flex flex-col items-center justify-center -mt-20 sm:-mt-28 md:-mt-36">
            {/* Subtitle with Typing Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-2 sm:mb-4 h-5 sm:h-6" // Adjusted height for mobile
            >
              <span className="text-white/90 text-xs sm:text-sm uppercase tracking-widest font-medium">{displayText}</span>
              <span className={`inline-block w-0.5 h-3 sm:h-4 ml-0.5 bg-primary ${isTyping ? 'animate-blink' : 'opacity-0'}`}></span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1
              initial={fadeInAnimation.initial}
              animate={fadeInAnimation.animate(isLoaded)}
              transition={fadeInAnimation.transition(0.3)}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-tight mb-6 sm:mb-8 md:mb-12 text-center"
            >
              Find Your Perfect
              <br className="md:block hidden" />
              <span className="md:hidden"> </span>
              <span className="text-primary"> Yacht Experience</span>
            </motion.h1>
            
            {/* Search Bar */}
            <motion.div
              initial={fadeInAnimation.initial}
              animate={fadeInAnimation.animate(isLoaded)}
              transition={fadeInAnimation.transition(0.5)}
              className="w-full max-w-3xl mx-auto"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Where would you like to set sail?"
                  className="w-full py-3 sm:py-4 md:py-5 px-4 sm:px-6 pr-12 sm:pr-16 text-gray-700 bg-white rounded-lg shadow-lg text-sm sm:text-base md:text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/80 text-white p-2 sm:p-3 rounded-lg transition duration-300"
                  aria-label="Search"
                >
                  <FiSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 