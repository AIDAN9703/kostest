'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiAnchor, FiStar, FiWind, FiMap } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: FiAnchor,
    title: 'Expert Captains',
    description: 'Seasoned professionals with extensive maritime experience'
  },
  {
    icon: FiStar,
    title: 'Luxury Service',
    description: 'Five-star amenities and personalized attention to detail'
  },
  {
    icon: FiWind,
    title: 'Freedom to Explore',
    description: 'Chart your own course through pristine waters'
  },
  {
    icon: FiMap,
    title: 'Premium Destinations',
    description: 'Access to exclusive ports and hidden paradise spots'
  }
];

export default function ExperienceSection() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative h-[700px] rounded-3xl overflow-hidden">
              <Image
                src="/images/heroaerial2.jpeg"
                alt="Luxury Yacht Experience"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent" />
            </div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-12 -right-12 bg-white rounded-3xl shadow-2xl p-8 w-64"
            >
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-light text-[#1E293B]">500+</div>
                  <div className="text-sm text-gray-600 mt-1">Premium Yachts</div>
                </div>
                <div className="h-px bg-gray-100" />
                <div>
                  <div className="text-4xl font-light text-[#1E293B]">15+</div>
                  <div className="text-sm text-gray-600 mt-1">Global Destinations</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <div className="space-y-12 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex mb-4">
                <div className="h-[2px] w-20 bg-gold" />
              </div>
              <h2 className="text-5xl font-serif text-[#1E293B] mb-6">
                <span className="text-gold">The Ultimate</span>
                <span className="block mt-2">Yacht Experience</span>
              </h2>
              <p className="text-xl text-gray-600 font-light leading-relaxed">
                Embark on an extraordinary journey where luxury meets adventure. Our fleet of premium yachts and expert crew ensure every moment is crafted to perfection.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E293B] flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-medium text-[#1E293B]">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed pl-16">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button
                className="font-serif text-lg px-12 py-4 rounded-full border-2 border-[#1E293B] text-[#1E293B] 
                         hover:bg-[#1E293B] hover:text-white transition-all duration-300 bg-transparent"
                onClick={() => { window.location.href = '/boats'; }}
              >
                Start Your Journey
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 