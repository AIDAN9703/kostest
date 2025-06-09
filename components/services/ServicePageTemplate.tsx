'use client'

import React, { useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Phone, Mail, Calendar, Star, Shield, Award } from 'lucide-react'

export interface ServiceStat {
  value: string
  label: string
}

export interface ServiceTestimonial {
  quote: string
  author: string
  role?: string
  image?: string
}

export interface ServiceFeature {
  title: string
  description: string
}

export interface ServiceStep {
  title: string
  description: string
}

export interface ServicePageProps {
  title: string
  subtitle: string
  description: string
  heroImage: string
  features: ServiceFeature[]
  secondaryImage?: string
  stats?: ServiceStat[]
  steps?: ServiceStep[]
  faqItems?: Array<{question: string, answer: string}>
  ctaText?: string
  ctaLink?: string
}

const ServicePageTemplate: React.FC<ServicePageProps> = ({
  title,
  subtitle,
  description,
  heroImage,
  features,
  secondaryImage = '/images/default-service.jpg',
  stats = [],
  steps = [],
  faqItems = [],
  ctaText = 'Contact Us',
  ctaLink = '/contact'
}) => {
  // Display only the first 3 stats
  const displayStats = stats.slice(0, 3);

  // Memoized scroll handler for smooth scrolling
  const scrollToContact = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact-section');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section - Matching home page style */}
      <section className="relative w-full h-[75vh] sm:h-[80vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-50" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto font-poppins text-white">
            <span className="inline-block text-white/90 text-sm font-medium mb-4 tracking-wide uppercase animate-fade-in-up">
              {subtitle}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight animate-fade-in-up [animation-delay:200ms]">
              {title}
            </h1>
            <p className="text-white/90 max-w-2xl mx-auto text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed animate-fade-in-up [animation-delay:400ms]">
              {description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up [animation-delay:600ms]">
              <Link href={ctaLink} aria-label={`${ctaText} for ${title}`}>
                <Button size="lg" className="bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 text-white border-0 group">
                  {ctaText}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact" aria-label="Contact Sales">
                <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10">
                  <Phone className="mr-2 h-5 w-5" /> Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Refined design */}
      {displayStats.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayStats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`text-center group animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-gradient-to-br from-sky-50 to-emerald-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="text-4xl md:text-5xl font-bold mb-3 font-poppins bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-lg font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Introduction Section - Clean two-column layout */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 animate-fade-in-left">
              <span className="text-primary font-medium text-sm tracking-wide uppercase">About {title}</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary font-poppins leading-tight">
                Excellence in Every Detail
              </h2>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                At KOS, we understand that every client has unique needs. 
                Our {title.toLowerCase()} services are designed to provide seamless experiences 
                with attention to every detail. Our team of experts brings years of industry 
                experience and a passion for excellence to every project.
              </p>
              
              <div className="flex items-center mb-8 gap-4">
                <div className="bg-gradient-to-r from-sky-100 to-emerald-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-primary font-poppins">Schedule a Consultation</h3>
                  <p className="text-gray-500">Free 30-minute initial consultation</p>
                </div>
              </div>
              
              <Link href="/contact" onClick={scrollToContact}>
                <Button variant="outline" className="group border-primary text-primary hover:bg-primary hover:text-white">
                  Book a Meeting
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            <div className="order-1 lg:order-2 relative animate-fade-in-right">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={secondaryImage}
                  alt={`${title} service`}
                  fill
                  className="object-cover"
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Card grid matching your existing style */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="text-primary font-medium text-sm tracking-wide uppercase">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary font-poppins">
              The KOS Advantage
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              When you choose our {title} services, you're choosing excellence at every step.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-sky-100 to-emerald-100 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium text-primary font-poppins">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps - Horizontal layout */}
      {steps.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <span className="text-primary font-medium text-sm tracking-wide uppercase">Our Process</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary font-poppins">
                How We Work
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Our streamlined process ensures exceptional results every time.
              </p>
            </div>
            
            <div className="relative">
              {/* Connecting line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-200 via-sky-300 to-emerald-200 transform -translate-y-1/2 z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 relative z-10">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className="group relative animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Step number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-sm z-20">
                      {index + 1}
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 pt-8 h-full">
                      <h3 className="text-lg font-medium text-primary font-poppins mb-3 text-center">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed text-center">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mobile indicator dots */}
              <div className="flex justify-center mt-8 lg:hidden">
                {steps.map((_, index) => (
                  <div key={index} className="w-2 h-2 bg-gradient-to-r from-sky-300 to-emerald-300 rounded-full mx-1"></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqItems.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50" id="faq-section">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <span className="text-primary font-medium text-sm tracking-wide uppercase">Frequently Asked Questions</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary font-poppins">
                Common Questions
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Find answers to the most common questions about our {title} services.
              </p>
            </div>
            
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details 
                  key={index} 
                  className={`group bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6">
                    <h3 className="text-xl font-medium text-primary font-poppins">{item.question}</h3>
                    <span className="ml-6 flex-shrink-0 text-primary group-open:rotate-180 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
            
            <div className="mt-12 text-center animate-fade-in-up [animation-delay:600ms]">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Link href="/contact" onClick={scrollToContact}>
                <Button variant="outline" className="group border-primary text-primary hover:bg-primary hover:text-white">
                  Contact Our Support Team
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action - Matching hero style */}
      <section className="py-16 md:py-24 bg-primary text-white relative overflow-hidden" id="contact-section">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 font-poppins">Ready to Get Started?</h2>
          <p className="text-white/85 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            Let us help you achieve your goals with our premium {title} service. Contact our team today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href={ctaLink}>
              <Button variant="secondary" className="group bg-white text-primary hover:bg-gray-100">
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="group text-white border-white/50 hover:bg-white/10">
                <Phone className="mr-2 h-5 w-5" /> Schedule a Call
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              <span>contact@kos.com</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              <span>+1 (305) 521-8877</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicePageTemplate 