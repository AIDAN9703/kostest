"use client";

import { CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { UserStatsCards } from "@/features-admin/users/components/UserStatsCards";
import { ModernUsersTable } from "@/features-admin/users/components/ModernUsersTable";
import { useState } from "react";
import { useUsers, useUserStats, useDeleteUser } from "@/features-admin/users/hooks/useUsersApi";

export default function UsersPage() {
  // TanStack Query hooks
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: stats = { totalUsers: 0, activeUsers: 0, adminUsers: 0, newUsersThisMonth: 0 }, isLoading: statsLoading } = useUserStats();
  
  // Mutations
  const deleteUserMutation = useDeleteUser();

  // Centralized error handler
  const handleError = (error: unknown, action: string) => {
    alert(`Error ${action}: ${(error as Error).message}`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      handleError(error, 'deleting user');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <CardHeader className="px-0">
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage your platform users and their permissions</CardDescription>
      </CardHeader>

      <UserStatsCards stats={stats} loading={statsLoading} />
      
      <ModernUsersTable 
        users={users} 
        loading={usersLoading}
        onDelete={handleDeleteUser}
        onUpdateField={() => {}} // FieldDropdown handles updates internally
      />
    </div>
  );
} 