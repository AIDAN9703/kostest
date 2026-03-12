import React from 'react'
import Image from 'next/image'

const teamMembers = [
  {
    name: "Luke Jones",
    position: "Co-Founder & CEO",
    image: "/images/team/DSC07848.JPG",
    description: "Leading the vision and strategy for exceptional yacht experiences."
  },
  {
    name: "Chris Klein",
    position: "COO",
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
    position: "Director of Operations",
    image: "/images/team/IMG_2375.jpeg",
    description: "Overseeing our operations and ensuring smooth execution of our charter services."
  },
  {
    name: "Alex Perez",
    position: "Director of Management",
    image: "/images/team/Screen Shot 2022-02-07 at 4.15.43 PM.png",
    description: "Managing our luxury fleet to ensure peak performance."
  },
  {
    name: "Jack Moses",
    position: "Director of Growth & Development",
    image: "/images/team/IMG_2250.jpeg",
    description: "Driving our growth and development initiatives to expand our reach and impact."
  },
  {
    name: "Jacqueline Sadiki",
    position: "Director of Operations CT",
    image: "/images/team/jacqueline-sadiki.jpg",
    description: "Overseeing operations and ensuring smooth execution of our charter services within our Connecticut branch."
  },
  {
    name: "Lindsey Robison",
    position: "Marketing Director",
    image: "/images/team/Lindsey 4.jpeg",
    description: "Creating and executing marketing strategies to grow brand presence."
  },
  {
    name: "Grace Johnsen",
    position: "Marketing Specialist",
    image: "/images/team/grace-johnsen.jpeg",
    description: "Assisting with marketing strategies and ensuring smooth execution of our marketing efforts."
  },
  {
    name: "Darcy Driscoll",
    position: "Marketing Specialist",
    image: "/images/team/darcy-driscoll.jpeg",
    description: "Assisting with marketing strategies and ensuring smooth execution of our marketing efforts."
  },
  {
    name: "Nathalie Ann Zambarrano",
    position: "Executive Manager",
    image: "/images/team/nathalie-ann.png",
    description: "Managing administrative tasks and ensuring smooth operations."
  },
  {
    name: "Sydney Alejado",
    position: "Executive Assistant",
    image: "/images/team/sydney-alejado.jpeg",
    description: "Assisting with administrative tasks and ensuring smooth operations."
  },
  {
    name: "Vincent Avila",
    position: "Operations Assistant",
    image: "/images/team/vincent-avila.jpeg",
    description: "Assisting with operations and ensuring smooth execution of our charter services."
  }
]

export default function TeamSection() {
  return (
    <section className="relative py-10 sm:py-14 md:py-20 bg-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 relative z-10">
        {/* Header - right aligned intro */}
        <div className="max-w-2xl ml-auto mb-4 sm:mb-6 md:mb-8 text-center sm:text-right">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-2 sm:mb-4">
            Meet the team behind the magic
          </h2>
          
        </div>

        {/* Team grid */}
        <div className="relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-xs border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-[center_30%]"
                  />
                </div>
                <div className="flex-1 flex flex-col p-2">
                  <h3 className="text-xs sm:text-base md:text-lg font-semibold text-primary mb-0.5 sm:mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs md:text-xs text-primary font-medium mb-1 sm:mb-2 md:mb-3 uppercase tracking-wide">
                    {member.position}
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 leading-tight sm:leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 