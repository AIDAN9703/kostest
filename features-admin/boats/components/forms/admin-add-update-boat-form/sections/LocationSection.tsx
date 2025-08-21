"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
    <div className="p-8 border-b border-gray-200">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Location Settings</h3>
        <FormField control={form.control} name="locationLabel" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Location Label<span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ""} 
                placeholder="e.g., Miami Beach Marina" 
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
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
                    <div className="text-sm font-medium text-gray-700">Map Geolocation<span className="text-red-500">*</span></div>
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
                      <p className="text-xs text-gray-600 mt-1">Type a location name and select from the dropdown</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200">
                    {hasCoordinates ? (
                      <div className="h-full flex flex-col">
                        <div className="bg-green-50 px-4 py-3 rounded-t-lg border-b border-green-100 text-sm font-semibold text-green-800">Location coordinates set</div>
                        <div className="p-4 flex-grow grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Latitude:</span>
                            <div className="font-mono mt-1 bg-gray-50 p-1 rounded border border-gray-200 text-gray-800">{value.lat.toFixed(6)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Longitude:</span>
                            <div className="font-mono mt-1 bg-gray-50 p-1 rounded border border-gray-200 text-gray-800">{value.lng.toFixed(6)}</div>
                          </div>
                        </div>
                        <Button type="button" variant="destructive" size="sm" className="m-4" onClick={() => field.onChange(null)}>Clear Location</Button>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-6 text-gray-500">No location set</div>
                    )}
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )} />
        </div>
      </div>
    </div>
  );
}


