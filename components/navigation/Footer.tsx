'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Send } from 'lucide-react';
import { FaYoutube, FaTiktok } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="block mb-6">
              <Image 
                src="/icons/logo.png" 
                alt="KOS Yachts" 
                width={48} 
                height={48}
                className="rounded-full"
              />
            </Link>
            <p className="text-gray-300 text-base font-light leading-relaxed mb-8">
              Experience luxury yachting at its finest. Your journey to extraordinary destinations begins with KOS Yachts.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com" 
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-300" />
              </a>
              <a 
                href="https://tiktok.com" 
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok className="w-5 h-5 text-gray-300" />
              </a>
              <a 
                href="https://youtube.com" 
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="w-5 h-5 text-gray-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-serif text-xl mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-300 hover:text-gold transition-colors font-light">About Us</Link></li>
              <li><Link href="/boats" className="text-gray-300 hover:text-gold transition-colors font-light">Our Fleet</Link></li>
              <li><Link href="/destinations" className="text-gray-300 hover:text-gold transition-colors font-light">Destinations</Link></li>
              <li><Link href="/guide" className="text-gray-300 hover:text-gold transition-colors font-light">Charter Guide</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-gold transition-colors font-light">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-serif text-xl mb-6">Services</h3>
            <ul className="space-y-4">
              <li><Link href="/services/luxury" className="text-gray-300 hover:text-gold transition-colors font-light">Luxury Charters</Link></li>
              <li><Link href="/services/crew" className="text-gray-300 hover:text-gold transition-colors font-light">Crew Services</Link></li>
              <li><Link href="/services/events" className="text-gray-300 hover:text-gold transition-colors font-light">Event Planning</Link></li>
              <li><Link href="/services/concierge" className="text-gray-300 hover:text-gold transition-colors font-light">Concierge</Link></li>
              <li><Link href="/services/management" className="text-gray-300 hover:text-gold transition-colors font-light">Yacht Management</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-serif text-xl mb-6">Newsletter</h3>
            <p className="text-gray-300 font-light leading-relaxed mb-6">
              Subscribe to receive updates about our latest offerings and exclusive yacht experiences.
            </p>
            <form className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-400 rounded-full py-6 pl-6 pr-36 focus:border-gold focus:ring-gold"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold hover:bg-gold/90 text-[#1E293B] rounded-full px-6 py-2"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 font-light text-sm">
              © 2024 KOS Yachts. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-gray-400 hover:text-gold transition-colors text-sm font-light">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-gold transition-colors text-sm font-light">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-gold transition-colors text-sm font-light">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}