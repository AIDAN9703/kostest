import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {

    const session = await auth();

    if(session) redirect("/");
    

  return (
    <main className="auth-page">
      <div className="auth-background" />
      
      {/* Gradient Orbs */}
      <div className="auth-gradient-orb top-0 -left-4 bg-primary/30" />
      <div className="auth-gradient-orb top-0 -right-4 bg-purple-300/30 animation-delay-2000" />
      <div className="auth-gradient-orb -bottom-8 left-20 bg-pink-300/30 animation-delay-4000" />

      <div className="auth-container">
        <div className="auth-card">
          {children}
        </div>
      </div>
    </main>
  );
};

export default Layout;