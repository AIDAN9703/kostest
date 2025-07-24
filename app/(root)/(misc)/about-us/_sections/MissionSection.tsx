import React from 'react'
import Image from 'next/image'

export default function MissionSection() {
  return (
    <section className="relative py-10 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Title intentionally left blank for custom heading elsewhere */}
        </div>
        <div className="relative flex justify-center">
          {/* Mission statement box */}
          <div className="relative bg-primary text-white rounded-2xl  px-8 py-12 sm:px-14 sm:py-16 max-w-2xl w-full overflow-hidden">
            {/* Large logo in bottom right, half visible */}
            <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-56 sm:h-56 opacity-10 pointer-events-none select-none" style={{transform: 'translate(20%, 20%)'}}>
              <Image
                src="/icons/kosupdatedlogo.webp"
                alt="KOS Logo Background"
                fill
                className="object-contain"
                draggable={false}
              />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider mb-3 text-white/80">What Drives Us</h3>
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-semibold italic leading-tight">
              "Crafting extraordinary yacht experiences that inspire, connect, and transform lives."
            </blockquote>
            <p className="mt-6 text-lg text-white/90 font-medium">
              Where every voyage becomes a story worth telling.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 