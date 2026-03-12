import Navigation from "@/shared/components/layouts/Navigation";
import { ReactNode } from "react";
import Footer from "@/shared/components/layouts/Footer";
import { QueryProvider } from "@/shared/lib/providers/QueryProvider";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // No session call here - will get it from parent via context

  return (
    <>
      <Navigation />
      <QueryProvider>
        <main>{children}</main>
      </QueryProvider>
      <Footer />
    </>
  );
};

export default Layout;
