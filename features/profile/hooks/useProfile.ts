/**
 * Profile Hooks
 * React Query hooks for profile data management
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi, type ProfileStats } from "../profile.api";
import { type User } from "@/database/types";
import { updateUserProfile, getUserStats } from "../actions/profile-actions";
import { type ProfileFormValues } from "@/features/_validation/validations";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/shared/lib/hooks/use-toast";

/**
 * Get current user profile
 * 
 * @param initialData - Optional initial data from server component
 * @returns User profile data with loading/error states
 * 
 * @example
 * // In server component
 * const user = await userService.getUserById(session.user.id);
 * 
 * // In client component
 * const { data: profile } = useProfile({ initialData: user });
 */
export function useProfile({ initialData }: { initialData?: User } = {}) {
  return useQuery({
    queryKey: ['profile', 'current'],
    queryFn: () => profileApi.getProfile(),
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Get user statistics (bookings, loyalty points, etc.)
 * 
 * @param initialData - Optional initial stats from server component
 * @returns Profile stats with loading/error states
 * 
 * @example
 * // In server component
 * const stats = await getUserStats();
 * 
 * // In client component
 * const { data: stats } = useProfileStats({ initialData: stats });
 */
export function useProfileStats({ initialData }: { initialData?: ProfileStats } = {}) {
  return useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: async () => {
      // Server actions can be called directly from client components
      const result = await getUserStats();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return {
        totalBookings: result.totalBookings ?? 0,
        completedBookings: result.completedBookings ?? 0,
        upcomingBookings: result.upcomingBookings ?? 0,
        totalSpent: result.totalSpent ?? 0,
        loyaltyPoints: result.loyaltyPoints ?? 0,
      } as ProfileStats;
    },
    initialData,
    staleTime: 2 * 60 * 1000, // 2 minutes (stats change more frequently)
    refetchOnWindowFocus: false,
  });
}

/**
 * Update user profile mutation
 * 
 * @example
 * const updateProfile = useUpdateProfile();
 * 
 * updateProfile.mutate({
 *   firstName: "John",
 *   lastName: "Doe",
 * });
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: Partial<ProfileFormValues>) => {
      const result = await updateUserProfile(data);
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.fieldErrors) {
        // Convert field errors to a single error message
        const errorMessages = Object.entries(result.fieldErrors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('; ');
        throw new Error(errorMessages);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.refresh(); // Refresh server components
      
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });
}
