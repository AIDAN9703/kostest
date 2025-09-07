'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { Mail, Phone, MapPin, Clock, MessageCircle, Calendar } from 'lucide-react'
import RequestToBook from '@/features/_marketing/landing/components/RequestToBook'

export default function ContactPage() {
  return (
    <div className="w-full">
     

      {/* Main Content Area */}
      <div className="bg-white">
        {/* Contact Methods */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Phone */}
              <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="bg-primary/10 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">Call Us</h3>
                <p className="text-gray-600 font-light mb-4 text-sm">Speak with our team directly</p>
                <Link href="tel:+13055218877">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                    +1 (305) 521-8877
                  </Button>
                </Link>
              </div>

              {/* Email */}
              <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="bg-primary/10 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">Email Us</h3>
                <p className="text-gray-600 font-light mb-4 text-sm">Send us a detailed message</p>
                <Link href="mailto:contact@kosyachts.com">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                    Send Email
                  </Button>
                </Link>
              </div>

              {/* WhatsApp/Text */}
              <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="bg-primary/10 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">Text Us</h3>
                <p className="text-gray-600 font-light mb-4 text-sm">Quick questions & updates</p>
                <Link href="sms:+13055218877">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                    Send Text
                  </Button>
                </Link>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="bg-primary/10 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">Schedule Call</h3>
                <p className="text-gray-600 font-light mb-4 text-sm">Book a consultation</p>
                <Link href="https://api.leadconnectorhq.com/widget/bookings/kos-calendars" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                    Book Meeting
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Request to Book Form Section */}
        <RequestToBook />

        {/* Location & Hours */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
                Our Location & Hours
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
                Stop by our office or give us a call during business hours
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Location */}
              <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-primary">Our Location</h3>
                </div>
                <div className="space-y-4 text-gray-600 font-light">
                  <div>
                    <h4 className="font-medium text-primary mb-2">Miami Office</h4>
                    <p className="text-base">1234 Biscayne Boulevard</p>
                    <p className="text-base">Miami, FL 33132</p>
                    <p className="text-base">United States</p>
                  </div>
                  <div className="pt-2">
                    <Link href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                        Get Directions
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-primary">Business Hours</h3>
                </div>
                <div className="space-y-3 text-gray-600 font-light">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-base">Monday - Friday</span>
                    <span className="font-medium text-primary">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-base">Saturday</span>
                    <span className="font-medium text-primary">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-base">Sunday</span>
                    <span className="font-medium text-primary">By Appointment</span>
                  </div>
                  <div className="pt-4 bg-primary/5 rounded-lg p-3">
                    <p className="text-sm text-primary font-medium mb-1">
                      Emergency charters available 24/7
                    </p>
                    <p className="text-sm text-gray-600">
                      Call us anytime for urgent requests
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
