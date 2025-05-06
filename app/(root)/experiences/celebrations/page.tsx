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
    image: "/images/experiences/sandbar.jpg",
    href: "/experiences/sand-bar",
  },
  {
    id: "term-charters",
    title: "Term Charters",
    description: "Extended voyages with premium vessels and professional crews.",
    image: "/images/experiences/term-charters.jpg",
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
    image: "/images/experiences/birthday.jpg",
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
    image: "/images/experiences/anniversary.jpg",
    features: ["Romantic setting", "Gourmet dining", "Private moments"],
    popular: false
  },
  {
    title: "Corporate Events",
    description: "Impress clients or reward your team with a corporate outing that stands out from the typical venue.",
    image: "/images/experiences/corporate.jpg",
    features: ["Meeting facilities", "Team building", "Catering options"],
    popular: false
  },
  {
    title: "Wedding Proposals",
    description: "Create the perfect moment to pop the question with a private cruise designed for romance.",
    image: "/images/experiences/proposal.jpg",
    features: ["Private setting", "Customizable experience", "Photography"],
    popular: false
  },
  {
    title: "Wedding Ceremonies",
    description: "Say 'I do' with the beautiful water as your backdrop. We can accommodate both the ceremony and reception.",
    image: "/images/experiences/wedding.jpg",
    features: ["Ceremony setup", "Reception options", "Professional coordination"],
    popular: true
  }
];

export default function CelebrationsPage() {
  return (
    <ExperienceLayout
      title="Celebrations & Special Events"
      description="Host your most important moments on the water for a truly unforgettable experience. From birthdays to weddings, we'll make your celebration extraordinary."
      heroImage="/images/experiences/celebrations-hero.jpg"
      imageOverlayColor="from-[#581c87]/70 to-[#581c87]/40"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
      buttonText="Plan Your Event"
      buttonLink="/contact"
    >
      <div className="max-w-7xl mx-auto space-y-10 px-6 font-poppins">
        {/* Modern Intro Section */}
        <section className="pt-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 md:p-12">
            <div className="flex flex-col max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-primary font-poppins">Unforgettable Celebrations on the Water</h2>
              <p className="text-gray-600 mb-8 leading-relaxed font-poppins">
                Make your special occasion truly extraordinary with a celebration on the water. 
                Our luxury vessels provide the perfect setting for birthdays, anniversaries, 
                bachelor/bachelorette parties, corporate events, and more. With stunning waterfront views 
                and professional crew, we'll help you create an event that your guests will remember for years to come.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="p-2 mr-3 text-primary">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-primary font-poppins">{benefit.title}</h3>
                      <p className="text-sm text-gray-500 font-poppins">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="pb-12">
          <div className="rounded-xl p-8 md:p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 text-primary font-poppins">Our Celebration Services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
                We provide comprehensive event services to ensure your celebration is perfect from start to finish.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div key={index} className="p-4 flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-gray-700 font-poppins">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Celebration Types Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-primary font-poppins">Celebration Types</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
              We host a wide variety of special events, each tailored to create the perfect atmosphere for your occasion.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {celebrationTypes.map((celebration, index) => (
              <div 
                key={index} 
                className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                  celebration.popular ? 'border-primary/30' : ''
                }`}
              >
                <div className="relative h-48">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <Image
                    src={celebration.image}
                    alt={celebration.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-xl font-bold text-white font-poppins">{celebration.title}</h3>
                    {celebration.popular && (
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-white/90 ml-1 font-poppins">Popular Choice</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-3 font-poppins">{celebration.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {celebration.features.map((feature, fIndex) => (
                      <span 
                        key={fIndex}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-poppins"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Planning Process Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-primary font-poppins">Planning Your Celebration</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
              Our streamlined process makes planning your special event simple and stress-free.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-6 rounded-xl border">
              <div className="bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold font-poppins">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Consultation</h3>
              <p className="text-gray-600 font-poppins">
                We begin with a consultation to understand your vision, guest count, preferred date, 
                and budget. Our event coordinators will help guide you through the available options.
              </p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-xl border">
              <div className="bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold font-poppins">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Customization</h3>
              <p className="text-gray-600 font-poppins">
                Next, we'll help you select the perfect vessel and customize all aspects of your 
                celebration, from catering and decorations to entertainment and activities.
              </p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-xl border">
              <div className="bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold font-poppins">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Celebration</h3>
              <p className="text-gray-600 font-poppins">
                On the day of your event, our professional crew will handle all the details, 
                allowing you to relax and enjoy your special celebration on the water.
              </p>
            </div>
          </div>
        </section>
        
        {/* Celebration Packages Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-primary font-poppins">Celebration Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
              Choose from our carefully crafted packages or let us create a custom solution for your event.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3 font-poppins">Intimate Gathering</h3>
              <p className="text-gray-600 mb-4 font-poppins">
                Perfect for small celebrations with your closest friends and family.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600 font-poppins">
                <li>• Up to 12 guests</li>
                <li>• 4-hour charter</li>
                <li>• Basic catering options available</li>
                <li>• Bluetooth sound system</li>
              </ul>
              <p className="font-medium font-poppins">Starting from $2,000</p>
            </div>
            
            <div className="p-6 border rounded-xl bg-primary/5 relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium font-poppins">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Premium Celebration</h3>
              <p className="text-gray-600 mb-4 font-poppins">
                Our most popular package for medium-sized events with enhanced amenities.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600 font-poppins">
                <li>• Up to 25 guests</li>
                <li>• 6-hour charter</li>
                <li>• Premium catering included</li>
                <li>• Open bar package available</li>
                <li>• Professional event coordinator</li>
              </ul>
              <p className="font-medium font-poppins">Starting from $4,500</p>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3 font-poppins">Luxury Event</h3>
              <p className="text-gray-600 mb-4 font-poppins">
                For larger celebrations where you want to impress your guests with the ultimate experience.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600 font-poppins">
                <li>• Up to 50+ guests</li>
                <li>• 8-hour charter</li>
                <li>• Gourmet catering and premium bar</li>
                <li>• Professional DJ and entertainment</li>
                <li>• Custom decorations and setup</li>
                <li>• Photography services</li>
              </ul>
              <p className="font-medium font-poppins">Starting from $8,000</p>
              <div className="mt-4">
                <Link href="/contact">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-poppins">
                    Start Planning Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4 font-poppins">
            Custom packages available for special events and larger celebrations.
          </p>
        </section>
      </div>
    </ExperienceLayout>
  );
} 