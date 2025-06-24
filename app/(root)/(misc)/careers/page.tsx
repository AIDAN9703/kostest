import { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers | KOS',
  description: 'Join the KOS team and help us deliver exceptional yacht and boating experiences. Explore career opportunities in the marine industry.',
}

// Force static generation - this careers page has no dynamic content
export const dynamic = 'force-static';

export default function CareersPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[75vh] sm:h-[80vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/boats/aerial4.jpg"
            alt="Join the KOS Team"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-3xl font-poppins text-white">
              <span className="inline-block text-white text-xs font-medium mb-2 tracking-wide uppercase animate-fade-in-up drop-shadow-md">
                Join Our Team
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-4 leading-tight animate-fade-in-up [animation-delay:100ms] drop-shadow-lg">
                Build Your Career with KOS
              </h1>
              <p className="text-white/90 text-base md:text-lg mb-5 leading-relaxed animate-fade-in-up [animation-delay:200ms] font-light drop-shadow-md max-w-2xl">
                Join a passionate team dedicated to delivering exceptional yacht and boating experiences. 
                Discover opportunities to grow your career in the marine industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="text-primary font-medium text-sm tracking-wide uppercase">About KOS</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary">
              More Than Just a Job
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg font-light leading-relaxed">
              At KOS, we believe in creating an environment where talented individuals can thrive 
              and make a meaningful impact in the marine industry. We're looking for passionate 
              professionals who share our commitment to excellence and customer service.
            </p>
          </div>
          
          <div className="text-center animate-fade-in-up [animation-delay:200ms]">
            <p className="text-gray-600 mb-8 text-lg font-light leading-relaxed">
              Whether you're experienced in yacht operations, sales, maintenance, or customer service, 
              we have opportunities for growth and advancement. Join our team and be part of a company 
              that sets the standard for excellence in yacht and boat services.
            </p>
            
            <a href="mailto:contact@kosyachts.com?subject=Career Application&body=Hi KOS Team,%0D%0A%0D%0AI'm interested in joining the KOS team.%0D%0A%0D%0APlease include:%0D%0A- Your name%0D%0A- Your email and phone number%0D%0A- Your experience and background%0D%0A- What type of role you're interested in%0D%0A- Why you'd like to join KOS%0D%0A- Your resume attached%0D%0A%0D%0AThank you!">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium text-lg">
                <Mail className="mr-2 h-5 w-5" />
                Email Us Your Application
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
