import Navigation from '@/shared/components/layout/Navigation';
import PageWrapper from '@/shared/components/layout/PageWrapper';
import { ReactNode } from 'react'
import Footer from '@/shared/components/layout/Footer';

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
