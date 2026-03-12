import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    isAdmin: boolean;
    // Profile extensions (set when user has captain_profile or owner_profile)
    isCaptain: boolean;
    captainStatus: string | null; // CaptainStatus enum value or null
    isOwner: boolean;
    phoneVerified: boolean;
    profileImage?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    isAdmin: boolean;
    isCaptain: boolean;
    captainStatus: string | null;
    isOwner: boolean;
    phoneNumber: string;
    phoneVerified: boolean;
    profileImage?: string;
  }
} 