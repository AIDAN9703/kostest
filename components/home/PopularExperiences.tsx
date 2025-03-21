'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Sunset, GlassWater, Cake, Users, Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const experiences = [
  {
    title: "Sunset Cruise",
    description: "Experience Miami's stunning sunsets from the water",
    icon: Sunset,
    image: "/images/experiences/sunset.jpg",
    color: "from-orange-500/80 to-rose-500/80",
    link: "/experiences/sunset-cruise"
  },
  {
    title: "Sandbar Party",
    description: "Anchor at Miami's famous sandbars for the ultimate party",
    icon: GlassWater,
    image: "/images/experiences/tiki.jpg",
    color: "from-blue-500/80 to-cyan-500/80",
    link: "/experiences/sandbar"
  },
  {
    title: "Birthday Celebration",
    description: "Make your special day unforgettable on the water",
    icon: Cake,
    image: "/images/experiences/birthday2.webp",
    color: "from-purple-500/80 to-pink-500/80",
    link: "/experiences/birthday"
  },
  {
    title: "Bachelor Party",
    description: "The ultimate maritime celebration for grooms-to-be",
    icon: Users,
    image: "/images/experiences/bachelor.jpeg",
    color: "from-blue-600/80 to-indigo-600/80",
    link: "/experiences/bachelor"
  },
  {
    title: "Bachelorette Party",
    description: "Luxurious celebration for the bride-to-be",
    icon: Sparkles,
    image: "/images/experiences/bachelorette.jpg",
    color: "from-pink-500/80 to-rose-500/80",
    link: "/experiences/bachelorette"
  },
  {
    title: "Day Charter",
    description: "Full day of luxury and adventure on the water",
    icon: Music,
    image: "/images/experiences/family.jpg",
    color: "from-emerald-500/80 to-teal-500/80",
    link: "/experiences/day-charter"
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

export default function PopularExperiences() {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="h-[2px] w-16 sm:w-20 bg-gold" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1E293B] mb-3 sm:mb-4">
            <span className="text-gold">Popular</span> Experiences
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Discover our most sought-after yacht experiences, each crafted to create unforgettable memories on the water.
          </p>
        </motion.div>

        {/* Experiences Grid - Now showing 2 cards per row even on smallest screens */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {experiences.map((experience, idx) => (
            <motion.div
              key={experience.title}
              initial={fadeInUpAnimation.initial}
              whileInView={fadeInUpAnimation.animate}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: Math.min(idx * 0.1, 0.3), duration: 0.5 }}
              className="group relative"
            >
              <Link href={experience.link} className="block">
                <div className="relative h-[160px] sm:h-[200px] md:h-[250px] lg:h-[300px] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  
                  {/* Gradient Overlay - Always visible on mobile for better readability */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${experience.color} 
                                opacity-70 sm:opacity-50 md:opacity-30 sm:group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-3 sm:p-4 md:p-6 flex flex-col justify-end">
                    <div className="relative transform translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <experience.icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#1E293B]" />
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-medium text-white">
                          {experience.title}
                        </h3>
                      </div>
                      <p className="text-white/90 text-xs sm:text-sm md:text-base font-light tracking-wide line-clamp-2 sm:line-clamp-3">
                        {experience.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-8 sm:mt-12 md:mt-16"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition(0.5)}
        >
          <Button
            asChild
            size="lg"
            className="font-serif text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 rounded-full border-2 border-[#1E293B] text-[#1E293B] 
                     hover:bg-[#1E293B] hover:text-white transition-all duration-300 bg-transparent h-auto"
          >
            <Link href="/experiences">
              View All Experiences
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 