import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { unstable_cache } from 'next/cache'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
): Promise<T> {
  return unstable_cache(
    fetchFn,
    [key],
    {
      revalidate: options.revalidate ?? 3600,
      tags: options.tags ?? [key]
    }
  )();
}
