"use client";

import { useFormContext } from "react-hook-form";
import { boatCategoryEnum } from "@/database/schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { TextInput, NumberInput, CheckboxGroup } from "@/features-admin/boats/components/forms/FormHelpers";

export function BasicInfoSection() {
  const form = useFormContext();
  const featured = form.watch("featured");

  return (
    <div className="p-8 border-b border-gray-200">
      <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Listing Details</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextInput name="name" label="Boat Name" placeholder="Enter boat name" required />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg border-gray-200">
                    {boatCategoryEnum.enumValues.map((c) => (
                      <SelectItem 
                        key={c} 
                        value={c}
                        className="hover:bg-blue-50 focus:bg-blue-50"
                      >
                        {c.replace('_',' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TextInput name="displayTitle" label="Display Title" placeholder="Optional display title" />
          <div />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""} 
                  placeholder="Describe your boat's unique features and amenities..." 
                  className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg resize-none transition-all" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Visibility Settings</h3>
          <CheckboxGroup 
            fields={[
              { name: 'active', label: 'Active', description: 'Boat is visible and available to guests' },
              { name: 'featured', label: 'Featured', description: 'Show in featured listings and homepage' }
            ]}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          />
        </div>

        {featured && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Featured Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberInput name="featuredOrder" label="Featured Order" placeholder="1 (appears first)" />
              <NumberInput name="searchRankingScore" label="Search Ranking Score" placeholder="0.0" step="0.1" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



