import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Shield, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Our Services | KOS',
  description: 'Comprehensive boating and yacht services including charter management, yacht management, sales, term charters, and dock management.',
}

// Animation variants for consistency
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ duration: 0.5, delay })
}

interface ServiceCardProps {
  title: string
  description: string
  image: string
  href: string
  index: number
}

const ServiceCard = ({ title, description, image, href, index }: ServiceCardProps) => (
  <motion.div 
    className="group relative h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    initial={fadeInUp.initial}
    whileInView={fadeInUp.animate}
    transition={fadeInUp.transition(index * 0.1)}
    viewport={{ once: true }}
  >
    <Image 
      src={image} 
      alt={title}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
    <div className="absolute inset-0 flex flex-col justify-end p-8">
      <h3 className="text-2xl font-medium text-white mb-3 font-poppins">{title}</h3>
      <p className="text-white/90 mb-6 leading-relaxed">{description}</p>
      <Link href={href}>
        <Button variant="outline" className="text-white border-white/50 hover:bg-white hover:text-primary group/btn">
          Learn More
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </Link>
    </div>
  </motion.div>
)

export default function ServicesPage() {
  const services = [
    {
      title: "Charter Management",
      description: "Turn your vessel into a revenue-generating asset with our comprehensive charter management services.",
      image: "/images/herooption4.jpg",
      href: "/services/charter-management"
    },
    {
      title: "Yacht Management",
      description: "Comprehensive yacht management solutions for owners seeking peace of mind and pristine vessel condition.",
      image: "/images/herooption13.jpeg",
      href: "/services/yacht-management"
    },
    {
      title: "Sales & Purchase",
      description: "Expert guidance for buying or selling your vessel with professional representation at every step.",
      image: "/images/herooption6.png",
      href: "/services/sales"
    },
    {
      title: "Term Charters",
      description: "Experience extended time on the water with our premium term charter options for weeks or months.",
      image: "/images/heroaerial1.jpeg",
      href: "/services/term-charters"
    },
    {
      title: "Dock Management",
      description: "Professional management services for private docks, marinas, and waterfront properties.",
      image: "/images/herooption16.jpeg",
      href: "/services/dock-management"
    }
  ]
  
  return (
    <div className="w-full">
      {/* Hero Section - Matching new template style */}
      <section className="relative w-full h-[75vh] sm:h-[80vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/herooption9.png"
            alt="KOS Services"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-50" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto font-poppins text-white">
            <motion.span 
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition()}
              className="inline-block text-white/90 text-sm font-medium mb-4 tracking-wide uppercase"
            >
              Professional Marine Services
            </motion.span>
            <motion.h1 
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition(0.2)}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight"
            >
              Our Services
            </motion.h1>
            <motion.p 
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition(0.4)}
              className="text-white/90 max-w-2xl mx-auto text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed"
            >
              Comprehensive boating services tailored to enhance your maritime experience.
            </motion.p>
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition(0.6)}
            >
              <Link href="#services">
                <Button className="bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 text-white border-0 group">
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid - Enhanced Design */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={fadeInUp.initial}
            whileInView={fadeInUp.animate}
            transition={fadeInUp.transition()}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium text-sm tracking-wide uppercase">How We Can Help</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-primary font-poppins">
              Complete Service Portfolio
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              From yacht management to sales and charters, we offer a complete range of premium marine services.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {services.slice(0, 2).map((service, index) => (
              <ServiceCard 
                key={index}
                title={service.title}
                description={service.description}
                image={service.image}
                href={service.href}
                index={index}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.slice(2).map((service, index) => (
              <ServiceCard 
                key={index + 2}
                title={service.title}
                description={service.description}
                image={service.image}
                href={service.href}
                index={index + 2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose KOS - Redesigned */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={fadeInUp.initial}
              whileInView={fadeInUp.animate}
              transition={fadeInUp.transition()}
              viewport={{ once: true }}
            >
              <span className="text-primary font-medium text-sm tracking-wide uppercase">The KOS Difference</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-8 text-primary font-poppins leading-tight">
                Why Choose Our Services
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Industry Expertise",
                    description: "Our team brings decades of combined experience in the marine industry, ensuring exceptional service quality."
                  },
                  {
                    icon: Award,
                    title: "Premium Quality",
                    description: "We never compromise on quality, delivering excellence in every aspect of our service offerings."
                  },
                  {
                    icon: CheckCircle,
                    title: "Detail-Oriented",
                    description: "Our meticulous attention to detail ensures your needs are met with precision and care."
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex gap-4"
                    initial={fadeInUp.initial}
                    whileInView={fadeInUp.animate}
                    transition={fadeInUp.transition(index * 0.1)}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-r from-sky-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2 text-primary font-poppins">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl"
              initial={fadeInUp.initial}
              whileInView={fadeInUp.animate}
              transition={fadeInUp.transition(0.2)}
              viewport={{ once: true }}
            >
              <Image
                src="/images/boats/beach.jpg"
                alt="Premium yacht services"
                fill
                className="object-cover"
                quality={90}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90"></div>
        
        <motion.div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          initial={fadeInUp.initial}
          whileInView={fadeInUp.animate}
          transition={fadeInUp.transition()}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 font-poppins">Ready to Get Started?</h2>
          <p className="text-white/85 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            Contact our team today to discuss how our services can enhance your boating experience.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button variant="secondary" className="group bg-white text-primary hover:bg-gray-100">
                Contact Us Today
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
} 