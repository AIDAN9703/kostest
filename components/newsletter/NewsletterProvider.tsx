'use client';

import { useEffect } from 'react';
import { useNewsletterToast } from './NewsletterToast';

export default function NewsletterProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { showNewsletterToast } = useNewsletterToast();
  
  useEffect(() => {
    showNewsletterToast();
  }, []);
  
  return children;
} 