'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Sunset, GlassWater, Cake, Users, Music, Sparkles } from 'lucide-react';

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

export default function PopularExperiences() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">


      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-5xl md:text-6xl xl:text-7xl text-[#1E293B] mb-6">
            Popular <span className="text-gold">Experiences</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Discover our most sought-after yacht experiences, each crafted to create unforgettable memories on the water.
          </p>
        </motion.div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((experience, idx) => (
            <motion.div
              key={experience.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <Link href={experience.link} className="block">
                <div className="relative h-[400px] rounded-3xl overflow-hidden">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${experience.color} 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="relative transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <experience.icon className="w-6 h-6 text-[#1E293B]" />
                        </div>
                        <h3 className="text-2xl font-medium text-white">
                          {experience.title}
                        </h3>
                      </div>
                      <p className="text-white/90 font-light tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
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
          className="text-center mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            href="/experiences"
            className="inline-flex px-12 py-6 bg-[#1E293B] text-white rounded-full text-xl font-serif
                     tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 
                     transform hover:scale-[1.02] active:scale-[0.98] hover:bg-[#2C3E50]"
          >
            View All Experiences
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 