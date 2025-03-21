'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { FiAnchor, FiCompass, FiStar, FiShield, FiSunrise, FiMap } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: FiAnchor,
    title: 'World-Class Fleet',
    description: 'Access to the finest luxury yachts, each maintained to perfection',
  },
  {
    icon: FiCompass,
    title: 'Expert Navigation',
    description: 'Seasoned captains with extensive local knowledge',
  },
  {
    icon: FiStar,
    title: 'Premium Service',
    description: 'Personalized attention and five-star amenities onboard',
  },
  {
    icon: FiShield,
    title: 'Safe Journey',
    description: 'Comprehensive insurance and safety measures',
  },
  {
    icon: FiSunrise,
    title: 'Unique Experiences',
    description: 'Curated adventures and exclusive destinations',
  },
  {
    icon: FiMap,
    title: 'Global Destinations',
    description: 'Access to the world\'s most beautiful harbors',
  }
];

// Reusable animation variants for DRY code
const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ 
    duration: 0.5, 
    delay 
  })
};

export default function WhyChooseUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <div className="w-full bg-white">
      <section 
        ref={containerRef} 
        className="relative py-8 sm:py-12 md:py-20 overflow-hidden"
        style={{ 
          background: 'white',
          boxShadow: 'none',
          borderTop: 'none',
          borderBottom: 'none'
        }}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0" style={{ top: '-2px', bottom: '-2px' }}>
          <Image
            src="/images/heroaerial4.jpeg"
            alt="Luxury Yacht Background"
            fill
            className="object-cover opacity-[0.45]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/25 to-white" />
        </div>

        <motion.div
          style={{ y }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="h-[2px] w-16 sm:w-20 bg-gold" />
            </div>
            <motion.h2
              initial={fadeInUpAnimation.initial}
              whileInView={fadeInUpAnimation.animate}
              viewport={{ once: true }}
              transition={fadeInUpAnimation.transition()}
              className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1E293B] mb-3 sm:mb-4"
            >
              <span className="text-gold">Why Choose</span> KOS Yachts?
            </motion.h2>
            
            <motion.p
              initial={fadeInUpAnimation.initial}
              whileInView={fadeInUpAnimation.animate}
              viewport={{ once: true }}
              transition={fadeInUpAnimation.transition(0.2)}
              className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed max-w-2xl mx-auto"
            >
              Experience the perfect blend of luxury, adventure, and professional service
              that sets us apart in the world of yacht charters.
            </motion.p>
          </div>

          {/* Features Grid - Now showing 2 cards per row even on smallest screens */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={fadeInUpAnimation.initial}
                whileInView={fadeInUpAnimation.animate}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
                className="group"
              >
                <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-5 md:p-6 shadow-md hover:shadow-lg 
                              border border-gray-100 hover:border-gold/30
                              transition-all duration-300 h-full transform 
                              hover:scale-[1.02] hover:-translate-y-1 flex flex-col">
                  <div className="flex">
                    <div className="inline-flex p-2 sm:p-3 rounded-md sm:rounded-lg bg-[#1E293B]/10
                                  transform group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#1E293B]" />
                    </div>
                  </div>
                  
                  <h3 className="mt-2 sm:mt-4 text-base sm:text-lg md:text-xl font-medium text-[#1E293B]
                              group-hover:text-gold transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed 
                              group-hover:text-gray-800 transition-colors duration-300 line-clamp-2 sm:line-clamp-3">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
} 