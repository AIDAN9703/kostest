'use client';

import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-4 rounded-full border-2 border-[#1E293B] text-[#1E293B] 
               hover:bg-[#1E293B] hover:text-white transition-all duration-300 bg-transparent z-50
               font-serif"
      aria-label="Scroll to top"
    >
      <FiArrowUp className="w-5 h-5" />
    </Button>
  );
} 