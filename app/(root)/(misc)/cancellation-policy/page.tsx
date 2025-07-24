import React from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { Mail, Phone, Globe, Shield, Calendar, Clock, AlertTriangle, CreditCard, FileText } from 'lucide-react'

// Force static generation - this policy page has no dynamic content
export const dynamic = 'force-static';

export default function CancellationPolicyPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-10 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary font-medium text-sm tracking-wide uppercase mb-2 block">
            Payment & Cancellation Policy
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-primary leading-tight">
            Booking Terms & Conditions
          </h1>
        </div>
      </section>

      {/* Policy Content */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            
            {/* Introduction */}
            <div className="p-8 border-b border-gray-200">
              <div className="bg-primary/5 rounded-lg p-4 mb-6">
                <p className="text-primary font-medium text-sm">
                  Last Updated: 5/22/25
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed font-light">
                At KOS Yachts, we strive to provide clear and fair booking terms for all our charter services. 
                This policy outlines our payment requirements, cancellation terms, and operational procedures 
                to ensure a smooth booking experience for all clients.
              </p>
            </div>

            {/* Section A: Reservations & Payment Terms */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-medium text-primary">A. Reservations & Payment Terms</h2>
              </div>
              
              <p className="text-gray-600 mb-6 font-light">
                To secure your yacht charter with KOS Yachts, the following booking and payment terms apply:
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-primary mb-3">Deposit Requirement</h3>
                  <p className="text-gray-600 font-light">
                    A 50% deposit is required at the time of booking to reserve your selected vessel and charter date(s).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary mb-3">Final Payment</h3>
                  <p className="text-gray-600 font-light">
                    The remaining balance must be paid at least 24 hours prior to the scheduled charter departure time. 
                    Failure to complete final payment may result in cancellation without refund.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary mb-3">Booking Confirmation</h3>
                  <p className="text-gray-600 font-light">
                    Charters are only confirmed once full payment is received and processed. No charter is guaranteed 
                    until payment is completed in full and you receive a written confirmation from our team.
                  </p>
                </div>
              </div>
            </div>

            {/* Section B: Cancellations & Refunds */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-medium text-primary">B. Cancellations & Refunds</h2>
              </div>
              
              <p className="text-gray-600 mb-6 font-light">
                Unless specified differently in your vessel-specific agreement, the following general cancellation policy applies:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-primary">Cancellation Window</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-primary">Refund Policy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">7 days or more</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">Full refund (minus processing or admin fees)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">48 to 72 hours before</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">50% refund of the total charter fee</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">Within 24 hours</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">No refund (100% of the payment is retained)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">Custom Terms</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">May apply based on vessel and owner policies; outlined in your booking agreement or invoice</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section C: Weather & Operational Conditions */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-medium text-primary">C. Weather & Operational Conditions</h2>
              </div>
              
              <p className="text-gray-600 mb-6 font-light">
                We distinguish between unsafe and unfavorable conditions:
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-primary mb-3">Unsafe Conditions</h3>
                  <p className="text-gray-600 font-light">
                    In the event of high winds, lightning, mechanical failure, pandemics, or other safety hazards, 
                    KOS Yachts will work with you to reschedule your charter or provide a refund at our discretion.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary mb-3">Unfavorable Conditions</h3>
                  <p className="text-gray-600 font-light">
                    In cases of cloudy weather, light rain, or wind, most charters will proceed as planned. 
                    These are not valid reasons for refund under normal conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Section D: Flexibility & Communication */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-medium text-primary">D. Flexibility & Communication</h2>
              </div>
              
              <p className="text-gray-600 mb-6 font-light">
                KOS Yachts is committed to exceptional client service and fairness. We understand that plans may change, 
                and our team will always strive to accommodate your situation when possible.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-light">
                    To modify or cancel your booking, please contact us as early as possible.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-light">
                    All rescheduling is subject to vessel availability and applicable rates or fees.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section E: Contact Information */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-medium text-primary">E. Contact for Payment or Cancellation Inquiries</h2>
              </div>
              
              <p className="text-gray-600 mb-6 font-light">
                For any questions regarding payments, cancellations, or modifications to your booking, please contact us:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-primary">Email</p>
                    <Link href="mailto:contact@kosyachts.com" className="text-gray-600 hover:text-primary transition-colors">
                      contact@kosyachts.com
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-primary">Phone</p>
                    <Link href="tel:3055218877" className="text-gray-600 hover:text-primary transition-colors">
                      (305) 521-8877
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-primary">Website</p>
                    <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
                      www.kosyachts.com
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 rounded-lg p-4">
                <p className="text-primary font-medium text-sm">
                  We recommend reviewing your specific booking agreement for any vessel-specific terms that may differ from this general policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
