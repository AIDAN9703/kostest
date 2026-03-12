import React from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { Mail, Phone, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function CTASection() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content - left aligned */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                Ready to write your story?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Let's create the yacht experience of your dreams. Our team is here to turn your vision into reality. Expect exciting ventures, new locations, and initiatives, including the latest updates and an exclusive online store.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/boats/search">
                <Button className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 px-8 py-4 text-lg font-medium">
                  Explore Our Fleet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg font-medium">
                  Contact Our Team
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-gray-500 pt-8 border-t border-gray-200">
              <div className="flex items-center">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                <span className="text-sm sm:text-base">contact@kosyachts.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                <span className="text-sm sm:text-base">+1 (305) 521-8877</span>
              </div>
            </div>
          </div>

          {/* Creative image layout - right side */}
          <div className="relative order-1 lg:order-2">
            <div className="relative">
              <Image
                src="/images/herooption15.jpeg"
                alt="Ready for adventure"
                width={600}
                height={400}
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 