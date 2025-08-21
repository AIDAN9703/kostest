import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBoatById } from "@/features-admin/boats/actions/boats";
import { notFound } from "next/navigation";
import { CreateBoatInput, PricingTierInput } from "@/features-admin/_validation/boats";
import AdminAddUpdateBoatForm from "@/features-admin/boats/components/forms/admin-add-update-boat-form";

interface BoatEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoatEditPage({ params }: BoatEditPageProps) {
  const resolvedParams = await params;
  const boatId = resolvedParams.id;
  
  const boatData = await getBoatById(boatId).catch(() => null);
  
  if (!boatData) {
    notFound();
  }
  
  // Convert pricing tiers to match expected form input schema
  const formattedPricingTiers: PricingTierInput[] = boatData.pricingTiers?.map(tier => ({
    id: tier.id,
    hours: tier.hours,
    price: tier.price,
    name: tier.name || "",
    description: tier.description || "",
    isActive: tier.isActive,
    isDefault: tier.isDefault || false,
  })) || [];
  
  // Transform database boat to match the form's expected format
  const boat: CreateBoatInput = {
    // Core Information
    name: boatData.name,
    displayTitle: boatData.displayTitle || null,
    description: boatData.description || null,
    category: boatData.category,
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
    locationCoordinates: boatData.locationCoordinates || null,
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
    insuranceExpiry: boatData.insuranceExpiry || null,
    
    // Maintenance
    lastMaintenanceDate: boatData.lastMaintenanceDate || null,
    nextMaintenanceDate: boatData.nextMaintenanceDate || null,
    maintenanceNotes: boatData.maintenanceNotes || null,
  };
  
  return (
    <div className="space-y-6">
      
      {/* Boat Edit Form */}
      <AdminAddUpdateBoatForm boat={boat} boatId={boatId} />
    </div>
  );
} 