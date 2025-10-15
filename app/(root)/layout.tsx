import Navigation from "@/shared/layouts/Navigation";
import { ReactNode } from "react";
import Footer from "@/shared/layouts/Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // No session call here - will get it from parent via context

  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
