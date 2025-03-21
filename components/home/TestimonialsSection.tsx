'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url: string;
  relative_time_description: string;
}

interface TestimonialsSectionProps {
  reviews: Review[];
}

// Reusable animation variants for DRY code
const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ 
    duration: 0.5, 
    delay 
  })
};

export default function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  const [active, setActive] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || !reviews.length) return;
    
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, reviews.length]);

  if (!reviews.length) {
    return (
      <div className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No Reviews Available</h2>
            <p className="text-sm sm:text-base text-gray-600">There are currently no reviews to display.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentReview = reviews[active];

  return (
    <section className="relative py-8 sm:py-12 md:py-16 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16"
        >
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="h-[2px] w-16 sm:w-20 bg-gold" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1E293B] mb-3 sm:mb-4 md:mb-6">
            <span className="text-gold">Client</span> Testimonials
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            See what our clients are saying about us on Google
          </p>
          
          {/* Google Reviews Badge */}
          <div className="flex items-center justify-center mt-4 sm:mt-6">
            <FcGoogle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium text-gray-700">
                4.9 on Google Reviews
              </span>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Google Review Card */}
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md sm:shadow-lg border border-gray-200 overflow-hidden">
                {/* Card Header */}
                <div className="p-4 sm:p-6 flex items-center">
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                      <Image
                        src={currentReview.profile_photo_url}
                        alt={currentReview.author_name}
                        width={48}
                        height={48}
                        className="object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {currentReview.author_name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < currentReview.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-xs sm:text-sm text-gray-500">
                        {currentReview.relative_time_description}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <FcGoogle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    "{currentReview.text}"
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-3 sm:space-x-4 mt-6 sm:mt-8">
            <div className="flex space-x-1 sm:space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActive(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`h-2 sm:h-3 rounded-full transition-all duration-300 
                    ${active === index 
                      ? 'bg-[#4285F4] w-6 sm:w-8' 
                      : 'bg-gray-300 hover:bg-gray-400 w-2 sm:w-3'
                    }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* "See All Reviews" Button */}
          <div className="flex justify-center mt-6 sm:mt-8">
            <a 
              href="https://www.google.com/search?q=KOS+Yachts+reviews" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm sm:text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
            >
              <FcGoogle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              See All Reviews on Google
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 