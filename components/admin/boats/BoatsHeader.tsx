import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BoatsHeaderProps {
  totalCount: number;
}

export function BoatsHeader({ totalCount }: BoatsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Boats</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your fleet of {totalCount} {totalCount === 1 ? 'boat' : 'boats'}
        </p>
      </div>
      <Button asChild>
        <Link href="/admin/boats/create">
          <Plus className="h-4 w-4 mr-2" />
          Add Boat
        </Link>
      </Button>
    </div>
  );
} 