import Navigation from '@/shared/layouts/Navigation';
import PageWrapper from '@/shared/layouts/PageWrapper';
import { ReactNode } from 'react'
import Footer from '@/shared/layouts/Footer';

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
