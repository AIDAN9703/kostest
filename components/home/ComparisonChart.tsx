"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import Image from "next/image";

// Define types for our comparison data
type FeatureStatus = boolean | "partial";

interface CompanyFeatures {
  [key: string]: FeatureStatus;
}

interface Company {
  name: string;
  logo: string;
  description: string;
  features: CompanyFeatures;
}

interface Category {
  name: string;
  features: string[];
}

interface ComparisonDataType {
  categories: Category[];
  companies: Company[];
}

// Define the comparison data
const comparisonData: ComparisonDataType = {
  categories: [
    {
      name: "Experience",
      features: [
        "Luxury Yachts",
        "Personalized Service",
        "Premium Amenities"
      ]
    },
    {
      name: "Booking",
      features: [
        "Instant Booking",
        "Flexible Cancellation",
        "Transparent Pricing"
      ]
    },
    {
      name: "Service",
      features: [
        "Professional Crew",
        "24/7 Support",
        "Satisfaction Guarantee"
      ]
    }
  ],
  companies: [
    {
      name: "KOS Yachts",
      logo: "/images/logo.png",
      description: "Premium luxury yacht experiences",
      features: {
        "Luxury Yachts": true,
        "Personalized Service": true,
        "Premium Amenities": true,
        "Instant Booking": true,
        "Flexible Cancellation": true,
        "Transparent Pricing": true,
        "Professional Crew": true,
        "24/7 Support": true,
        "Satisfaction Guarantee": true
      }
    },
    {
      name: "Boatsetter",
      logo: "/images/competitors/boatsetter.png",
      description: "Peer-to-peer boat rentals",
      features: {
        "Luxury Yachts": "partial",
        "Personalized Service": false,
        "Premium Amenities": "partial",
        "Instant Booking": true,
        "Flexible Cancellation": "partial",
        "Transparent Pricing": true,
        "Professional Crew": "partial",
        "24/7 Support": "partial",
        "Satisfaction Guarantee": "partial"
      }
    },
    {
      name: "GetMyBoat",
      logo: "/images/competitors/getmyboat.png",
      description: "Global boat marketplace",
      features: {
        "Luxury Yachts": "partial",
        "Personalized Service": false,
        "Premium Amenities": false,
        "Instant Booking": true,
        "Flexible Cancellation": "partial",
        "Transparent Pricing": "partial",
        "Professional Crew": "partial",
        "24/7 Support": false,
        "Satisfaction Guarantee": false
      }
    }
  ]
};

// Feature status component
const FeatureStatus = ({ status }: { status: FeatureStatus }) => {
  if (status === true) {
    return (
      <div className="flex justify-center">
        <div className="p-1.5 rounded-full bg-green-50 shadow-sm">
          <Check className="h-5 w-5 text-green-600" />
        </div>
      </div>
    );
  } else if (status === false) {
    return (
      <div className="flex justify-center">
        <div className="p-1.5 rounded-full bg-red-50 shadow-sm">
          <X className="h-5 w-5 text-red-500" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-center">
        <div className="p-1.5 rounded-full bg-amber-50 shadow-sm">
          <Minus className="h-5 w-5 text-amber-500" />
        </div>
      </div>
    );
  }
};

export default function ComparisonChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="relative py-16 sm:py-24 bg-white overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/patterns/circuit-board.svg')] opacity-[0.03]" />
      
      <motion.div
        style={{ opacity, y }}
        className="relative z-10"
      >
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="h-[2px] w-20 bg-gold" />
            </div>
            <h2 className="font-serif text-5xl md:text-6xl text-[#1E293B] mb-6">
              The <span className="text-gold">KOS</span> Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              How we compare to other charter platforms
            </p>
          </motion.div>
        </div>

        {/* Comparison Chart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Company Headers */}
            <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-100">
              <div className="p-6 bg-[#1E293B]/5 flex items-center justify-center md:justify-start">
                <p className="font-medium text-[#1E293B] text-lg">Features</p>
              </div>
              
              {comparisonData.companies.map((company, index) => (
                <div 
                  key={company.name} 
                  className={cn(
                    "p-6 flex flex-col items-center justify-center text-center",
                    index === 0 && "bg-gold/10"
                  )}
                >
                  <div className="relative w-12 h-12 mb-3 rounded-full bg-white shadow-sm overflow-hidden">
                    {company.logo && (
                      <Image 
                        src={company.logo} 
                        alt={company.name} 
                        fill 
                        className="object-contain p-2" 
                      />
                    )}
                  </div>
                  <p className={cn(
                    "font-bold text-xl mb-1",
                    index === 0 ? "text-gold" : "text-[#1E293B]"
                  )}>
                    {company.name}
                  </p>
                  <p className="text-sm text-gray-600">{company.description}</p>
                </div>
              ))}
            </div>

            {/* Mobile View - Stacked Cards */}
            <div className="md:hidden">
              {comparisonData.companies.map((company, companyIndex) => (
                <div 
                  key={`mobile-${company.name}`}
                  className={cn(
                    "p-4 border-b border-gray-100",
                    companyIndex === 0 && "bg-gold/5"
                  )}
                >
                  <div className="flex items-center mb-4">
                    <div className="relative w-10 h-10 rounded-full bg-white shadow-sm overflow-hidden mr-3">
                      {company.logo && (
                        <Image 
                          src={company.logo} 
                          alt={company.name} 
                          fill 
                          className="object-contain p-2" 
                        />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        "font-bold",
                        companyIndex === 0 ? "text-gold" : "text-[#1E293B]"
                      )}>
                        {company.name}
                      </p>
                      <p className="text-xs text-gray-600">{company.description}</p>
                    </div>
                  </div>
                  
                  {comparisonData.categories.map((category) => (
                    <div key={`mobile-${company.name}-${category.name}`} className="mb-4">
                      <p className="font-medium text-sm text-[#1E293B] mb-2">{category.name}</p>
                      {category.features.map((feature) => (
                        <div key={`mobile-${company.name}-${feature}`} className="flex items-center py-1.5">
                          <FeatureStatus status={company.features[feature]} />
                          <p className="ml-3 text-sm text-gray-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Desktop View - Grid Layout */}
            <div className="hidden md:block">
              {/* Feature Categories and Comparisons */}
              {comparisonData.categories.map((category, categoryIndex) => (
                <div key={category.name}>
                  {/* Category Header */}
                  <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50">
                    <div className="p-4 col-span-4">
                      <p className="font-medium text-[#1E293B]">{category.name}</p>
                    </div>
                  </div>

                  {/* Features */}
                  {category.features.map((feature, featureIndex) => (
                    <div 
                      key={feature} 
                      className={cn(
                        "grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
                        featureIndex === category.features.length - 1 && categoryIndex !== comparisonData.categories.length - 1 && "border-b-2"
                      )}
                    >
                      <div className="p-4 flex items-center">
                        <p className="text-gray-700 font-medium">{feature}</p>
                      </div>
                      
                      {comparisonData.companies.map((company, companyIndex) => (
                        <div 
                          key={`${company.name}-${feature}`} 
                          className={cn(
                            "p-4 flex items-center justify-center",
                            companyIndex === 0 && "bg-gold/5"
                          )}
                        >
                          <FeatureStatus status={company.features[feature]} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-50 shadow-sm">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-amber-50 shadow-sm">
                    <Minus className="h-4 w-4 text-amber-500" />
                  </div>
                  <span>Limited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-red-50 shadow-sm">
                    <X className="h-4 w-4 text-red-500" />
                  </div>
                  <span>Not Available</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
} 