import { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";

export const metadata: Metadata = {
  title: "Careers | KOS",
  description:
    "Join the KOS team and help us deliver exceptional yacht and boating experiences. Explore career opportunities in the marine industry.",
};

// Force static generation - this careers page has no dynamic content
export const dynamic = "force-static";

const APPLY_MAILTO =
  "mailto:contact@kosyachts.com?subject=Career Application&body=Hi KOS Team,%0D%0A%0D%0AI'm interested in joining the KOS team.%0D%0A%0D%0APlease include:%0D%0A- Your name%0D%0A- Your email and phone number%0D%0A- Your experience and background%0D%0A- What type of role you're interested in%0D%0A- Why you'd like to join KOS%0D%0A- Your resume attached%0D%0A%0D%0AThank you!";

/* Where new hires actually land — derived from the "operations, sales,
   maintenance, customer service" line in the original copy. */
const ROLES = [
  {
    title: "Yacht operations",
    body: "Run the day-of: docks, schedules, turnarounds, and everything in between.",
  },
  {
    title: "Sales & charters",
    body: "Match guests to the right boat and shepherd deals from inquiry to dock.",
  },
  {
    title: "Maintenance & engineering",
    body: "Keep a working fleet in showroom shape — mechanical, electrical, cosmetic.",
  },
  {
    title: "Guest experience",
    body: "Own the details that make a charter feel effortless from first call to last line.",
  },
];

/* Careers wears the site's HERO grammar: full-bleed photo with a gold
   hairline eyebrow, then an asymmetric editorial body — a different
   skeleton from the about page, same brand voice. */
export default function CareersPage() {
  return (
    <div className="w-full">
      {/* ── Photo hero, statement bottom-left ── */}
      <section className="relative h-[62vh] min-h-[440px] w-full overflow-hidden">
        <Image
          src="/images/boats/aerial4.jpg"
          alt="KOS charters from above"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-black/10"
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-10 sm:px-8 sm:pb-14">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-linear-to-r from-gold to-transparent" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] sm:text-xs">
                Careers at Kings of the Sea
              </p>
            </div>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.4)] sm:text-5xl md:text-6xl">
              Build your career on the water.
            </h1>
          </div>
        </div>
      </section>

      {/* ── Asymmetric editorial body ── */}
      <section className="py-8 sm:py-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Why KOS
              </p>
              <p className="mt-4 text-xl font-medium leading-relaxed text-primary sm:text-2xl sm:leading-snug">
                Join a passionate team delivering exceptional yacht and boating experiences —
                and grow with us.
              </p>
            </div>
            <div className="space-y-5 text-[15px] leading-7 text-slate-600 lg:col-span-7 lg:col-start-6 sm:text-base sm:leading-8">
              <p>
                At KOS, we believe in creating an environment where talented individuals can
                thrive and make a meaningful impact in the marine industry. We&apos;re looking
                for passionate professionals who share our commitment to excellence and customer
                service.
              </p>
              <p>
                Whether you&apos;re experienced in yacht operations, sales, maintenance, or
                customer service, we have opportunities for growth and advancement. Join our team
                and be part of a company that sets the standard for excellence in yacht and boat
                services.
              </p>
            </div>
          </div>

          {/* ── Where you could fit — hairline columns ── */}
          <div className="mt-14 grid grid-cols-1 gap-y-8 sm:mt-20 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4">
            {ROLES.map((role) => (
              <div key={role.title} className="border-l border-border pl-5">
                <h3 className="text-base font-semibold text-primary">{role.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{role.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The ask — navy bar, statement left, gold CTA right ── */}
      <section className="w-full bg-primary py-14 sm:py-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-4xl">
                More than just a job.
              </h2>
              <p className="mt-3 text-[15px] font-light leading-relaxed text-white/70 sm:text-base">
                Tell us who you are and what you love doing — we&apos;ll find the fit.
              </p>
            </div>
            <div className="shrink-0 md:text-right">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-full bg-gold px-7 text-[15px] font-semibold text-dark-bg hover:bg-gold-glow"
              >
                <a href={APPLY_MAILTO}>Email your application</a>
              </Button>
              <p className="mt-3 text-xs text-white/50">
                Attach your resume — a real person reads every one.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
