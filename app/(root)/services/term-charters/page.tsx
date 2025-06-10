import { Metadata } from 'next'
import { ServicePageTemplate } from '@/components/services'

export const metadata: Metadata = {
  title: 'Term Charter Services | KOS',
  description: 'Extended yacht and boat charters for weeks or months with premium vessels and personalized service.',
}

export default function TermChartersPage() {
  return (
    <ServicePageTemplate 
      title="Term Charters"
      subtitle="Charter Services"
      description="Experience extended time on the water with our premium term charter options for weeks or months."
      heroImage="/images/services/term-charter.png"
      secondaryImage="/images/services/term-charter2.jpg"
      features={[
        {
          title: "Extended Duration",
          description: "Flexible charter durations ranging from several weeks to multiple months to suit your travel plans."
        },
        {
          title: "Customized Itineraries",
          description: "Personalized route planning across multiple destinations with expert local knowledge and recommendations."
        },
        {
          title: "Professional Crew",
          description: "Experienced captains and crew members dedicated to your charter for the entire duration of your journey."
        },
        {
          title: "Provisioning Services",
          description: "Comprehensive food, beverage, and supplies management tailored to your preferences throughout the charter."
        },
        {
          title: "Concierge Support",
          description: "24/7 concierge assistance for onshore arrangements including reservations, activities, and special requests."
        }
      ]}
      stats={[
        { value: "100+", label: "Destinations Worldwide" },
        { value: "100%", label: "Satisfaction Guarantee" },
        { value: "600+", label: "Successful Charters" }
      ]}
      steps={[
        {
          title: "Consultation & Planning",
          description: "Understanding your travel goals, preferred destinations, and charter duration requirements."
        },
        {
          title: "Vessel Selection",
          description: "Matching you with the perfect yacht based on your group size, preferences, and itinerary needs."
        },
        {
          title: "Itinerary Design",
          description: "Creating a detailed route plan with destinations, activities, and timing customized to your interests."
        },
        {
          title: "Crew Assignment",
          description: "Selecting and briefing professional crew members who will be dedicated to your extended charter."
        },
        {
          title: "Pre-Departure Preparation",
          description: "Final provisioning, documentation, and preparations to ensure a seamless departure."
        },
        {
          title: "Ongoing Support",
          description: "24/7 concierge support throughout your charter for any changes or additional assistance needed."
        }
      ]}
      faqItems={[
        {
          question: "What is the minimum duration for a term charter?",
          answer: "Our term charters are highly flexible, allowing us to create customized itineraries of any length to suit your preferences. Whether you're looking for a short getaway or an extended journey, we can tailor the experience to meet your needs."
        },
        {
          question: "Can we change our itinerary during the charter?",
          answer: "Absolutely. One of the benefits of term charters is flexibility. Weather, preferences, or simply discovering a new destination can all be accommodated, subject to logistical and permit constraints."
        },
        {
          question: "What amenities are available on board during a term charter?",
          answer: "Our yachts are equipped with a range of amenities including Wi-Fi, entertainment systems, water sports equipment, and gourmet dining options. Specific amenities can be tailored to your preferences during the planning phase."
        },
        {
          question: "What happens if we need to cut our charter short?",
          answer: "Our term charter contracts include flexible terms for unexpected situations. We recommend travel insurance for additional peace of mind."
        }
      ]}
      ctaText="Plan Your Extended Charter"
      ctaLink="/contact?service=term-charters"
    />
  )
} 