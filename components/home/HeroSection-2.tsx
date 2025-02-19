'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiUsers, FiMapPin, FiSearch, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Image from 'next/image';
import { TypeAnimation } from 'react-type-animation';
import { debounce } from 'lodash';

interface HeroSectionProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface Location {
  name: string;
  marina: string;
  state: string;
}

export default function HeroSection({ darkMode, toggleDarkMode }: HeroSectionProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [location, setLocation] = useState<string>('');
  const [guests, setGuests] = useState<string>('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const facts = [
    '7000+ Professional Captains Ready to Sail',
    'Instant Booking Available 24/7',
    'Verified Reviews from Real Customers',
    'Best Price Guarantee on All Charters',
    'Luxury Yachts in 50+ Destinations',
    'Free Cancellation on Most Bookings',
    'Award-Winning Customer Support'
  ];

  const popularLocations: Location[] = [
    { name: 'Miami Beach', marina: 'South Beach Marina', state: 'FL' },
    { name: 'Fort Lauderdale', marina: 'Las Olas Marina', state: 'FL' },
    { name: 'Key West', marina: 'Historic Seaport', state: 'FL' },
    { name: 'Naples', marina: 'Naples Bay Marina', state: 'FL' }
  ];

  // Close location suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      // Simulate API call
      console.log('Searching for:', searchTerm);
    }, 300),
    []
  );

  useEffect(() => {
    if (location) {
      debouncedSearch(location);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [location, debouncedSearch]);

  const handleSearch = async () => {
    if (!location || !startDate || !guests) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setIsSearching(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Navigate to search results
      console.log('Searching with:', { location, startDate, guests });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 100)) {
      setGuests(value);
    }
  };

  const clearLocation = () => {
    setLocation('');
    setShowLocationSuggestions(false);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image 
          src="/images/boats/aerial4.jpg" 
          alt="Luxury Yacht Experience" 
          fill 
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60" />
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-[1200px] mx-auto w-full">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
            >
              <TypeAnimation
                sequence={[
                  ...facts.flatMap(fact => [fact, 3000])
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-white/90 font-medium"
              />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Find Your Perfect
              <span className="block bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
                Yacht Experience
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90 max-w-2xl mx-auto"
            >
              Discover and book unforgettable yacht charters with verified captains worldwide
            </motion.p>
          </div>

          {/* Enhanced Search Box */}
          <motion.div
            ref={searchBoxRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-3 max-w-4xl mx-auto"
            role="search"
            aria-label="Yacht search"
          >
            <div className="flex flex-col md:flex-row gap-3">
              {/* Location */}
              <div className="flex-1 relative group">
                <div className="bg-white rounded-xl transition-all duration-200 group-hover:shadow-lg">
                  <div className="px-4 py-2">
                    <label htmlFor="location" className="block text-xs text-gray-500 font-medium mb-1">WHERE</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="location"
                        type="text"
                        placeholder="Search destinations"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onFocus={() => setShowLocationSuggestions(true)}
                        className="w-full pl-6 pr-8 text-gray-900 font-medium focus:outline-none"
                        aria-expanded={showLocationSuggestions}
                        role="combobox"
                      />
                      {location && (
                        <button
                          onClick={clearLocation}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                          aria-label="Clear location"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Location Suggestions */}
                  <AnimatePresence>
                    {showLocationSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20"
                        role="listbox"
                      >
                        {popularLocations.map((loc, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-none"
                            onClick={() => {
                              setLocation(loc.name);
                              setShowLocationSuggestions(false);
                            }}
                            role="option"
                            aria-selected={location === loc.name}
                          >
                            <div className="font-medium text-gray-900">{loc.name}, {loc.state}</div>
                            <div className="text-sm text-gray-500">{loc.marina}</div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Date */}
              <div className="w-full md:w-48 group">
                <div className="bg-white rounded-xl transition-all duration-200 group-hover:shadow-lg">
                  <div className="px-4 py-2">
                    <label htmlFor="date" className="block text-xs text-gray-500 font-medium mb-1">WHEN</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                      <DatePicker
                        id="date"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText="Select date"
                        className="w-full pl-6 text-gray-900 font-medium focus:outline-none cursor-pointer"
                        minDate={new Date()}
                        aria-label="Select date"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div className="w-full md:w-40 group">
                <div className="bg-white rounded-xl transition-all duration-200 group-hover:shadow-lg">
                  <div className="px-4 py-2">
                    <label htmlFor="guests" className="block text-xs text-gray-500 font-medium mb-1">GUESTS</label>
                    <div className="relative">
                      <FiUsers className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="guests"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Add guests"
                        value={guests}
                        onChange={handleGuestsChange}
                        className="w-full pl-6 text-gray-900 font-medium focus:outline-none"
                        aria-label="Number of guests"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full md:w-auto bg-[#21336a] hover:bg-[#2a4086] text-white px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Search for yachts"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSearch className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 text-red-500 text-sm text-center"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-4xl mx-auto mt-12"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 flex items-center justify-between text-white/90 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="text-center px-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 text-transparent bg-clip-text">
                7000+
              </div>
              <div className="text-sm mt-1">Luxury Yachts</div>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="text-center px-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 text-transparent bg-clip-text">
                50+
              </div>
              <div className="text-sm mt-1">Destinations</div>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="text-center px-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 text-transparent bg-clip-text">
                10k+
              </div>
              <div className="text-sm mt-1">Happy Clients</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 