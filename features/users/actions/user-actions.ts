'use server';

import { userService } from "@/features/users/users.service";

export async function getBoatOwners(query: string) {
  if (!query || query.length < 2) {
    return [];
  }
  
  return await userService.getBoatOwners(query);
}

export async function getUserById(userId: string) {
  if (!userId) {
    return null;
  }
  
  return await userService.getUserById(userId);
}
