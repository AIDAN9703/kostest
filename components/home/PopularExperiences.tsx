'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const experiences = [
  {
    title: "Day Charters",
    image: "/images/experiences/daycharters4.png",
    description: "Perfect for a day of fun on the water with friends",
    color: "from-blue-500/20 to-cyan-500/60",
    link: "/experiences/special-events"
  },
  {
    title: "Term Charters",
    image: "/images/experiences/termcharter.avif",
    description: "Extended luxury experiences for your perfect getaway",
    color: "from-emerald-500/20 to-teal-500/60",
    link: "/experiences/special-events"
  },
  {
    title: "Corporate Events",
    image: "/images/experiences/corporateevents.webp",
    description: "Impress new clients and reward your team in style",
    color: "from-indigo-500/20 to-blue-500/60",
    link: "/experiences/special-events"
  },
  {
    title: "Bachelor/Bachelorette",
    image: "/images/experiences/bachellorette2.png",
    description: "Celebrate your special day in unforgettable style",
    color: "from-purple-500/20 to-pink-500/60",
    link: "/experiences/special-events"
  },
  {
    title: "Sunset Cruise",
    image: "/images/experiences/sunset.jpg",
    description: "Experience breathtaking sunsets while on the water",
    color: "from-orange-500/20 to-rose-500/60",
    link: "/experiences/special-events"
  },
  {
    title: "High Capacity",
    image: "/images/experiences/highcapacity.png",
    description: "Perfect for large groups and special celebrations",
    color: "from-red-500/20 to-orange-500/60",
    link: "/experiences/special-events"
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
    <section className="relative py-6 sm:py-12 font-poppins">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <div className="max-w-xl text-right ml-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-primary leading-tight">
              Charter for every occasion
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-lg font-light">
              From intimate gatherings to grand celebrations, find your perfect yacht experience
            </p>
          </div>
        </motion.div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {experiences.map((experience, idx) => (
            <motion.div
              key={experience.title}
              initial={fadeInUpAnimation.initial}
              whileInView={fadeInUpAnimation.animate}
              viewport={{ once: true }}
              transition={{ delay: Math.min(idx * 0.1, 0.3), duration: 0.5 }}
            >
              <Link href={experience.link} className="block group">
                <div className="relative h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    quality={90}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${experience.color} opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                    <h3 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-poppins font-medium truncate">
                      {experience.title}
                    </h3>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base font-light line-clamp-2">
                      {experience.description}
                    </p>
                  </div>
                  {/* Hover Arrow Button */}
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="border border-white rounded-full p-2 shadow-lg">
                      <ArrowRight className="h-3 w-3 text-white" />
                    </div>
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