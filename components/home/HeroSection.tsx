'use client'

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

const FACTS = [
  '7000+ Professional Captains Ready to Sail',
  'Instant Booking Available 24/7',
  'Verified Reviews from Real Customers',
  'Best Price Guarantee on All Charters',
  'Luxury Yachts in 50+ Destinations',
  'Free Cancellation on Most Bookings',
  'Award-Winning Customer Support'
] as const;

type Fact = typeof FACTS[number];

const STATS = [
  {
    value: '7000+',
    label: 'Luxury Yachts',
    gradient: 'from-teal-300 via-teal-400 to-emerald-400'
  },
  {
    value: '50+',
    label: 'Destinations',
    gradient: 'from-emerald-300 via-cyan-400 to-teal-400'
  },
  {
    value: '10k+',
    label: 'Happy Clients',
    gradient: 'from-cyan-300 via-teal-400 to-emerald-400'
  }
] as const;

// Custom hook for rotating facts
const useRotatingFact = (facts: readonly Fact[], interval = 3000, transitionMs = 200) => {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const tick = () => {
      setTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % facts.length);
        setTransitioning(false);
      }, transitionMs);
    };

    const timer = setInterval(tick, interval);
    return () => clearInterval(timer);
  }, [facts, interval, transitionMs]);

  return { fact: facts[index], isTransitioning };
};

const RotatingFacts = () => {
  const { fact, isTransitioning } = useRotatingFact(FACTS);
  return (
    <span
      className={`text-white/90 font-medium transition-opacity duration-200 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {fact}
    </span>
  );
};

export default function HeroSection() {
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = location.trim();
    if (!query) {
      setError('Please enter a destination');
      return;
    }
    setError(null);
    setIsSearching(true);
    try {
      // Simulate API call with a 500ms delay
      await new Promise((res) => setTimeout(res, 500));
      // Navigate to search results page (adjust URL as needed)
      router.push(`/search?location=${encodeURIComponent(query)}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [location, router]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image 
          src="/images/heroaerial3.jpeg" 
          alt="Luxury Yacht Experience"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-black/20" />
        
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-[1200px] mx-auto w-full">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <RotatingFacts />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400 text-transparent bg-clip-text font-extrabold tracking-tight [text-shadow:_0_4px_20px_rgba(0,0,0,0.1)] animate-gradient-x">
                Yacht Experience
              </span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Discover and book unforgettable yacht charters with verified captains worldwide
            </p>
          </div>

          {/* Search Box */}
          <form 
            onSubmit={handleSearch}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-3 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
            role="search"
          >
            <div className="flex gap-2">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-xl blur-xl transition-all duration-300 group-hover:opacity-100 opacity-0" />
                <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl relative transition-all duration-300 group-hover:shadow-2xl border border-white/20">
                  <Input
                    type="text"
                    placeholder="Where would you like to set sail?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-0 h-[60px] text-lg bg-transparent focus-visible:ring-0 placeholder:text-gray-400 px-6 rounded-xl font-medium"
                    aria-label="Search location"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSearching}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8 h-[60px] rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Search"
              >
                {isSearching ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSearch className="w-6 h-6" />
                    <span className="hidden sm:inline ml-2 text-lg">Search</span>
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div 
                className="mt-3 text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2" 
                role="alert"
              >
                {error}
              </div>
            )}
          </form>

          {/* Stats Section */}
          <div className="w-full max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="bg-teal-900/20 backdrop-blur-xl rounded-xl px-6 py-6 flex items-center justify-between text-white border border-teal-500/20 hover:bg-teal-900/30 transition-all duration-300 shadow-2xl">
              {STATS.map((stat, idx) => (
                <div key={stat.label} className="relative text-center px-3 flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  <div className={`text-5xl font-black font-display tracking-tight bg-gradient-to-r ${stat.gradient} text-transparent bg-clip-text animate-gradient`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm mt-2 font-semibold bg-gradient-to-b from-white to-white/80 text-transparent bg-clip-text`}>
                    {stat.label}
                  </div>
                  {idx !== STATS.length - 1 && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-12 w-px bg-gradient-to-b from-teal-500/10 via-teal-500/20 to-teal-500/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 