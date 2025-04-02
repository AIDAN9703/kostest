"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExperienceLayoutProps {
  title: string;
  description: string;
  heroImage: string;
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
  heroAlt = "Boating experience",
  imageOverlayColor = "from-[#1E293B]/70 to-[#1E293B]/40",
  faqs = [],
  relatedExperiences = [],
  children,
}: ExperienceLayoutProps) {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${imageOverlayColor} z-10`} />
        <div
          className="h-[50vh] md:h-[60vh] bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-white">
          <div className="flex items-center text-sm text-white/80 mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <Link href="/experiences" className="hover:text-white">Experiences</Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="text-white">{title}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {title}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            {description}
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white rounded-full"
            asChild
          >
            <Link href="/boats/search">
              Find Available Boats
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-16">
        {children}
      </div>

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <div className="bg-[#F8FAFC] py-16 md:py-24">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="mb-6 p-6 bg-white rounded-xl shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Related Experiences */}
      {relatedExperiences.length > 0 && (
        <div className="container py-16 md:py-24">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Explore Related Experiences
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {relatedExperiences.map((experience) => (
              <Link
                key={experience.id}
                href={experience.href}
                className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 z-10" />
                  <img
                    src={experience.image}
                    alt={experience.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {experience.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    {experience.description}
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    <span>Learn more</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-[#1E293B] text-white py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Book Your Experience?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Our team is ready to help you plan the perfect day on the water.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
                asChild
              >
                <Link href="/boats/search">
                  Browse Boats
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 rounded-full"
                asChild
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 