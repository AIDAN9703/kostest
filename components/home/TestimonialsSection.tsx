'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url: string;
  time: number;
}

interface ReviewsData {
  reviews: Review[];
  businessName: string;
  overallRating: number;
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setReviewsData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch reviews');
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || !reviewsData?.reviews.length) return;
    
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviewsData.reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, reviewsData?.reviews.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#21336a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Reviews</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reviewsData?.reviews.length) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Reviews Available</h2>
            <p className="text-gray-600">There are currently no reviews to display.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentReview = reviewsData.reviews[active];

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="mt-4 font-bebas-neue tracking-wide text-4xl font-bold text-primary">
Dive Into Our Reviews          </h2>
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
              <div className="flex flex-col items-center">
                {/* Profile Image */}
                <motion.div 
                  className="relative mb-8"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#21336a]/20">
                    <Image
                      src={currentReview.profile_photo_url}
                      alt={currentReview.author_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -bottom-3 -right-3 bg-[#21336a] rounded-full p-2"
                  >
                    <FaQuoteLeft className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.div>

                {/* Rating Stars */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(currentReview.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <FaStar className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <motion.blockquote
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-light text-gray-700 dark:text-gray-300 italic text-center max-w-4xl mb-8"
                >
                  "{currentReview.text}"
                </motion.blockquote>

                {/* Author Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="font-semibold text-[#21336a] dark:text-white text-lg">
                    {currentReview.author_name}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {new Date(currentReview.time * 1000).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4 mt-12">
            <div className="flex space-x-2">
              {reviewsData.reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActive(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 
                    ${active === index 
                      ? 'bg-[#21336a] w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 