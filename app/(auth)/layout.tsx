import { ReactNode } from "react";
import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  
  // Redirect if already authenticated
  if (session?.user) {
    redirect("/profile");
  }
  
  return (
    <main className="auth-page">
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative h-screen top-0">
          <Image 
            src="/images/boats/catamaran2.jpg" 
            alt="Luxury Yacht Experience"
            fill 
            className="object-cover object-center"
            priority
            sizes="50vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-primary/60" />
          
          {/* Branding Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
            <div className="flex items-center gap-3">
              <Image src="/icons/logo.png" alt="logo" width={50} height={50} className="drop-shadow-lg" />
              <h1 className="text-3xl font-bold font-serif">KOS Yachts</h1>
            </div>
            
            <div className="max-w-md">
              <h2 className="text-4xl font-bold mb-4 font-serif">Experience Luxury on Water</h2>
              <p className="text-xl text-white/80">
                Discover the world's finest yachts and create unforgettable memories with KOS Yachts.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 bg-white h-screen overflow-y-auto">
          <div className="flex items-center justify-center p-6 py-12 min-h-full">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Layout;