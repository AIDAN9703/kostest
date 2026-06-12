'use client';

import { ADMIN_NAV_ITEMS } from '@/shared/lib/constants/navigation-data';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useKBar, useRegisterActions } from 'kbar';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { adminShellClassName } from '@/shared/admin/admin-shell-classes';
import { useAdminAccentTheme } from '@/shared/admin/admin-accent-theme';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    return ADMIN_NAV_ITEMS.map((navItem) => ({
      id: `${navItem.label.toLowerCase().replace(/\s+/g, '-')}-action`,
      name: navItem.label,
      keywords: navItem.label.toLowerCase(),
      section: 'Navigation',
      subtitle: `Go to ${navItem.label}`,
      perform: () => navigateTo(navItem.href)
    }));
  }, [router]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();
  useGlobalSearchActions();
  const { activeTheme } = useAdminAccentTheme();

  return (
    <>
      <KBarPortal>
        <KBarPositioner
          className={`${adminShellClassName(activeTheme)} bg-background/80 fixed inset-0 z-50 p-0 backdrop-blur-sm`}
        >
          <KBarAnimator className='bg-background text-foreground relative mt-64 w-full max-w-[600px] -translate-y-12 overflow-hidden rounded-lg border border-border shadow-lg'>
            <div className='bg-background border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-background w-full border-none px-6 py-4 text-lg outline-none focus:ring-0 focus:ring-offset-0' />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'user' | 'boat' | 'booking';
  url: string;
};

type KBarAction = {
  id: string;
  name: string;
  subtitle?: string;
  section: string;
  perform: () => void;
};

function useGlobalSearchActions() {
  const router = useRouter();
  const { searchQuery } = useKBar((state) => ({
    searchQuery: state.searchQuery
  }));
  const [actions, setActions] = useState<KBarAction[]>([]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setActions([]);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(searchQuery)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          setActions([]);
          return;
        }
        const data: { results: SearchResult[] } = await response.json();
        const searchActions = data.results.map((result) => ({
          id: `search-${result.type}-${result.id}`,
          name: result.title,
          subtitle: result.subtitle,
          section: 'Search',
          perform: () => router.push(result.url)
        }));
        setActions(searchActions);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setActions([]);
        }
      }
    };

    fetchResults();

    return () => controller.abort();
  }, [router, searchQuery]);

  useRegisterActions(actions, [actions]);
}

