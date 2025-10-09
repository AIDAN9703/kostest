"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { OwnerSelect } from "@/features/boats/components/forms/OwnerSelectBox";

export function OwnerSection() {
  const form = useFormContext();
  return (
    <div className="p-8 border-b border-gray-200">
      <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Owner Assignment</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative z-10">
              <FormField control={form.control} name="ownerId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Owner <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <OwnerSelect 
                      value={field.value || ""} 
                      onChange={field.onChange}
                      placeholder="Search for an owner..." 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-600">
                    Search by name, email or username
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          <div />
        </div>
        
        <FormField control={form.control} name="ownerNotes" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Owner Notes</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                value={field.value || ""} 
                placeholder="Internal notes about the owner or boat for admin use..." 
                className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg resize-none transition-all" 
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-600">
              Internal notes about the owner or special requirements (visible only to admins)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </div>
  );
}


