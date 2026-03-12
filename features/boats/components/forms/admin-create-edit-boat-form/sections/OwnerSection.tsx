"use client";

import { useFormContext } from "react-hook-form";
import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { OwnerSelect } from "@/features/boats/components/forms/OwnerSelectBox";

export function OwnerSection() {
  const form = useFormContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-4 w-4" />
          Owner Assignment
        </CardTitle>
        <CardDescription>Assign an owner and add internal notes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative z-10">
              <FormField control={form.control} name="ownerId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Owner <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <OwnerSelect 
                      value={field.value || ""} 
                      onChange={field.onChange}
                      placeholder="Search for an owner..." 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
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
            <FormLabel className="text-sm font-medium">Owner Notes</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                value={field.value || ""} 
                placeholder="Internal notes about the owner or boat for admin use..." 
                className="min-h-[100px] resize-none" 
              />
            </FormControl>
            <FormDescription className="text-xs text-muted-foreground">
              Internal notes about the owner or special requirements (visible only to admins)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </CardContent>
    </Card>
  );
}


