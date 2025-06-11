import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Calendar, Users, Navigation, Globe } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Water Sports Adventures | KOSyachts",
  description: "Experience thrilling water sports activities with our premium charter boats and professional guides.",
};

// Related experiences
const relatedExperiences = [
  {
    id: "fishing",
    title: "Fishing Charters",
    description: "Experience the thrill of deep-sea fishing with professional guides.",
    image: "/images/experiences/fishing.jpg",
    href: "/experiences/fishing",
  },
  {
    id: "sand-bar",
    title: "Sand Bar Excursions",
    description: "Relax and enjoy pristine sandbar locations only accessible by boat.",
    image: "/images/experiences/hauloversandbar.jpeg",
    href: "/experiences/sand-bar",
  },
];

// FAQs
const faqs = [
  {
    question: "Do I need prior experience for water sports activities?",
    answer: "No prior experience is necessary for most activities. Our experienced instructors provide full safety briefings and guidance for beginners. Some advanced activities may require basic skills."
  },
  {
    question: "What should I bring for a water sports charter?",
    answer: "We recommend bringing swimwear, towels, sunscreen, sunglasses, and a change of clothes. All specialized equipment (life jackets, wetsuits if needed, etc.) is provided."
  },
  {
    question: "Are water sports activities safe for children?",
    answer: "Yes, many activities are family-friendly and safe for children. Age requirements vary by activity, typically starting from 5-8 years old depending on the sport. Our team will help you select appropriate activities for your group."
  },
  {
    question: "What if the weather conditions are unfavorable?",
    answer: "Safety is our priority. If weather conditions are unsuitable for water sports, we'll work with you to reschedule or modify your charter. Full refunds are available if we need to cancel due to weather."
  },
  {
    question: "Can we customize our water sports package?",
    answer: "Absolutely! We can create a custom package based on your group's interests, experience levels, and preferences. Just let us know what activities you're most interested in."
  }
];

// Benefits of watersports
const benefits = [
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Variety of Activities",
    description: "Multiple thrilling watersports in a single charter"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Professional Instruction",
    description: "Expert guidance for beginners and advanced riders"
  },
  {
    icon: <Navigation className="h-6 w-6" />,
    title: "Premium Equipment",
    description: "Top-quality gear for optimal performance and safety"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Ideal Locations",
    description: "Access to the best spots for each activity"
  }
];

// Water sports activities
const activities = [
  {
    name: "Jet Skiing",
    description: "Experience the thrill of riding across the water at high speeds on our premium jet skis.",
    image: "/images/experiences/tiki.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Wakeboarding",
    description: "Ride the wake behind the boat while performing exciting jumps and tricks on a wakeboard.",
    image: "/images/experiences/tiki.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Water Skiing",
    description: "A classic water sport that provides excitement and challenge for all skill levels.",
    image: "/images/experiences/tiki.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Tubing",
    description: "Hold on tight as you're pulled behind the boat on an inflatable tube - fun for all ages!",
    image: "/images/experiences/tiki.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Paddleboarding",
    description: "Explore calm waters at your own pace on a stand-up paddleboard.",
    image: "/images/experiences/tiki.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Snorkeling",
    description: "Discover the underwater world and marine life in crystal clear waters.",
    image: "/images/experiences/tiki.jpg",
    beginnerFriendly: true,
  }
];

export default function WatersportsPage() {
  return (
    <ExperienceLayout
      title="Water Sports Adventures"
      description="Get your adrenaline pumping with exciting water sports activities. From jet skis to wakeboarding, there's something for everyone."
      heroImage="/images/experiences/tiki.jpg"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
      buttonText="Book Now"
      buttonLink="/contact"
    >
      {/* Introduction Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Water Sports</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary leading-tight">
            Thrilling Water Sports Experiences
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light leading-relaxed">
            Whether you're seeking an adrenaline rush or a fun family activity, our water sports 
            charters offer something for everyone. With professional instructors and premium equipment, 
            you'll enjoy safe and exciting adventures on the water. Our experienced captains know the best 
            locations for each activity, ensuring optimal conditions and scenery for your chosen water sports.
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
          <span className="text-primary font-medium text-sm tracking-wide uppercase">What's Included</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
            Everything You Need Included
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Our water sports charters come with everything you need for an exciting day on the water.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "Professional water sports instructors",
            "Premium water sports equipment",
            "Safety gear and instruction",
            "Towable toys and inflatables",
            "Fuel and boat operation",
            "Cooler with ice and bottled water",
            "Fresh towels and basic amenities",
            "GoPro camera rental (additional fee)"
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
              <span className="text-gray-700 font-light">{item}</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* Popular Activities Section */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-primary font-medium text-sm tracking-wide uppercase">Activities</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
            Popular Activities
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light">
            Choose from our wide range of exciting water sports activities for all skill levels.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={activity.image}
                  alt={activity.name}
                  fill
                  className="object-cover"
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

                {/* Beginner Friendly Badge */}
                {activity.beginnerFriendly && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-white text-primary text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                      Beginner Friendly
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-medium text-primary mb-3">{activity.name}</h3>
                <p className="text-gray-600 font-light leading-relaxed">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ExperienceLayout>
  );
} 