'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/shared/hooks/useDebounce';
import Image from 'next/image';

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'user' | 'boat' | 'booking';
  url: string;
  image?: string;
};

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search results when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(debouncedQuery)}`, {
          cache: 'no-store' // Ensure fresh data in Next.js 15
        });
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data.results);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Get icon based on result type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👤';
      case 'boat':
        return '⛵';
      case 'booking':
        return '📅';
      default:
        return '📄';
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search across all content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <>
              <div className="p-2 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-500">Search Results</div>
              </div>
              {results.map((result) => (
                <Link 
                  href={result.url} 
                  key={`${result.type}-${result.id}`}
                  className="block px-4 py-2 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    {result.image ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={result.image} alt={result.title} width={32} height={32} className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span>{getTypeIcon(result.type)}</span>
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
                      )}
                      <div className="text-xs text-gray-400 capitalize">{result.type}</div>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    router.push(`/admin/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="text-xs text-primary hover:underline w-full text-left"
                >
                  View all results
                </button>
              </div>
            </>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
} 