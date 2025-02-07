import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  title: string;
  image: string;
  rating: number;
  location: string;
  tripDetails: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "An unforgettable experience that exceeded all expectations. The attention to detail and personalized service made our journey truly extraordinary.",
    author: "James Hamilton",
    title: "CEO, Hamilton Industries",
    image: "/images/testimonials/1.jpg",
    rating: 5,
    location: "Mediterranean Sea",
    tripDetails: "7-day luxury yacht charter",
    date: "August 2023"
  },
  {
    id: 2,
    quote: "KOS Yachts provided the perfect blend of luxury and adventure. The crew was exceptional and the yacht was immaculate.",
    author: "Sarah Mitchell",
    title: "Travel Enthusiast",
    image: "/images/testimonials/2.jpg",
    rating: 5,
    location: "Caribbean Islands",
    tripDetails: "14-day island hopping",
    date: "December 2023"
  },
  {
    id: 3,
    quote: "The attention to detail and personalized service made our journey truly special. A world-class experience from start to finish.",
    author: "Michael Chen",
    title: "Executive Director",
    image: "/images/testimonials/3.jpg",
    rating: 5,
    location: "French Riviera",
    tripDetails: "5-day coastal cruise",
    date: "July 2023"
  }
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-[#21336a] dark:text-blue-400 text-sm font-semibold tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            What Our Clients Say
          </h2>
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
                      src={testimonials[active].image}
                      alt={testimonials[active].author}
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
                  {[...Array(testimonials[active].rating)].map((_, i) => (
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
                  "{testimonials[active].quote}"
                </motion.blockquote>

                {/* Author Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="font-semibold text-[#21336a] dark:text-white text-lg">
                    {testimonials[active].author}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {testimonials[active].title}
                  </div>
                  
                  {/* Trip Details */}
                  <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                    <span className="px-3 py-1 bg-[#21336a]/10 rounded-full text-[#21336a] dark:text-blue-400">
                      {testimonials[active].location}
                    </span>
                    <span className="px-3 py-1 bg-[#21336a]/10 rounded-full text-[#21336a] dark:text-blue-400">
                      {testimonials[active].tripDetails}
                    </span>
                    <span className="px-3 py-1 bg-[#21336a]/10 rounded-full text-[#21336a] dark:text-blue-400">
                      {testimonials[active].date}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4 mt-12">
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
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
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 