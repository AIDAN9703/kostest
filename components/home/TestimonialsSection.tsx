'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url: string;
  relative_time_description: string;
  job_title?: string;
}

interface TestimonialsSectionProps {
  reviews: Review[];
}

// Animation variants
const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ duration: 0.5, delay })
};

// Common style objects to reduce repetition
const styles = {
  section: "relative bg-primary text-white overflow-hidden",
  container: "max-w-7xl mx-auto px-4 py-6 md:py-10",
  heading: "font-serif text-4xl md:text-5xl mb-2 text-white",
  headingWrapper: "text-center max-w-3xl mx-auto mb-10",
  grid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6",
  navButton: "absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition",
  card: "bg-white rounded-xl shadow-xl overflow-hidden h-full flex flex-col",
  cardHeader: "p-6 flex items-start",
  cardBody: "px-6 pb-6 flex-1",
  avatar: "relative w-12 h-12 rounded-full overflow-hidden",
  authorName: "text-lg font-medium text-[#1E293B]",
  timestamp: "text-sm text-gray-600 mb-2",
  reviewText: "text-gray-700 leading-relaxed mb-4 line-clamp-6 overflow-hidden",
  pagination: "flex justify-center mt-10 gap-2",
  activeDot: "h-2 bg-white w-6 rounded-full transition",
  inactiveDot: "h-2 bg-white/40 w-2 rounded-full hover:bg-white/60 transition",
  googleButton: "flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 transition-all duration-300 py-3 px-6 rounded-full font-medium mt-10 mx-auto w-fit"
};

export default function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }
    return 3;
  };
  
  const [visibleCount, setVisibleCount] = useState(3);
  
  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || !reviews.length) return;
    
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % Math.max(1, reviews.length - visibleCount + 1));
    }, 12000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, reviews.length, visibleCount]);

  if (!reviews.length) {
    return (
      <div className="py-8 sm:py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">No Reviews Available</h2>
            <p className="text-sm sm:text-base opacity-80">There are currently no reviews to display.</p>
          </div>
        </div>
      </div>
    );
  }

  const visibleReviews = reviews.slice(startIndex, startIndex + visibleCount);
  const maxIndex = Math.max(1, reviews.length - visibleCount + 1);
  
  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % maxIndex);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + maxIndex) % maxIndex);
    setIsAutoPlaying(false);
  };

  return (
    <section className={styles.section}>
      {/* Background Logo */}
      <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 opacity-20 transform">
        <Image 
          src="/icons/kosupdatedlogo.webp" 
          alt="KOS Background Logo"
          fill
          className="object-contain"
        />
      </div>
      
      <div className={styles.container}>
        <motion.div
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
          className={styles.headingWrapper}
        >
          <h2 className={styles.heading}>Dive Into Our Reviews!</h2>
        </motion.div>

        <div className="relative">
          {reviews.length > visibleCount && (
            <>
              <button 
                onClick={prevSlide}
                className={`${styles.navButton} -left-10`}
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              
              <button 
                onClick={nextSlide}
                className={`${styles.navButton} -right-10`}
                aria-label="Next slide"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </>
          )}

          <div className={styles.grid}>
            <AnimatePresence mode="wait">
              {visibleReviews.map((review, index) => (
                <motion.div
                  key={`${startIndex}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className="mr-4">
                        <div className={styles.avatar}>
                          <Image
                            src={review.profile_photo_url}
                            alt={review.author_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className={styles.authorName}>{review.author_name}</h3>
                        <p className={styles.timestamp}>{review.relative_time_description}</p>
                      </div>
                    </div>
                    
                    <div className={styles.cardBody}>
                      <p className={styles.reviewText}>{review.text}</p>
                      
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {reviews.length > visibleCount && (
            <div className={styles.pagination}>
              {Array.from({ length: maxIndex }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setStartIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={startIndex === index ? styles.activeDot : styles.inactiveDot}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Google Reviews Button */}
          <motion.a
            href="https://www.google.com/search?sca_esv=dae00c36fa947bf4&sxsrf=AHTn8zrH2ld7Eupc4ookn3vb3Qj3ZDj9FA:1742944238034&si=APYL9bs7Hg2KMLB-4tSoTdxuOx8BdRvHbByC_AuVpNyh0x2KzaJFr6ZGJ2eWQ06eolUOeumRyqiu5baVS1qGI_PmH2q18qPSaMe8jhRoz0qKRjtMvpDhiw0aWyhQEsviI-91tYmsUmDrAE0RKCeJZPt3KNSYjfVH2Q%3D%3D&q=KOS+Yachts:+Kings+of+the+Sea+Reviews&sa=X&ved=2ahUKEwig566hraaMAxXDL1kFHYXsIuMQ0bkNegQIJxAE&biw=1488&bih=871&dpr=1.25"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.googleButton}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FaGoogle className="w-5 h-5" />
            <span>View More on Google</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
} 