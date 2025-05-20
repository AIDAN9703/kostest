import { getAllBoats } from "@/lib/actions/admin/boats";
import { boatCategoryEnum } from "@/database/schema";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpDown,
  Download,
  Edit,
  MoreHorizontal,
  PlusSquare,
  Anchor,
  Calendar,
  Clock,
  Eye,
  Flag,
  DollarSign,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DeleteBoatButton } from "@/components/admin/boats/DeleteBoatButton";
import { formatCurrency } from "@/lib/utils/general-utils";

// Helper to format dates
function formatDate(date: Date | null) {
  if (!date) return "Never";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export default async function BoatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page as string) : 1;
  const search = resolvedParams.search as string | undefined;
  const category = resolvedParams.category as typeof boatCategoryEnum.enumValues[number] | undefined;
  const featured = resolvedParams.featured
    ? resolvedParams.featured === 'true'
    : undefined;
  const active = resolvedParams.active
    ? resolvedParams.active === 'true'
    : undefined;

  const { boats, totalCount, totalPages } = await getAllBoats({
    page,
    limit: 10,
    search,
    category,
    featured,
    active
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-lg border p-4 shadow-sm">
        <div>
          <Link
            href="/admin/boats/create"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-primary/90 transition-colors"
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Add New Boat
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium">Boat</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {boats.map((boat) => (
              <tr key={boat.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                      {boat.mainImage ? (
                        <Image
                          src={boat.mainImage}
                          alt={boat.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-primary/20">
                          <Anchor className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{boat.name}</div>
                      <div className="text-xs text-gray-500">
                        {boat.make && boat.model
                          ? `${boat.make} ${boat.model}`
                          : boat.make || boat.model || "No make/model"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                    {boat.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Badge variant={boat.active ? "success" : "secondary"} className="w-fit">
                      {boat.active ? "Active" : "Inactive"}
                    </Badge>
                    {boat.featured && (
                      <Badge variant="warning" className="w-fit">
                        Featured
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center text-gray-600">
                    {boat.pricingTiers && boat.pricingTiers.length > 0 ? (
                      // Find default tier or first tier
                      (() => {
                        const defaultTier = boat.pricingTiers.find(t => t.isDefault);
                        const firstTier = boat.pricingTiers[0];
                        const tier = defaultTier || firstTier;
                        return (
                          <span>
                            {formatCurrency(tier.price)}/{tier.hours}hr
                            {tier.name && <span className="ml-1 text-xs">({tier.name})</span>}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-gray-400">No pricing</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Flag className="h-3.5 w-3.5" />
                    <span>{boat.capacity} people</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(boat.createdAt)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/boats/${boat.id}`} className="cursor-pointer flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/boats/${boat.id}/edit`} className="cursor-pointer flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DeleteBoatButton
                          boatId={boat.id}
                          boatName={boat.name}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}

            {boats.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No boats found. <Link href="/admin/boats/create" className="text-primary hover:underline">Add a new boat</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * 10, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> boats
          </div>
          <div className="flex gap-1">
            <Link
              href={`/admin/boats?page=${Math.max(1, page - 1)}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${active !== undefined ? `&active=${active}` : ''}${featured !== undefined ? `&featured=${featured}` : ''}`}
              className={`px-3 py-2 rounded-md border ${page === 1 ? 'text-gray-300 border-gray-200 pointer-events-none' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Previous
            </Link>
            <Link
              href={`/admin/boats?page=${Math.min(totalPages, page + 1)}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${active !== undefined ? `&active=${active}` : ''}${featured !== undefined ? `&featured=${featured}` : ''}`}
              className={`px-3 py-2 rounded-md border ${page === totalPages ? 'text-gray-300 border-gray-200 pointer-events-none' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 