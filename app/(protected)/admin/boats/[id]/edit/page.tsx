import { notFound } from "next/navigation";
import { getBoatById } from "@/features/boats/actions/boat-actions";
import {
  type CreateBoatInput,
  type PricingTierInput,
} from "@/features/boats/boat.validation";
import AdminAddUpdateBoatForm from "@/features/boats/components/forms/admin-add-update-boat-form";

interface BoatEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoatEditPage({ params }: BoatEditPageProps) {
  const resolvedParams = await params;
  const boatId = resolvedParams.id;

  const boatData = await getBoatById(boatId);

  if (!boatData) {
    notFound();
  }

  // Format pricing tiers to match form input schema
  const formattedPricingTiers: PricingTierInput[] =
    boatData.pricingTiers?.map((tier) => ({
      id: tier.id,
      hours: tier.hours,
      price: tier.price,
      name: tier.name || "",
      description: tier.description || "",
      isActive: tier.isActive,
      isDefault: tier.isDefault || false,
    })) || [];

  // Transform database boat to form input format
  const boat: CreateBoatInput = {
    // Core Information
    name: boatData.name,
    displayTitle: boatData.displayTitle || null,
    description: boatData.description || null,
    category: boatData.category!,
    active: boatData.active ?? false,
    featured: boatData.featured ?? false,
    featuredOrder: boatData.featuredOrder || null,
    searchRankingScore: boatData.searchRankingScore || null,

    // Owner Information
    ownerId: boatData.ownerId,
    ownerNotes: boatData.ownerNotes || null,

    // Boat Specifications
    make: boatData.make || null,
    model: boatData.model || null,
    yearBuilt: boatData.yearBuilt || null,
    lengthFt: boatData.lengthFt,
    capacity: boatData.capacity,
    bathrooms: boatData.bathrooms || null,
    showers: boatData.showers || null,
    sleeps: boatData.sleeps || null,
    range: boatData.range || null,

    // Features
    features: boatData.features || [],
    safetyEquipment: boatData.safetyEquipment || null,

    // Media
    mainImage: boatData.mainImage || null,
    galleryImages: boatData.galleryImages || [],
    virtualTourUrl: boatData.virtualTourUrl || null,

    // Pricing
    pricingTiers: formattedPricingTiers,
    weeklyRate: boatData.weeklyRate || null,
    monthlyRate: boatData.monthlyRate || null,
    depositAmount: boatData.depositAmount || null,
    cleaningFee: boatData.cleaningFee || null,

    // Location
    locationLabel: boatData.locationLabel || null,
    locationCoordinates: null, // TODO: Parse from geometry field if needed
    availableDestinations: boatData.availableDestinations || [],
    dockInfo: boatData.dockInfo || null,
    parkingInfo: boatData.parkingInfo || null,

    // Charter Options
    crewRequired: boatData.crewRequired ?? true,
    crewIncluded: boatData.crewIncluded ?? true,
    primaryCaptainId: boatData.primaryCaptainId || null,
    dayCharter: boatData.dayCharter ?? true,
    termCharter: boatData.termCharter ?? false,
    minimumCharterDays: boatData.minimumCharterDays || null,

    // Booking Options
    instantBook: boatData.instantBook ?? false,

    // Fuel Details
    fuelIncluded: boatData.fuelIncluded ?? false,

    // Rules & Instructions
    rules: boatData.rules || null,
    specialInstructions: boatData.specialInstructions || null,
    cancellationPolicy: boatData.cancellationPolicy || null,

    // Documentation
    registrationNumber: boatData.registrationNumber || null,
    hullId: boatData.hullId || null,
    insuranceInfo: boatData.insuranceInfo || null,
    insuranceExpiry: boatData.insuranceExpiry
      ? boatData.insuranceExpiry.toISOString()
      : null,

    // Maintenance
    lastMaintenanceDate: boatData.lastMaintenanceDate
      ? boatData.lastMaintenanceDate.toISOString()
      : null,
    nextMaintenanceDate: boatData.nextMaintenanceDate
      ? boatData.nextMaintenanceDate.toISOString()
      : null,
    maintenanceNotes: boatData.maintenanceNotes || null,
  };

  return <AdminAddUpdateBoatForm boat={boat} boatId={boatId} />;
}
