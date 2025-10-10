import { useQuery } from "@tanstack/react-query";
import { boatsApi } from "../boat.api";
import { type BoatFilterInput } from "@/features/boats/boat.validation";

/**
 * Fetch paginated and filtered boats list
 */
export function useBoats(filters: BoatFilterInput = {}) {
  return useQuery({
    queryKey: ['boats', 'list', filters],
    queryFn: () => boatsApi.getBoats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Fetch single boat by ID
 */
export function useBoat(id: string) {
  return useQuery({
    queryKey: ['boats', 'detail', id],
    queryFn: () => boatsApi.getBoat(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch featured boats for public display
 */
export function useFeaturedBoats() {
  return useQuery({
    queryKey: ['boats', 'featured'],
    queryFn: () => boatsApi.getFeaturedBoats(),
    staleTime: 10 * 60 * 1000, // 10 minutes - featured boats change less frequently
  });
}

