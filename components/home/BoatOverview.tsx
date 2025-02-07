import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import BoatCover from './BoatCover';

const BoatOverview = ({
  owner,
  title,
  type,
  year,
  rating,
  length,
  features,
  description,
  coverUrl,
  videoUrl
}: Boat) => {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="font-bebas-neue text-5xl md:text-7xl text-primary">
              {title}
            </h1>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-dark-300 px-4 py-2 rounded-lg">
                  <Image src="/icons/owner.svg" width={20} height={20} alt="Owner" />
                  <span className="text-light-100">{owner}</span>
                </div>
                <div className="flex items-center gap-2 bg-dark-300 px-4 py-2 rounded-lg">
                  <Image src="/icons/year.svg" width={20} height={20} alt="Year" />
                  <span className="text-light-100">{year}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-light-100">
                <div className="flex items-center gap-1">
                  <Image src="/icons/star.svg" alt="star" width={22} height={22} />
                  <span>{rating}</span>
                </div>
                <span>•</span>
                <span>{length}m Length</span>
                <span>•</span>
                <span>{features} Features</span>
              </div>
            </div>

            <p className="text-light-100 text-lg leading-relaxed">
              {description}
            </p>

            <div className="flex gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-dark-100 px-8 py-6 text-lg">
                Book Now
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-dark-300 px-8 py-6 text-lg">
                Virtual Tour
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-square">
            <BoatCover coverUrl={coverUrl} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoatOverview;
