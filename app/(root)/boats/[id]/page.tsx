import { getBoatById, getAllBoatIds } from "@/features/boats/actions/boat-actions";
import { notFound } from "next/navigation";
import BoatDetails from "@/features/listing/components/BoatDetails";
import { RequestBookingForm, InstantBookingForm } from "@/features/listing/components/booking-form";
import { MobileBookingBar } from "@/features/listing/components/booking-form/MobileBookingBar";
import { Boat } from "@/shared/types/types";
import { ImageGallery } from "@/features/listing/components/sub-components/ImageGallery";
import { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { boats } from "@/database/schema";
import { db } from "@/database/db";
import Link from "next/link";

// ================================
// ISR CONFIGURATION
// ================================

// Static generation with ISR - revalidate every 6 hours
// This allows for boat details updates while maintaining static performance
export const revalidate = 21600; // 6 hours

// Pre-generate pages for all boats at build time
// New boats will be generated on-demand via ISR
export async function generateStaticParams() {
  try {
    console.log('🏗️  Pre-generating static boat pages...');
    
    // Only generate featured boats at build time for Windows compatibility
    // Other boats will be generated on-demand via ISR
    const featuredBoats = await db
      .select({ id: boats.id })
      .from(boats)
      .where(and(
        eq(boats.active, true),
        eq(boats.featured, true)
      ))
      .limit(50); // Limit to max 50 to prevent Windows process issues
    
    console.log(`📊 Generating static pages for ${featuredBoats.length} featured boats`);
    
    return featuredBoats.map((boat) => ({
      id: boat.id,
    }));
  } catch (error) {
    console.error('❌ Error generating static params for boats:', error);
    // Return empty array to prevent build failure
    // Pages will still be generated on-demand via ISR
    return [];
  }
}

// ================================
// METADATA GENERATION  
// ================================

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const boat = await getBoatById(id);

    if (!boat) {
      return {
        title: 'Boat Not Found | KOS Yachts',
        description: 'The requested yacht could not be found.',
      };
    }

         // Calculate price range for meta description
     const priceRange = boat.pricingTiers && boat.pricingTiers.length > 0
       ? (() => {
           const prices = boat.pricingTiers.map(tier => tier.price);
           const minPrice = Math.min(...prices);
           const maxPrice = Math.max(...prices);
           return minPrice === maxPrice 
             ? `$${minPrice}/hour`
             : `$${minPrice}-$${maxPrice}/hour`;
         })()
       : 'Contact for pricing';

    const description = `Charter the ${boat.name}, a ${boat.lengthFt}ft ${boat.category} in ${boat.homePort}. ${priceRange}. ${boat.description?.substring(0, 100) || ''} Book your luxury yacht experience today.`;

    return {
      title: `${boat.name} - ${boat.lengthFt}ft ${boat.category} Charter | KOS Yachts`,
      description,
      keywords: [
        boat.name,
        boat.category,
        'yacht charter',
        'boat rental', 
        boat.homePort,
        'luxury yacht',
        'Miami yacht charter'
      ].join(', '),
      openGraph: {
        title: `${boat.name} - Luxury Yacht Charter`,
        description,
        images: boat.mainImage ? [
          {
            url: boat.mainImage,
            width: 1200,
            height: 630,
            alt: `${boat.name} yacht charter`,
          }
        ] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${boat.name} - Luxury Yacht Charter`,
        description,
        images: boat.mainImage ? [boat.mainImage] : [],
      },
      alternates: {
        canonical: `/boats/${boat.id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for boat:', error);
    return {
      title: 'Luxury Yacht Charter | KOS Yachts',
      description: 'Discover luxury yacht charters in Miami with KOS Yachts.',
    };
  }
}

// ================================
// PAGE COMPONENT
// ================================

interface BoatPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoatPage({ params }: BoatPageProps) {
  try {
    const { id } = await params;
    
    // Fetch boat details with caching for static generation
    const boat = await getBoatById(id);

    // Handle boat not found
    if (!boat) {
      console.log(`🔍 Boat not found: ${id}`);
      notFound();
    }

    console.log(`⚡ Rendering boat page: ${boat.name} (ID: ${id})`);

    return (
      <>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": boat.name,
              "description": boat.description,
              "image": boat.mainImage,
              "brand": {
                "@type": "Brand",
                "name": "KOS Yachts"
              },
              "category": boat.category,
                             "offers": boat.pricingTiers && boat.pricingTiers.length > 0 ? {
                 "@type": "Offer",
                 "priceRange": (() => {
                   const prices = boat.pricingTiers!.map(tier => tier.price);
                   const minPrice = Math.min(...prices);
                   const maxPrice = Math.max(...prices);
                   return `$${minPrice}-$${maxPrice}`;
                 })(),
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "url": `https://kosyachts.com/boats/${boat.id}`
              } : undefined,
              "additionalProperty": [
                {
                  "@type": "PropertyValue",
                  "name": "Length",
                  "value": `${boat.lengthFt} feet`
                },
                {
                  "@type": "PropertyValue", 
                  "name": "Capacity",
                  "value": `${boat.capacity} passengers`
                },
                {
                  "@type": "PropertyValue",
                  "name": "Home Port",
                  "value": boat.homePort
                }
              ]
            })
          }}
        />

        <main className="min-h-screen bg-white sm:pt-6 pb-16 lg:pb-0">
          {/* Full-width image gallery on mobile, constrained on desktop */}
          <div className="sm:pl-4">
            <ImageGallery 
              mainImage={boat.mainImage || ''}
              galleryImages={boat.galleryImages || []}
              alt={boat.name}
            />
          </div>

          {/* Content section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-8 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
              <div className="lg:col-span-8">
                <BoatDetails boat={boat} />
              </div>

              {/* Desktop booking form - hidden on mobile, shown on lg+ screens */}
              <aside className="lg:col-span-4 hidden md:block lg:-mt-16 xl:-mt-24 relative z-20">
                <div className="sticky top-24">
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    {boat.instantBook ? (
                      <InstantBookingForm boat={boat} />
                    ) : (
                      <RequestBookingForm boat={boat} />
                    )}
                  </div>
                  <div className="text-center text-sm text-gray-600 mt-4 px-4 py-3">
                    Don't see what you're looking for?{' '}
                    <Link href="/contact" className="text-primary hover:text-primary/80 font-medium underline">
                      Send a custom inquiry here
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* Mobile booking bar - shown on mobile, hidden on lg+ screens */}
          <div className="md:hidden">
            <MobileBookingBar boat={boat} />
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error(`❌ Error loading boat page:`, error);
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Return not found for any errors to prevent broken pages
    notFound();
  }
} 