"use client";

// Components
import { BoatFilters } from '@/features/boats/components/BoatFilters';
import { ModernBoatsTable } from "@/features/boats/components/ModernBoatsTable";
import { useQueryStates, parseAsString, parseAsInteger, parseAsBoolean } from 'nuqs';

// Hooks
import { useBoats } from "@/features/boats/hooks/useBoats";
import { useDeleteBoat } from "@/features/boats/hooks/useBoatMutations";

// Types
import { type BoatFilterInput } from '@/features/boats/boats.validation';

//-----------------------------------------------------------------------------------

export default function BoatsPage() {
  // URL-based filters with nuqs - single source of truth for all filters
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      category: parseAsString.withDefault(''),
      featured: parseAsBoolean,
      active: parseAsBoolean,
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      minLength: parseAsInteger,
      maxLength: parseAsInteger,
      minCapacity: parseAsInteger,
      maxCapacity: parseAsInteger,
      minYear: parseAsInteger,
      maxYear: parseAsInteger,
      minSleeps: parseAsInteger,
      minBathrooms: parseAsInteger,
      locationLabel: parseAsString,
      crewRequired: parseAsBoolean,
      instantBook: parseAsBoolean,
      dayCharter: parseAsBoolean,
      termCharter: parseAsBoolean,
      page: parseAsInteger.withDefault(1),
    },
    {
      // Automatically removes params from URL when set to null
      clearOnDefault: true,
    }
  );
  
  // Build clean API filters - convert null to undefined for type safety
  const apiFilters: BoatFilterInput = Object.fromEntries(
    Object.entries({ ...filters, limit: 10 })
      .map(([key, value]) => [key, value ?? undefined])
  ) as BoatFilterInput;
  
  const { data, isLoading, error } = useBoats(apiFilters);
  const deleteBoat = useDeleteBoat();

  const handleDelete = (boatId: string) => {
    if (!confirm('Are you sure you want to delete this boat? This action cannot be undone.')) return;
    deleteBoat.mutate(boatId);
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load boats. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white rounded-3xl shadow-xs border border-gray-200/70">
     
      {/* Filters */}
      <BoatFilters filters={filters} setFilters={setFilters} />

      {/* Table */}
      <ModernBoatsTable
        boats={data?.boats || []}
        pagination={{
          page: data?.page || 1,
          limit: data?.limit || 10,
          totalCount: data?.totalCount || 0,
          totalPages: data?.totalPages || 0,
        }}
        loading={isLoading}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
