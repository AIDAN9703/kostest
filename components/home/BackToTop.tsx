'use client';

import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

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
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 bg-[#21336a] text-white p-3 rounded-full 
                shadow-lg hover:bg-[#2a4086] transition-colors duration-300 z-50"
    >
      <FiArrowUp className="w-6 h-6" />
    </button>
  );
} 