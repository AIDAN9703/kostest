import React from "react";
import Image from "next/image";

interface TeamMember {
  name: string;
  position: string;
  image: string;
}

/* First four = the founding leadership; everyone after runs the day-to-day. */
const LEADERSHIP: TeamMember[] = [
  {
    name: "Luke Jones",
    position: "Co-Founder & CEO",
    image: "/images/team/DSC07848.JPG",
  },
  {
    name: "Chris Klein",
    position: "COO",
    image: "/images/team/IMG_1551.jpeg",
  },
  {
    name: "Connor Motsko",
    position: "Co-Founder & Managing Director",
    image: "/images/team/DSC07834.JPG",
  },
  {
    name: "Ben Gindhart",
    position: "Co-Founder & CFO",
    image: "/images/team/DSC07867.JPG",
  },
];

const CREW: TeamMember[] = [
  {
    name: "Ben Snyder",
    position: "Director of Operations",
    image: "/images/team/IMG_2375.jpeg",
  },
  {
    name: "Alex Perez",
    position: "Director of Management",
    image: "/images/team/Screen Shot 2022-02-07 at 4.15.43 PM.png",
  },
  {
    name: "Jack Moses",
    position: "Director of Growth & Development",
    image: "/images/team/IMG_2250.jpeg",
  },
  {
    name: "Jacqueline Sadiki",
    position: "Director of Operations CT",
    image: "/images/team/jacqueline-sadiki.jpg",
  },
  {
    name: "Lindsey Robison",
    position: "Marketing Director",
    image: "/images/team/Lindsey 4.jpeg",
  },
  {
    name: "Grace Johnsen",
    position: "Marketing Specialist",
    image: "/images/team/grace-johnsen.jpeg",
  },
  {
    name: "Darcy Driscoll",
    position: "Marketing Specialist",
    image: "/images/team/darcy-driscoll.jpeg",
  },
  {
    name: "Nathalie Ann Zambarrano",
    position: "Executive Manager",
    image: "/images/team/nathalie-ann.png",
  },
  {
    name: "Sydney Alejado",
    position: "Executive Assistant",
    image: "/images/team/sydney-alejado.jpeg",
  },
  {
    name: "Vincent Avila",
    position: "Operations Assistant",
    image: "/images/team/vincent-avila.jpeg",
  },
];

/** Small-caps tier label with a trailing hairline — the site's rule language. */
function TierLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {children}
      </h3>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function TeamSection() {
  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        {/* Same statement style as the page's opening headline. */}
        <h2 className="text-4xl font-black leading-[1.08] tracking-tight text-primary sm:text-5xl">
          The people at the helm.
        </h2>

        {/* Leadership — four wide portraits */}
        <div className="mt-8 sm:mt-10">
          <TierLabel>Leadership</TierLabel>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {LEADERSHIP.map((member) => (
              <div key={member.name}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-light-main">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-[center_30%]"
                  />
                </div>
                <h4 className="mt-3 text-[15px] font-semibold leading-snug text-primary">
                  {member.name}
                </h4>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {member.position}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* The crew — denser square grid */}
        <div className="mt-12 sm:mt-16">
          <TierLabel>The crew</TierLabel>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5">
            {CREW.map((member) => (
              <div key={member.name}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-light-main">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover object-[center_30%]"
                  />
                </div>
                <h4 className="mt-2.5 text-sm font-semibold leading-snug text-primary">
                  {member.name}
                </h4>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {member.position}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
