import Navigation from '@/components/navigation/Navigation';
import PageWrapper from '@/components/navigation/PageWrapper';
import { ReactNode } from 'react'
import Footer from '@/components/navigation/Footer';
import LazyChatbot from '@/components/chatbot/LazyChatbot';

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
      <LazyChatbot />
      <Footer />
    </>
  );
};

export default Layout;
