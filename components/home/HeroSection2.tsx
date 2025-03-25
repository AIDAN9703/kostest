'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

export default function HeroSection2() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTypingForward, setIsTypingForward] = useState(true);
  
  const fullTextOptions = ["Verified Reviews from Real Customers", "Unforgettable Yacht Charters", "Worldwide Captains", "Book with Confidence"];
  
  useEffect(() => {
    setIsLoaded(true);
    
    let textIndex = 0;
    let charIndex = 0;
    let direction = 1; // 1 for forward, -1 for backward
    let isPaused = false;
    
    const interval = setInterval(() => {
      if (isPaused) return;
      
      const currentText = fullTextOptions[textIndex];
      
      if (direction === 1) {
        // Typing forward
        if (charIndex < currentText.length) {
          charIndex++;
          setDisplayText(currentText.slice(0, charIndex));
        } else {
          // Complete word is typed, pause before erasing
          isPaused = true;
          setTimeout(() => {
            direction = -1;
            isPaused = false;
          }, 1500);
        }
      } else {
        // Typing backward
        if (charIndex > 0) {
          charIndex--;
          setDisplayText(currentText.slice(0, charIndex));
        } else {
          // Word is completely erased, move to next word
          textIndex = (textIndex + 1) % fullTextOptions.length;
          direction = 1;
          // Pause before starting next word
          isPaused = true;
          setTimeout(() => {
            isPaused = false;
          }, 500);
        }
      }
      
      setIsTypingForward(direction === 1);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Simpler animation variants with less movement
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: { 
        delay: custom,
        duration: 0.5
      }
    })
  };

  return (
    <section 
      className="relative w-full h-[75vh] overflow-hidden" 
      aria-label="Hero Section"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/herooption11.png" 
          alt="Luxury yachts in crystal clear waters"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 opacity-70"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* Verified Reviews Badge */}
          <motion.div
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            custom={0.1}
            variants={fadeIn}
            className="rounded-full bg-gray-700/30 px-4 sm:py-1 backdrop-blur-sm"
          >
            <p className="text-xs sm:text-sm md:text-base font-medium text-white h-6">
              {displayText}
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-sky-300 opacity-100" style={{ animation: 'blink 1s step-end infinite' }}></span>
            </p>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            custom={0.2}
            variants={fadeIn}
            className="mb-2 text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] text-white"
          >
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-sky-300 to-emerald-400 bg-clip-text text-transparent">Yacht Experience</span>
          </motion.h1>
          <div className="py-4"/>
          
          {/* Search Bar */}
          <motion.form
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            custom={0.4}
            variants={fadeIn}
            className="mb-6 sm:mb-7 flex w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl flex-col sm:flex-row gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Where would you like to set sail?"
              className="flex-1 h-12 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-800 text-sm sm:text-base md:text-lg placeholder-gray-500 focus:outline-none shadow-md"
            />
            <button
              type="submit"
              className="h-12 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-300 to-emerald-400 px-4 sm:px-6 py-3 font-medium text-white transition-colors hover:from-sky-400 hover:to-emerald-500 shadow-md active:scale-[0.98] touch-manipulation"
              aria-label="Search"
            >
              <Search size={18} />
              <span className="text-sm sm:text-base md:text-lg">Search</span>
            </button>
          </motion.form>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        :global(.bounce-arrow) {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}