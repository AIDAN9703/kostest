"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExperienceLayoutProps {
  title: string;
  description: string;
  heroImage: string;
  buttonText: string;
  buttonLink: string;
  heroAlt?: string;
  imageOverlayColor?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  relatedExperiences?: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    href: string;
  }>;
  children: ReactNode;
}

export default function ExperienceLayout({
  title,
  description,
  heroImage,
  buttonText,
  buttonLink,
  heroAlt = "Experience image",
  faqs = [],
  relatedExperiences = [],
  children,
}: ExperienceLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[75vh] sm:h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-3xl text-white">
              <span className="inline-block text-white text-xs font-medium mb-2 tracking-wide uppercase animate-fade-in-up drop-shadow-md">
                Experience
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-4 leading-tight animate-fade-in-up [animation-delay:100ms] drop-shadow-lg">
                {title}
              </h1>
              <p className="text-white/90 text-base md:text-lg mb-5 leading-relaxed animate-fade-in-up [animation-delay:200ms] font-light drop-shadow-md max-w-2xl">
                {description}
              </p>
              <div className="flex flex-wrap gap-3 animate-fade-in-up [animation-delay:300ms]">
                <Button
                  size="default"
                  variant="outline"
                  className="text-white border-white/40 hover:bg-white/10 px-6 py-2.5 text-sm font-medium"
                  asChild
                >
                  <Link href={buttonLink}>
                    {buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-8 md:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="py-8 md:py-10" id="faq-section">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <span className="text-primary font-medium text-sm tracking-wide uppercase">Frequently Asked Questions</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
                Common Questions
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
                Find answers to common questions about this experience
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details 
                  key={index} 
                  className="group bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6">
                    <h3 className="text-xl font-medium text-primary">{faq.question}</h3>
                    <span className="ml-6 flex-shrink-0 text-primary/60 group-open:rotate-180 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed font-light">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-10 text-center animate-fade-in-up [animation-delay:600ms]">
              <p className="text-gray-600 mb-4 font-light">Still have questions?</p>
              <Link href="/contact">
                <Button variant="outline" className="group border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 font-medium">
                  Contact Our Support Team
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Related Experiences */}
      {relatedExperiences.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <span className="text-primary font-medium text-sm tracking-wide uppercase">More Experiences</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
                Other Experiences
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
                Discover more ways to enjoy the water
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedExperiences.map((experience) => (
                <Link
                  key={experience.id}
                  href={experience.href}
                  className="group block"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={experience.image}
                        alt={experience.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Simple Logo Overlay */}
                      <div className="absolute top-4 left-4">
                        <Image
                          src="/icons/kosupdatedlogo.webp"
                          alt="KOS Logo"
                          width={50}
                          height={50}
                          className="object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-medium text-primary mb-2 group-hover:text-primary/80 transition-colors">
                        {experience.title}
                      </h3>
                      <p className="text-gray-600 font-light leading-relaxed">
                        {experience.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

      