import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Ship } from "lucide-react";
import Image from "next/image";
import { boats, boatPricingTiers } from "@/database/schema";

interface BoatProfileHeaderProps {
  boat: typeof boats.$inferSelect & {
    pricingTiers?: typeof boatPricingTiers.$inferSelect[];
  };
}

export function BoatProfileHeader({ boat }: BoatProfileHeaderProps) {
  // Format currency helper
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Boat Image */}
          <div className=" md:w-48 h-48 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {boat.mainImage ? (
              <Image
                src={boat.mainImage}
                alt={boat.name || ""}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Ship className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Boat Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{boat.name || "Unnamed Boat"}</h2>
                <div className="flex gap-1">
                  {boat.active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {boat.featured && (
                    <Badge variant="warning">Featured</Badge>
                  )}
                </div>
              </div>
              {boat.make && boat.model && (
                <p className="text-gray-500">
                  {boat.make} {boat.model} {boat.yearBuilt && `(${boat.yearBuilt})`}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Category</div>
                <div className="mt-1">{boat.category?.replace('_', ' ') || "Not specified"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Length</div>
                <div className="mt-1">{boat.lengthFt || "Not specified"} ft</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Capacity</div>
                <div className="mt-1">{boat.capacity || "Not specified"} people</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Home Port</div>
                <div className="mt-1">{boat.locationLabel || "Not specified"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Standard Pricing</div>
                <div className="mt-1">
                  {(() => {
                    // Determine the tier to display
                    let displayTier = null;
                    if (boat.pricingTiers && boat.pricingTiers.length > 0) {
                      displayTier = boat.pricingTiers.find(t => t.isDefault) || boat.pricingTiers[0];
                    }

                    if (displayTier) {
                      return (
                        <>
                          {formatCurrency(displayTier.price)} for {displayTier.hours}hr
                          {displayTier.name && <span className="ml-1 text-xs text-gray-500">({displayTier.name})</span>}
                          {boat.pricingTiers && boat.pricingTiers.length > 1 && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({boat.pricingTiers.length} pricing tiers)
                            </span>
                          )}
                        </>
                      );
                    } else {
                      return <span className="text-gray-400">No pricing set</span>;
                    }
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">ID</div>
                <div className="mt-1 text-sm">{boat.id}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 