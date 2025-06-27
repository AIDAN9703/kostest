import Navigation from '@/components/navigation/Navigation';
import PageWrapper from '@/components/navigation/PageWrapper';
import { ReactNode } from 'react'
import Footer from '@/components/navigation/Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // No session call here - will get it from parent via context

  return (
    <>
      <Navigation />
      <main>
        <PageWrapper>
          {children}
        </PageWrapper>
      </main>
      <Footer />
    </>
  );
};

export default Layout;
