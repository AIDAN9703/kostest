"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { UserCheck, UserX, Mail, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import {
  assignAdminToBooking,
  unassignAdminFromBooking,
  markBookingAsContacted,
} from "@/features/bookings/actions/admin-booking-actions";
import { getAdmins } from "@/features/users/actions/user-actions";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

interface Admin {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
  profileImage: string | null;
}

interface AdminAssignmentCardProps {
  bookingId: string;
  assignedAdminId: string | null;
  assignedAdminFirstName: string | null;
  assignedAdminLastName: string | null;
  assignedAdminEmail: string | null;
  contactedAt: Date | null;
}

export function AdminAssignmentCard({
  bookingId,
  assignedAdminId,
  assignedAdminFirstName,
  assignedAdminLastName,
  assignedAdminEmail,
  contactedAt,
}: AdminAssignmentCardProps) {
  const [selectedAdminId, setSelectedAdminId] = useState<string>(
    assignedAdminId || ""
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Use TanStack Query to fetch admins (shared cache with other components)
  const { data: admins = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleAssign = async () => {
    if (!selectedAdminId) {
      toast({
        title: "Error",
        description: "Please select an admin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await assignAdminToBooking(bookingId, selectedAdminId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setLoading(true);
    try {
      const result = await unassignAdminFromBooking(bookingId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setSelectedAdminId("");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unassign admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkContacted = async () => {
    setLoading(true);
    try {
      const result = await markBookingAsContacted(bookingId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as contacted",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignedAdminName =
    assignedAdminFirstName || assignedAdminLastName
      ? `${assignedAdminFirstName || ""} ${assignedAdminLastName || ""}`.trim()
      : assignedAdminEmail || "Unknown";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Admin Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assigned Admin Display */}
        {assignedAdminId ? (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
              {assignedAdminEmail ? (
                <div className="flex items-center justify-center w-full h-full bg-blue-600 text-white text-sm font-medium">
                  {assignedAdminEmail[0].toUpperCase()}
                </div>
              ) : (
                <UserCheck className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {assignedAdminName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {assignedAdminEmail}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnassign}
              disabled={loading}
              className="shrink-0"
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-500">No admin assigned</p>
          </div>
        )}

        {/* Contacted Status */}
        {contactedAt ? (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-green-900">Contacted</p>
              <p className="text-xs text-green-700">
                {format(new Date(contactedAt), "MMM d, yyyy 'at' h:mma")}
              </p>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkContacted}
            disabled={loading || !assignedAdminId}
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            Mark as Contacted
          </Button>
        )}

        {/* Assign Admin Dropdown */}
        <div className="space-y-2">
          <Select
            value={selectedAdminId}
            onValueChange={setSelectedAdminId}
            disabled={loading || loadingAdmins}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select admin to assign" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.firstName || admin.lastName
                    ? `${admin.firstName || ""} ${admin.lastName || ""}`.trim()
                    : admin.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssign}
            disabled={
              loading ||
              loadingAdmins ||
              !selectedAdminId ||
              selectedAdminId === assignedAdminId
            }
            className="w-full"
            size="sm"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {assignedAdminId ? "Reassign Admin" : "Assign Admin"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
