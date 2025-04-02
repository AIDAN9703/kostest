import { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import ExperienceLayout from "@/components/experiences/ExperienceLayout";

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
    image: "/images/experiences/sandbar.jpg",
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

// Water sports activities
const activities = [
  {
    name: "Jet Skiing",
    description: "Experience the thrill of riding across the water at high speeds on our premium jet skis.",
    image: "/images/experiences/jetski.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Wakeboarding",
    description: "Ride the wake behind the boat while performing exciting jumps and tricks on a wakeboard.",
    image: "/images/experiences/wakeboard.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Water Skiing",
    description: "A classic water sport that provides excitement and challenge for all skill levels.",
    image: "/images/experiences/waterski.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Tubing",
    description: "Hold on tight as you're pulled behind the boat on an inflatable tube - fun for all ages!",
    image: "/images/experiences/tubing.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Paddleboarding",
    description: "Explore calm waters at your own pace on a stand-up paddleboard.",
    image: "/images/experiences/paddleboard.jpg",
    beginnerFriendly: true,
  },
  {
    name: "Snorkeling",
    description: "Discover the underwater world and marine life in crystal clear waters.",
    image: "/images/experiences/snorkel.jpg",
    beginnerFriendly: true,
  }
];

export default function WatersportsPage() {
  return (
    <ExperienceLayout
      title="Water Sports Adventures"
      description="Get your adrenaline pumping with exciting water sports activities. From jet skis to wakeboarding, there's something for everyone."
      heroImage="/images/experiences/watersports-hero.jpg"
      imageOverlayColor="from-[#0F172A]/70 to-[#0F172A]/40"
      faqs={faqs}
      relatedExperiences={relatedExperiences}
    >
      <div className="space-y-16">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-6">Thrilling Water Sports Experiences</h2>
            <p className="text-gray-600 mb-4">
              Whether you're seeking an adrenaline rush or a fun family activity, our water sports 
              charters offer something for everyone. With professional instructors and premium equipment, 
              you'll enjoy safe and exciting adventures on the water.
            </p>
            <p className="text-gray-600 mb-4">
              Our experienced captains know the best locations for each activity, ensuring optimal 
              conditions and scenery for your chosen water sports. From protected bays for beginners 
              to open water for thrill-seekers, we'll find the perfect spot.
            </p>
            <p className="text-gray-600 mb-6">
              No experience? No problem! Our patient instructors specialize in teaching newcomers 
              and helping them gain confidence on the water. Most guests are up and enjoying water 
              sports within minutes!
            </p>
            
            <h3 className="text-xl font-semibold mb-4">What's Included:</h3>
            <ul className="space-y-3">
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
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative h-[400px] md:h-auto rounded-2xl overflow-hidden">
            <Image
              src="/images/experiences/watersports-content.jpg"
              alt="Exciting water sports activities"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Activities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <div key={index} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <Image
                    src={activity.image}
                    alt={activity.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-xl font-bold text-white">{activity.name}</h3>
                    {activity.beginnerFriendly && (
                      <span className="inline-block text-xs bg-primary/90 text-white px-2 py-1 rounded-full mt-1">
                        Beginner Friendly
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Charter Options</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Half-Day Adventure (4 Hours)</h3>
              <p className="text-gray-600 mb-4">
                Perfect for trying 2-3 different water sports activities. Includes all equipment and instruction.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• Choose from any activities</li>
                <li>• Great for families</li>
                <li>• Includes basic refreshments</li>
              </ul>
              <p className="font-medium">Starting from $850</p>
            </div>
            
            <div className="p-6 border rounded-xl bg-primary/5 relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-3">Full-Day Package (8 Hours)</h3>
              <p className="text-gray-600 mb-4">
                Our comprehensive water sports experience with time to enjoy multiple activities at a relaxed pace.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• Try all available activities</li>
                <li>• Includes gourmet lunch</li>
                <li>• Visit multiple locations</li>
              </ul>
              <p className="font-medium">Starting from $1,400</p>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Private Lessons</h3>
              <p className="text-gray-600 mb-4">
                One-on-one instruction focused on a specific water sport of your choice.
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>• Personalized coaching</li>
                <li>• All skill levels</li>
                <li>• Flexible duration</li>
              </ul>
              <p className="font-medium">Starting from $200/hour</p>
            </div>
          </div>
        </div>
      </div>
    </ExperienceLayout>
  );
} 