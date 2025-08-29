import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background image – replace src with your final photo */}
      <Image
        src="/images/boats/aerial4.jpg"
        alt="Aerial view of yacht at sea"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/25 to-transparent" />

      {/* Center-right content, slightly elevated */}
      <div className="absolute inset-0 z-10 flex items-center justify-start p-6 sm:p-8 md:p-12">
        <div className="translate-y-[-6%] ml-2 sm:ml-8 md:ml-16 max-w-xl text-left text-white">
          <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold drop-shadow-lg">404</div>
          <p className="mt-3 text-base sm:text-lg text-white/90">Looks like we drifted off course.</p>
          <p className="mt-1 text-sm text-white/80">Head back to safer waters while we chart the right route.</p>

          <div className="mt-6 flex justify-start gap-3">
            <Button asChild variant="outline" className="border-white/70 text-white hover:bg-white/10">
              <Link href="/boats/search">Browse boats</Link>
            </Button>
            <Button asChild className="bg-white hover:bg-white/90 text-[#1E293B]">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}


