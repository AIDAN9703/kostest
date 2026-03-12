/**
 * User utility functions
 */

/**
 * Default user avatar fallback component
 * 
 * Use this component as the fallback for Avatar components when no profile image is available.
 * 
 * @example
 * ```tsx
 * import { DefaultUserAvatarFallback } from "@/shared/lib/utils/user-utils";
 * 
 * <Avatar>
 *   <AvatarImage src={user.profileImage} />
 *   <DefaultUserAvatarFallback size="md" />
 * </Avatar>
 * ```
 * 
 * Available sizes: "sm" (24px), "md" (32px), "lg" (48px)
 */
export { DefaultUserAvatarFallback } from "@/shared/components/ui/default-user-avatar";

