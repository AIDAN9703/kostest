import { usePathname } from "next/navigation";

/**
 * Hook to determine if a route is active
 * Handles exact matches and nested routes properly
 */
export function useActiveRoute() {
  const pathname = usePathname();

  /**
   * Check if a route is active
   * @param href - The route href to check
   * @param exact - If true, only matches exact path. If false, matches nested routes
   */
  const isActive = (href: string, exact: boolean = false): boolean => {
    if (exact) {
      return pathname === href;
    }

    // For nested routes, check if pathname starts with href
    // But ensure we don't match partial segments (e.g., /explore shouldn't match /explore-something)
    if (pathname === href) {
      return true;
    }

    // Check if pathname starts with href followed by / or ?
    // This ensures we match /explore/boats but not /explore-something
    return pathname.startsWith(href + "/") || pathname.startsWith(href + "?");
  };

  return { isActive, pathname };
}
