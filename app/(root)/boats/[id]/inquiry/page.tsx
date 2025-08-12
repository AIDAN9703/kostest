import Image from "next/image";
import Link from "next/link";
import { getBoatById } from "@/features/boats/actions/boat-actions";
import { getBoatStartingHourlyLabel } from "@/shared/utils/pricing-utils";
import BoatInquiryForm from "@/features/messaging/components/BoatInquiryForm";

interface InquiryPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoatInquiryPage({ params }: InquiryPageProps) {
  const { id } = await params;
  const boat = await getBoatById(id);

  if (!boat) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Boat not found</h1>
          <p className="text-slate-500 mt-2">Please go back and try again.</p>
        </div>
      </main>
    );
  }

  const startingHourly = getBoatStartingHourlyLabel(boat);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
          <nav className="text-sm text-slate-500">
            <ol className="flex items-center gap-1">
              <li><Link href="/" className="hover:text-slate-700">Home</Link></li>
              <li>/</li>
              <li><Link href="/boats" className="hover:text-slate-700">Boats</Link></li>
              <li>/</li>
              <li><Link href={`/boats/${boat.id}`} className="hover:text-slate-700">{boat.displayTitle || boat.name}</Link></li>
              <li>/</li>
              <li className="text-slate-700">Inquiry</li>
            </ol>
          </nav>
          <div className="mt-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">Inquiry for {boat.displayTitle || boat.name}</h1>
            <p className="text-slate-600 mt-1">
              {boat.locationLabel ? `${boat.locationLabel} · ` : ''}
              {startingHourly ? `From ${startingHourly}` : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left: Boat visual */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="aspect-[16/10] relative">
                  <Image src={boat.mainImage || "/images/boats/placeholder.jpg"} alt={boat.name} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {boat.lengthFt ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{boat.lengthFt}ft</span> : null}
                    {boat.capacity ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{boat.capacity} guests</span> : null}
                    {boat.category ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{boat.category}</span> : null}
                    {boat.crewRequired ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">Crewed</span> : null}
                    {boat.fuelIncluded ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">Fuel included</span> : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Inquiry form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800">Tell us about your charter</h2>
                <p className="text-slate-600 mt-1 mb-6">We’ll open a message with the owner and our team to finalize the details.</p>
                <BoatInquiryForm boatId={boat.id} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


