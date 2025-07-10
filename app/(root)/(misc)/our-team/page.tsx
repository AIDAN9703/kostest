import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, Phone, ArrowRight, Award, Heart, Shield } from 'lucide-react'
import Image from 'next/image'

// Force static generation - this team page has no dynamic content
export const dynamic = 'force-static';

const teamMembers = [
  {
    name: "Luke Jones",
    position: "Co-Founder & CEO",
    image: "/images/team/DSC07848.JPG",
    description: "Leading the vision and strategy for exceptional yacht experiences."
},
{
    name: "Chris Klein",
    position: "Co-Founder & COO",
    image: "/images/team/IMG_1551.jpeg",

    description: "Ensuring seamless operations and outstanding customer service."
},
{
    name: "Connor Motsko",
    position: "Co-Founder & Managing Director",
    image: "/images/team/DSC07834.JPG",
    description: "Leading our operations and ensuring smooth execution of our charter services."
},
{
    name: "Ben Gindhart",
    position: "Co-Founder & CFO",
    image: "/images/team/DSC07867.JPG",
    description: "Ensuring financial stability and strategic decision-making for our charter operations."
},
{
    name: "Ben Snyder",
    image: "/images/team/IMG_2375.jpeg",
    position: "Director of Operations",
    description: "Overseeing our operations and ensuring smooth execution of our charter services."
},
{
    name: "Alex Perez",
    position: "Head of Management",
    image: "/images/team/Screen Shot 2022-02-07 at 4.15.43 PM.png",
    description: "Managing our luxury fleet to ensure peak performance."
},
{
    name: "Jack Moses",
    image: "/images/team/IMG_2250.jpeg",
    position: "Director of Growth & Development",
    description: "Driving our growth and development initiatives to expand our reach and impact."
},
{
    name: "Lindsey Robison",
    position: "Marketing Director",
    image: "/images/team/Lindsey 4.jpeg",
    description: "Creating and executing marketing strategies to grow brand presence."
},
{
    name: "Nathalie Ann Zambarrano",
    position: "Executive Assistant",
    image: "/images/team/Screenshot 2025-03-06 at 6.55.36 PM.png",
    description: "Assisting with administrative tasks and ensuring smooth operations."
 }
]

export default function OurTeamPage() {
  return (
    <div className="w-full">

      {/* Team Grid Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium text-primary mb-4">
              Our Expert Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
              Dedicated professionals committed to providing you with unparalleled service 
              and unforgettable yacht charter experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-medium text-primary mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary/70 font-medium mb-3 text-sm uppercase tracking-wide">
                    {member.position}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed font-light">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-primary mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
              These principles guide our approach to delivering world-class yacht charter experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-primary p-4 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-4">Excellence</h3>
              <p className="text-gray-600 font-light leading-relaxed text-base">
                We maintain the highest standards in every aspect of our service, 
                from yacht maintenance to customer care, ensuring each experience exceeds expectations.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary p-4 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-300">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-4">Passion</h3>
              <p className="text-gray-600 font-light leading-relaxed text-base">
                Our genuine love for the ocean and luxury yachting drives us to create 
                extraordinary, memorable experiences for every charter guest.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary p-4 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-4">Trust</h3>
              <p className="text-gray-600 font-light leading-relaxed text-base">
                We build lasting relationships through transparency, reliability, 
                and genuine care for our clients' safety and satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-medium mb-4 text-primary">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-600 mb-8 text-lg font-light max-w-2xl mx-auto">
              Our team is standing by to help you plan the perfect yacht charter experience. 
              Contact us today and let's make your maritime dreams a reality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/contact">
                <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-3 font-medium">
                  Contact Our Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="mailto:contact@kosyachts.com">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 font-medium">
                  <Mail className="mr-2 h-5 w-5" />
                  Email Us
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-600 font-light">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                <span>contact@kosyachts.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                <span>+1 (305) 521-8877</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
