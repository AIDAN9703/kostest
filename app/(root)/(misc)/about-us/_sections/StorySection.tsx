import React from 'react'
import Image from 'next/image'

export default function StorySection() {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
      

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content - left aligned */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                A decade of passion, a lifetime of adventure
              </h2>
              <div className="space-y-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                <p>
                  Rooted in the heart of South Florida for over a decade, Kings of the Sea originated as an idea in a living room and blossomed into reality in March 2020. Starting with a modest 24ft boat, we've steadily expanded, and today, our team is thrilled to continue providing the royal experience.
                </p>
                <p>
                  At Kosyachts, we've elevated the yachting experience, garnering love and loyalty from our cherished renters and boat owners. Our commitment to excellence is reflected in every aspect of our operations, thanks to a team of experts spanning diverse fields.
                </p>
                <p>
                  From marketplace management to mechanical engineering, certified captains to venture capital advising, our seasoned professionals ensure that your yachting experience is nothing short of royalty.
                </p>
              </div>
            </div>
          </div>

          {/* Creative image layout - right side */}
          <div className="relative order-1 lg:order-2">
            {/* Main image */}
            <div className="relative">
              <Image
                src="/images/koshero.jpg"
                alt="KOS yacht fleet"
                width={600}
                height={400}
                className="w-full h-auto rounded-2xl shadow-xl"
              />
              
              {/* Floating accent image */}
              <div className="absolute -bottom-8 -left-8 w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-white">
                <Image
                  src="/images/herooption17.jpeg"
                  alt="Yacht detail"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 