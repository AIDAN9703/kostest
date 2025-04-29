"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
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
  heroAlt = "Boating experience",
  imageOverlayColor = "from-[#1E293B]/70 to-[#1E293B]/40",
  faqs = [],
  relatedExperiences = [],
  children,
}: ExperienceLayoutProps) {
  return (
    <div className="bg-white font-poppins">
      {/* Hero Section */}
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${imageOverlayColor} z-10`} />
        <div
          className="h-[50vh] md:h-[60vh] bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="px-4 md:px-8 container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-white">
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
            className="bg-transparent hover:bg-transparent border border-white text-white rounded-3xl"
            asChild
          >
            <Link href={buttonLink}>
              {buttonText}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {children}

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <div className=" py-16 md:py-24">
          <div className="container font-poppins text-primary">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="mb-6 p-6"
                >
                  <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

      