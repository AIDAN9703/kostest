import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Star, Calendar, Users, Navigation, Globe } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Celebrations & Special Events | KOSyachts",
  description: "Host unforgettable celebrations and special events on our luxury charter boats.",
};

// Related experiences
const relatedExperiences = [
  {
    id: "sand-bar",
    title: "Sand Bar Excursions",
    description: "Relax and enjoy pristine sandbar locations only accessible by boat.",
    image: "/images/experiences/hauloversandbar.jpeg",
    href: "/experiences/sand-bar",
  },
  {
    id: "term-charters",
    title: "Term Charters",
    description: "Extended voyages with premium vessels and professional crews.",
    image: "/images/experiences/termcharter.avif",
    href: "/experiences/term-charters",
  },
];

// FAQs
const faqs = [
  {
    question: "How many guests can I have for my celebration?",
    answer: "Our fleet can accommodate celebrations of various sizes, from intimate gatherings of 6-8 people to larger events with up to 150 guests. Capacity depends on the vessel selected and the type of event."
  },
  {
    question: "Can I bring my own food and drinks?",
    answer: "Yes, many of our charter options allow you to bring your own refreshments. We also offer catering services and bar packages if you prefer to have everything arranged for you. Our team can discuss the best options for your celebration."
  },
  {
    question: "Can I decorate the boat for my event?",
    answer: "Yes, tasteful decorations are welcome. Please discuss your decoration plans with us in advance so we can ensure they're compatible with the vessel. We can also arrange professional decoration services for your event."
  },
  {
    question: "What happens in case of bad weather?",
    answer: "We monitor weather conditions closely. If conditions are unsafe, we'll work with you to reschedule your event or provide alternatives. For smaller events, some vessels offer indoor spaces that can still make for a great celebration regardless of weather."
  },
  {
    question: "How far in advance should I book a celebration charter?",
    answer: "We recommend booking at least 2-3 months in advance for most celebrations, and 6+ months for larger events like weddings. Popular dates in peak season can book up quickly, so earlier is always better."
  }
];

// Benefits of celebration charters
const benefits = [
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Unique Venue",
    description: "Create memories in an extraordinary setting on the water"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Professional Planning",
    description: "Dedicated event coordinators to handle all details"
  },
  {
    icon: <Navigation className="h-6 w-6" />,
    title: "Custom Experiences",
    description: "Tailor every aspect to match your vision perfectly"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Premium Service",
    description: "Attentive crew ensuring flawless execution"
  }
];

// Celebration types
const celebrationTypes = [
  {
    title: "Birthdays",
    description: "Make your birthday truly memorable with a celebration on the water. Perfect for milestone birthdays or annual celebrations.",
    image: "/images/experiences/birthday.png",
    features: ["Custom cake options", "Decorations", "Photography service"],
    popular: false
  },
  {
    title: "Bachelorette Parties",
    description: "Give the bride-to-be an unforgettable day with friends on a luxury yacht or party boat.",
    image: "/images/experiences/bachelorette.jpg",
    features: ["Privacy", "Premium sound system", "Special packages"],
    popular: true
  },
  {
    title: "Anniversaries",
    description: "Celebrate your love with a romantic anniversary cruise, complete with sunset views and champagne.",
    image: "/images/experiences/sunset.jpg",
    features: ["Romantic setting", "Gourmet dining", "Private moments"],
    popular: false
  },
  {
    title: "Corporate Events",
    description: "Impress clients or reward your team with a corporate outing that stands out from the typical venue.",
    image: "/images/experiences/corporateevents.webp",
    features: ["Meeting facilities", "Team building", "Catering options"],
    popular: false
  },
  {
    title: "Wedding Proposals",
    description: "Create the perfect moment to pop the question with a private cruise designed for romance.",
    image: "/images/experiences/sunset.jpg",
    features: ["Private setting", "Customizable experience", "Photography"],
    popular: false
  },
  {
    title: "Wedding Ceremonies",
    description: "Say 'I do' with the beautiful water as your backdrop. We can accommodate both the ceremony and reception.",
    image: "/images/experiences/yachtparty.jpg",
    features: ["Ceremony setup", "Reception options", "Professional coordination"],
    popular: true
  }
];

export default function CelebrationsPage() {
  return (
    <ExperienceLayout
      title="Celebrations & Special Events"
      description="Host your most important moments on the water for a truly unforgettable experience. From birthdays to weddings, we'll make your celebration extraordinary."
      heroImage="/images/experiences/yachtparty.jpg"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
      buttonText="Plan Your Event"
      buttonLink="/contact"
    >
      {/* Introduction Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Special Events</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            Unforgettable Celebrations on the Water
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light leading-relaxed">
            Make your special occasion truly extraordinary with a celebration on the water. 
            Our luxury vessels provide the perfect setting for birthdays, anniversaries, 
            bachelor/bachelorette parties, corporate events, and more. With stunning waterfront views 
            and professional crew, we'll help you create an event that your guests will remember for years to come.
          </p>
        </div>
        
        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full text-center">
                <div className="bg-gold/10 p-4 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <div className="text-gold">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="font-medium text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's Included Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Event Services</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
            Our Celebration Services
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            We provide comprehensive event services to ensure your celebration is perfect from start to finish.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "Professional event planning assistance",
            "Flexible catering options and bar packages",
            "Entertainment and music systems",
            "Custom decoration arrangements",
            "Photography and videography services",
            "Multiple destination options",
            "Weather contingency planning",
            "Special amenities for guest(s) of honor"
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
              <span className="text-gray-700 font-light">{item}</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* Celebration Types Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Event Types</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
            Celebration Types
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            From intimate gatherings to grand celebrations, we specialize in creating memorable events for every occasion.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {celebrationTypes.map((celebration, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-lg overflow-hidden ${
                celebration.popular 
                  ? 'border-primary shadow-lg relative' 
                  : 'border-gray-100 hover:border-primary/30'
              }`}
            >
              {celebration.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-primary text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="relative h-48">
                <Image
                  src={celebration.image}
                  alt={celebration.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-medium text-primary mb-3">{celebration.title}</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-4">{celebration.description}</p>
                
                <div className="space-y-2 mb-6">
                  {celebration.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm text-gray-600 font-light">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full ${
                    celebration.popular 
                      ? 'bg-primary hover:bg-primary/90 text-white' 
                      : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                  asChild
                >
                  <Link href="/contact">
                    Plan Event
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ExperienceLayout>
  );
} 