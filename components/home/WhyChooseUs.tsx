'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { FiAnchor, FiCompass, FiStar, FiShield, FiSunrise, FiMap } from 'react-icons/fi';

const features = [
  {
    icon: FiAnchor,
    title: 'World-Class Fleet',
    description: 'Access to the finest luxury yachts, each maintained to perfection',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: FiCompass,
    title: 'Expert Navigation',
    description: 'Seasoned captains with extensive local knowledge',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: FiStar,
    title: 'Premium Service',
    description: 'Personalized attention and five-star amenities onboard',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: FiShield,
    title: 'Safe Journey',
    description: 'Comprehensive insurance and safety measures',
    color: 'from-amber-500 to-amber-600'
  },
  {
    icon: FiSunrise,
    title: 'Unique Experiences',
    description: 'Curated adventures and exclusive destinations',
    color: 'from-rose-500 to-rose-600'
  },
  {
    icon: FiMap,
    title: 'Global Destinations',
    description: 'Access to the world\'s most beautiful harbors',
    color: 'from-cyan-500 to-cyan-600'
  }
];

export default function WhyChooseUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden bg-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
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
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-serif text-gold mb-6"
          >
            Why Choose
            <span className="block text-primary text-6xl">KOS Yachts?</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 font-light leading-relaxed"
          >
            Experience the perfect blend of luxury, adventure, and professional service
            that sets us apart in the world of yacht charters.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl 
                            border border-gray-100 hover:border-blue-100 
                            transition-all duration-300 h-full transform 
                            hover:scale-[1.02] hover:-translate-y-1">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} 
                               transform group-hover:scale-110 transition-all duration-300 
                               shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="mt-6 text-xl font-medium text-[#1E293B] 
                             group-hover:text-blue-500 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="mt-4 text-gray-600 leading-relaxed 
                             group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '100+', label: 'Premium Yachts' },
            { value: '12', label: 'Destinations' },
            { value: '6+', label: 'Years Experience' },
            { value: '15000+', label: 'Happy Clients' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl 
                        border border-gray-100 hover:border-blue-100 
                        transition-all duration-300 text-center transform 
                        hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="text-4xl font-light text-[#1E293B] group-hover:text-blue-500 
                            transition-colors duration-300 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-light group-hover:text-gray-700 
                            transition-colors duration-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
} 