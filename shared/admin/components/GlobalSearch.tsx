"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/shared/lib/hooks/useDebounce";
import Image from "next/image";

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: "user" | "boat" | "booking";
  url: string;
  image?: string;
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(debouncedQuery)}`,
          {
            cache: "no-store", // Ensure fresh data in Next.js 15
          }
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data.results);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Get icon based on result type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return "👤";
      case "boat":
        return "⛵";
      case "booking":
        return "📅";
      default:
        return "📄";
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
          className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gold focus:border-gold transition-all"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-100 z-50 max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-white">
                <div className="text-xs font-bold text-primary uppercase tracking-wide">
                  Search Results
                </div>
              </div>
              {results.map((result) => (
                <Link
                  href={result.url}
                  key={`${result.type}-${result.id}`}
                  className="block px-4 py-3 hover:bg-gradient-to-r hover:from-gold/10 hover:to-white transition-all m-2 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    {result.image ? (
                      <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 border-2 border-gray-100">
                        <Image
                          src={result.image}
                          alt={result.title}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 text-white">
                        <span>{getTypeIcon(result.type)}</span>
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="font-semibold text-sm truncate text-gray-900">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-gray-600 truncate">
                          {result.subtitle}
                        </div>
                      )}
                      <div className="text-xs text-gold font-medium capitalize mt-0.5">
                        {result.type}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    router.push(`/admin/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="text-xs text-primary hover:text-primary/80 font-semibold w-full text-left"
                >
                  View all results →
                </button>
              </div>
            </>
          ) : query.length >= 2 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
