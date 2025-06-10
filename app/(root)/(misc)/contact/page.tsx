'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Clock, MessageCircle, Calendar } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary font-medium text-sm tracking-wide uppercase mb-4 block">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 text-primary leading-tight">
            Contact KOS Yachts
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Ready to start planning your luxury yacht experience? Our team is here to help you 
            create unforgettable memories on the water.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-8 md:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-2">Call Us</h3>
              <p className="text-gray-600 font-light mb-4">Speak with our team</p>
              <Link href="tel:+13055218877">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                  +1 (305) 521-8877
                </Button>
              </Link>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-2">Email Us</h3>
              <p className="text-gray-600 font-light mb-4">Send us a detailed message</p>
              <Link href="mailto:contact@kosyachts.com">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                  Send Email
                </Button>
              </Link>
            </div>

            {/* WhatsApp/Text */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-2">Text Us</h3>
              <p className="text-gray-600 font-light mb-4">Quick questions & updates</p>
              <Link href="sms:+13055218877">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                  Send Text
                </Button>
              </Link>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-2">Schedule Call</h3>
              <p className="text-gray-600 font-light mb-4">Book a consultation</p>
              <Link href="/contact">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                  Book Meeting
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Location */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-medium text-primary">Our Location</h2>
              </div>
              <div className="space-y-4 text-gray-600 font-light">
                <div>
                  <h3 className="font-medium text-primary mb-2">Miami Office</h3>
                  <p>1234 Biscayne Boulevard</p>
                  <p>Miami, FL 33132</p>
                  <p>United States</p>
                </div>
                <div className="pt-4">
                  <Link href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                      Get Directions
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-medium text-primary">Business Hours</h2>
              </div>
              <div className="space-y-3 text-gray-600 font-light">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium">By Appointment</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-primary font-medium">
                    Emergency charters available 24/7
                  </p>
                  <p className="text-sm">
                    Call us anytime for urgent requests
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
