import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface BoatListProps {
  title: string;
  boats: Boat[];
  containerClassName?: string;
}

const BoatList = ({ title, boats, containerClassName }: BoatListProps) => {
  return (
    <section className={`${containerClassName} mx-auto max-w-7xl`}>
      <h2 className="font-bebas-neue text-4xl text-light-100 mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {boats.map((boat) => (
          <div key={boat.id} className="relative overflow-hidden rounded-2xl bg-dark-300">
            <div className="relative h-64">
              <Image
                src={boat.coverUrl}
                alt={boat.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-100">
                <h3 className="text-xl font-bold text-white">{boat.title}</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Image src="/icons/verified.svg" width={20} height={20} alt="Length" />
                  <span className="text-light-100">{boat.length}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/icons/heart.svg" width={20} height={20} alt="Berths" />
                  <span className="text-light-100">{boat.features} berths</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/icons/calendar.svg" width={20} height={20} alt="Year" />
                  <span className="text-light-100">{boat.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/icons/star.svg" width={20} height={20} alt="Rating" />
                  <span className="text-light-100">{boat.rating}/5</span>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-dark-100">
                View Yacht Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BoatList;