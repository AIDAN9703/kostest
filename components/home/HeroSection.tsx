'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/heroaerial4.jpeg" 
          alt="Luxury yacht in crystal clear waters"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Elegant Divider */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: isLoaded ? '80px' : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-[2px] bg-gold mx-auto mb-8"
          />
          
          {/* Main Heading */}
          <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-6">
            KOS Yacht Charters and Club
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto mb-10">
            Experience unparalleled luxury on the world's most exclusive waters
          </p>
        </motion.div>
      </div>

      {/* Elegant Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-10 left-0 right-0 flex flex-col items-center"
      >
        <span className="text-white/80 text-sm tracking-widest uppercase mb-2">Discover</span>
        <button 
          onClick={scrollToContent}
          className="text-white hover:text-gold transition-colors duration-300"
          aria-label="Scroll down to explore"
        >
          <FiChevronDown className="h-8 w-8 animate-bounce" />
        </button>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/40 to-transparent" />
      
      {/* Bottom Gradient for Smooth Transition to White Background */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white via-white/90 to-white/0 z-10" />
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-white/80 via-white/40 to-transparent z-5" />
    </section>
  );
} 