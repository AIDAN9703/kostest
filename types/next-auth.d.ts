import "next-auth";
import { userRoleEnum } from "@/database/schema";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    role: typeof userRoleEnum.enumValues[number];
    phoneVerified: boolean;
    profileImage?: string;
  }

  interface Session {
    user: User;
  }
} 