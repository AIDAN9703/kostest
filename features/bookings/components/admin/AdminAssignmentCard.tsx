import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { UserCheck } from "lucide-react";

interface AdminAssignmentCardProps {
  assignedAdminId: string | null;
  assignedAdminFirstName: string | null;
  assignedAdminLastName: string | null;
  assignedAdminEmail: string | null;
}

export function AdminAssignmentCard({
  assignedAdminId,
  assignedAdminFirstName,
  assignedAdminLastName,
  assignedAdminEmail,
}: AdminAssignmentCardProps) {
  const assignedAdminName =
    assignedAdminFirstName || assignedAdminLastName
      ? `${assignedAdminFirstName || ""} ${assignedAdminLastName || ""}`.trim()
      : assignedAdminEmail || "Unknown";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Assigned Admin</CardTitle>
      </CardHeader>
      <CardContent>
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
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-500">No admin assigned</p>
            <p className="text-xs text-gray-400 mt-1">
              Edit booking to assign an admin
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
