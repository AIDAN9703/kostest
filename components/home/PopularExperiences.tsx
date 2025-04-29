'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const experiences = [
  {
    title: "Day Charters",
    image: "/images/experiences/daycharters4.png",
    description: "Perfect for a day of luxury on the water",
    color: "from-blue-500/20 to-cyan-500/60",
    link: "/experiences/day-charters"
  },
  {
    title: "Term Charters",
    image: "/images/experiences/termcharter.avif",
    description: "Extended luxury experiences for your perfect getaway",
    color: "from-emerald-500/20 to-teal-500/60",
    link: "/experiences/term-charters"
  },
  {
    title: "Corporate Events",
    image: "/images/experiences/corporateevents.webp",
    description: "Impress clients and reward your team in style",
    color: "from-indigo-500/20 to-blue-500/60",
    link: "/experiences/corporate"
  },
  {
    title: "Bachelor/Bachelorette",
    image: "/images/experiences/bachellorette2.png",
    description: "Celebrate your special day in unforgettable style",
    color: "from-purple-500/20 to-pink-500/60",
    link: "/experiences/bachelor"
  },
  {
    title: "Sunset Cruise",
    image: "/images/experiences/sunset.jpg",
    description: "Experience breathtaking sunsets on the water",
    color: "from-orange-500/20 to-rose-500/60",
    link: "/experiences/sunset-cruise"
  },
  {
    title: "High Capacity",
    image: "/images/experiences/highcapacity.png",
    description: "Perfect for large groups and special celebrations",
    color: "from-red-500/20 to-orange-500/60",
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
    <section className="py-6 sm:py-10 relative overflow-hidden">
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
          <p className="text-gray-600 text-lg font-poppins font-light">
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
                <div className="relative h-[160px] sm:h-[200px] md:h-[280px] rounded-lg overflow-hidden group">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${experience.color} opacity-75 group-hover:opacity-90 transition-opacity duration-500`} />
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col">
                    <h3 className="text-white text-sm md:text-xl font-poppins mb-1">
                      {experience.title}
                    </h3>
                    <p className="text-white text-xs md:text-sm mb-2">
                      {experience.description}
                    </p>
                    <button className="bg-white/30 text-white px-3 py-1 rounded-md text-xs md:text-sm tracking-wide hover:bg-white/50 transition-colors duration-300">
                      Learn More
                    </button>
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