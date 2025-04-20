'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const experiences = [
  {
    title: "Day Charters",
    image: "/images/experiences/daycharters4.png",
    color: "from-blue-500/80 to-cyan-500/80",
    link: "/experiences/day-charters"
  },
  {
    title: "Term Charters",
    image: "/images/experiences/termcharter.avif",
    color: "from-emerald-500/80 to-teal-500/80",
    link: "/experiences/term-charters"
  },
  {
    title: "Corporate Events",
    image: "/images/experiences/corporateevents.webp",
    color: "from-indigo-500/80 to-blue-500/80",
    link: "/experiences/corporate"
  },
  {
    title: "Bachelor/Bachelorette",
    image: "/images/experiences/bachellorette2.png",
    color: "from-purple-500/80 to-pink-500/80",
    link: "/experiences/bachelor"
  },
  {
    title: "Sunset Cruise",
    image: "/images/experiences/sunset.jpg",
    color: "from-orange-500/80 to-rose-500/80",
    link: "/experiences/sunset-cruise"
  },
  {
    title: "High Capacity",
    image: "/images/experiences/highcapacity.png",
    color: "from-red-500/80 to-orange-500/80",
    link: "/experiences/high-capacity"
  }
];

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
    <section className="py-6 sm:py-10 bg-white relative overflow-hidden">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div 
          className="mb-6 text-center"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
          <h2 className="font-poppins font-medium text-3xl sm:text-4xl md:text-5xl text-primary leading-tight mb-2">
            All occasions, all the time
          </h2>
          <p className="text-gray-600 text-md">
            More than just a boat and yacht rental - We craft your dream experiences.
          </p>
        </motion.div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {experiences.map((experience, idx) => (
            <motion.div
              key={experience.title}
              initial={fadeInUpAnimation.initial}
              whileInView={fadeInUpAnimation.animate}
              viewport={{ once: true }}
              transition={{ delay: Math.min(idx * 0.1, 0.3), duration: 0.5 }}
            >
              <Link href={experience.link} className="block">
                <div className="relative h-[160px] sm:h-[200px] md:h-[280px] rounded-xl overflow-hidden group">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${experience.color} opacity-30 group-hover:opacity-70 transition-opacity duration-500`} />
                  
                  {/* Title - Bottom Left */}
                  <div className="absolute inset-0 flex p-2 sm:p-4 md:p-6">
                    <h3 className="text-white text-sm md:text-xl font-poppins">
                      {experience.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 