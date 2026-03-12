"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { CustomPlacesAutocomplete } from "@/shared/components/ui/custom-places-autocomplete";
import { Button } from "@/shared/components/ui/button";

export function LocationSection() {
  const form = useFormContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const value = form.watch("locationCoordinates");
  const hasCoordinates = value && typeof value.lat === 'number' && typeof value.lng === 'number';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-4 w-4" />
          Location Settings
        </CardTitle>
        <CardDescription>Where the boat is located and docked</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField control={form.control} name="locationLabel" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Location Label<span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ""} 
                placeholder="e.g., Miami Beach Marina" 
                className="h-11"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-4">
          <FormField control={form.control} name="locationCoordinates" render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Map Geolocation<span className="text-red-500">*</span></div>
                    <div className="relative z-50">
                      <CustomPlacesAutocomplete
                        onPlaceSelected={(loc) => {
                          field.onChange({ lat: loc.coordinates.lat, lng: loc.coordinates.lng });
                          setIsDropdownOpen(false);
                        }}
                        onError={() => {}}
                        placeholder="Search for marina, harbor, or other location..."
                        defaultValue=""
                        types={['establishment','geocode']}
                        isOpen={isDropdownOpen}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => setTimeout(()=>setIsDropdownOpen(false),150)}
                        className="w-full"
                        containerClassName="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Type a location name and select from the dropdown</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border">
                    {hasCoordinates ? (
                      <div className="h-full flex flex-col">
                        <div className="bg-primary/5 px-4 py-3 rounded-t-lg border-b border-primary/20 text-sm font-semibold text-primary">Location coordinates set</div>
                        <div className="p-4 grow grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Latitude:</span>
                            <div className="font-mono mt-1 bg-muted p-1 rounded border border-border text-foreground">{value.lat.toFixed(6)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Longitude:</span>
                            <div className="font-mono mt-1 bg-muted p-1 rounded border border-border text-foreground">{value.lng.toFixed(6)}</div>
                          </div>
                        </div>
                        <Button type="button" variant="destructive" size="sm" className="m-4" onClick={() => field.onChange(null)}>Clear Location</Button>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground">No location set</div>
                    )}
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )} />
        </div>
      </CardContent>
    </Card>
  );
}


