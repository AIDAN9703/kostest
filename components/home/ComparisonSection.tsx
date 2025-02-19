'use client';

import React from 'react';
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

const features = [
  {
    name: "Initial Cost",
    kos: { value: "No upfront fees", included: true },
    getMyBoat: { value: "Varies by owner", included: "partial" },
    freedom: { value: "High membership fees", included: false }
  },
  {
    name: "Professional Crew",
    kos: { value: "Always included", included: true },
    getMyBoat: { value: "Optional, extra cost", included: "partial" },
    freedom: { value: "Not available", included: false }
  },
  {
    name: "Vessel Quality",
    kos: { value: "Luxury yachts only", included: true },
    getMyBoat: { value: "Varies by listing", included: "partial" },
    freedom: { value: "Basic boats", included: false }
  },
  {
    name: "Booking Process",
    kos: { value: "Instant confirmation", included: true },
    getMyBoat: { value: "Owner approval needed", included: "partial" },
    freedom: { value: "Limited availability", included: false }
  },
  {
    name: "Pricing Structure",
    kos: { value: "All-inclusive", included: true },
    getMyBoat: { value: "Hidden fees common", included: false },
    freedom: { value: "Monthly dues + fees", included: false }
  },
  {
    name: "Luxury Services",
    kos: { value: "Full VIP experience", included: true },
    getMyBoat: { value: "Not available", included: false },
    freedom: { value: "Not available", included: false }
  },
  {
    name: "Maintenance",
    kos: { value: "Professionally managed", included: true },
    getMyBoat: { value: "Owner dependent", included: "partial" },
    freedom: { value: "Basic maintenance", included: "partial" }
  },
  {
    name: "Location Access",
    kos: { value: "Premium spots only", included: true },
    getMyBoat: { value: "Varies by owner", included: "partial" },
    freedom: { value: "Limited locations", included: false }
  }
] as const;

const FeatureIcon = ({ included }: { included: boolean | "partial" }) => {
  if (included === true) {
    return (
      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
        <Check className="w-5 h-5 text-green-500 stroke-[3]" />
      </div>
    );
  }
  if (included === "partial") {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
      </div>
    );
  }
  if (included === false) {
    return (
      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
        <X className="w-5 h-5 text-red-500 stroke-[3]" />
      </div>
    );
  }
  return null;
};

export default function ComparisonSection() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bebas-neue text-5xl md:text-6xl xl:text-7xl text-primary mb-6 tracking-wide">
            The Competition
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light">
            See how we stack up against other yacht rental services
          </p>
        </motion.div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent" />
          <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-b-0">
                  <TableHead className="w-[240px] bg-gray-50/50 rounded-tl-xl">
                    <span className="text-base uppercase tracking-wider text-gray-600 font-medium">Features</span>
                  </TableHead>
                  <TableHead className="bg-primary/[0.02]">
                    <div className="flex flex-col items-start">
                      <span className="text-xl font-semibold text-primary">KOS Yachts</span>
                      <span className="text-sm text-gray-500 mt-1">Premium Service</span>
                    </div>
                  </TableHead>
                  <TableHead className="bg-gray-50/50">
                    <div className="flex flex-col items-start">
                      <span className="text-xl font-medium text-gray-700">GetMyBoat</span>
                      <span className="text-sm text-gray-500 mt-1">Peer-to-Peer</span>
                    </div>
                  </TableHead>
                  <TableHead className="bg-gray-50/50 rounded-tr-xl">
                    <div className="flex flex-col items-start">
                      <span className="text-xl font-medium text-gray-700">Freedom Boat Club</span>
                      <span className="text-sm text-gray-500 mt-1">Membership Based</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature, idx) => (
                  <TableRow 
                    key={feature.name} 
                    className="group hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <TableCell className="font-medium text-gray-900">{feature.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 transform-gpu group-hover:translate-x-1 transition-transform duration-200">
                        <FeatureIcon included={feature.kos.included} />
                        <span className="text-sm text-gray-600">{feature.kos.value}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 transform-gpu group-hover:translate-x-1 transition-transform duration-200">
                        <FeatureIcon included={feature.getMyBoat.included} />
                        <span className="text-sm text-gray-600">{feature.getMyBoat.value}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 transform-gpu group-hover:translate-x-1 transition-transform duration-200">
                        <FeatureIcon included={feature.freedom.included} />
                        <span className="text-sm text-gray-600">{feature.freedom.value}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button
            asChild
            size="lg"
            className="font-bebas-neue text-2xl px-16 py-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white rounded-full tracking-wider shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/boats">
              Experience the Difference
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 