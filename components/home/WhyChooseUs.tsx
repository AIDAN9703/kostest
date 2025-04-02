'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { FiAnchor, FiCompass, FiShield, FiClock, FiCheck, FiNavigation, FiChevronDown } from 'react-icons/fi';
import Image from 'next/image';

const features = [
  {
    icon: FiAnchor,
    title: 'Extensive Certified Fleet',
    description: 'A wide range of luxury boats and yachts, professionally inspected and approved.',
    accent: 'from-sky-300 to-sky-300'
  },
  {
    icon: FiClock,
    title: '24/7 Concierge Service',
    description: 'Round-the-clock support to handle every detail of your trip.',
    accent: 'from-sky-300 to-emerald-400'
  },
  {
    icon: FiCompass,
    title: 'Trusted Professional Crew',
    description: 'Experienced, certified captains and crew delivering top-tier service.',
    accent: 'from-emerald-400 to-emerald-400'
  },
  {
    icon: FiCheck,
    title: 'Stress-Free Booking',
    description: 'Fast, easy, and effortless booking from start to finish.',
    accent: 'from-sky-300 to-sky-300'
  },
  {
    icon: FiShield,
    title: 'Best Price Guarantee',
    description: 'Found a better rate? We\'ll match or beat it—guaranteed.',
    accent: 'from-sky-300 to-emerald-400'
  },
  {
    icon: FiNavigation,
    title: 'Smooth Sailing',
    description: 'On-time departures and flawless scheduling for a worry-free experience.',
    accent: 'from-emerald-400 to-emerald-400'
  }
];

// Animation variant
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ duration: 0.5, delay })
};

export default function WhyChooseUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  
  // Determine which features to display
  const displayedFeatures = showAllFeatures ? features : features.slice(0, 3);

  return (
    <div className="w-full py-8 flex justify-center">
        <section 
          ref={containerRef} 
          className="relative py-12 sm:py-10 overflow-hidden bg-primary rounded-[2rem] inline-block"
        >
          {/* Corner Logos */}
          <div className="absolute left-8 top-8 opacity-10 rotate-[-15deg]">
            <Image 
              src="/icons/updatedlogowhite.png"
              alt=""
              width={90}
              height={90}
              className="select-none pointer-events-none"
            />
          </div>
          <div className="absolute right-8 top-8 opacity-10 rotate-[15deg]">
            <Image 
              src="/icons/updatedlogowhite.png"
              alt=""
              width={90}
              height={90}
              className="select-none pointer-events-none"
            />
          </div>

          <motion.div
            style={{ y }}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <motion.h2
                initial={fadeInUp.initial}
                whileInView={fadeInUp.animate}
                viewport={{ once: true }}
                transition={fadeInUp.transition()}
                className="text-3xl md:text-5xl font-serif mb-4"
              >
                <span className="text-white opacity-50">Why KOS?</span>
              </motion.h2>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {displayedFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={fadeInUp.initial}
                  whileInView={fadeInUp.animate}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
                  className="group"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-md 
                                hover:shadow-lg border border-gray-100 hover:border-amber-300/30
                                transition-all duration-300 h-full transform 
                                hover:scale-[1.02] hover:-translate-y-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex-shrink-0 inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.accent} 
                                    transform group-hover:scale-110 transition-all duration-300`}>
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-medium text-[#1E293B] pt-1.5
                                group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed 
                                group-hover:text-gray-800 transition-colors duration-300 line-clamp-3">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Show More Button - only displayed if not showing all features */}
            {!showAllFeatures && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-6"
              >
                <button
                  onClick={() => setShowAllFeatures(true)}
                  className="bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-full
                           hover:bg-white/30 transition-all duration-300 flex items-center gap-2
                           text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Show more
                  <FiChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </section>
    </div>
  );
} 