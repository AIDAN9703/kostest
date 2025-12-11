"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ImageUpload } from "@/shared/components/ui/image-upload";
import { Loader2, Ship, GripVertical } from "lucide-react";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Checkbox } from "@/shared/components/ui/checkbox";

// Define the form schema
const boatFormSchema = z.object({
  name: z.string().min(3, "Boat name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  boatType: z.string().min(1, "Please select a boat type"),
  length: z.coerce.number().positive("Length must be a positive number"),
  capacity: z.coerce
    .number()
    .int()
    .positive("Capacity must be a positive integer"),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear(), "Year must be valid"),
  manufacturer: z.string().min(2, "Manufacturer must be at least 2 characters"),
  pricePerDay: z.coerce.number().positive("Price must be a positive number"),
  location: z.object({
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
  }),
  mainImage: z.string().url("Please upload a main image").optional(),
  galleryImages: z.array(z.string().url()).optional(),
  instantBook: z.boolean().default(false),
});

// Define the form values type
type BoatFormValues = z.infer<typeof boatFormSchema>;

// Boat types for select dropdown
const boatTypes = [
  "Sailboat",
  "Motorboat",
  "Yacht",
  "Catamaran",
  "Pontoon",
  "Fishing Boat",
  "Speedboat",
  "Houseboat",
  "Jet Ski",
  "Other",
];

interface BoatFormProps {
  userId: string;
  boat?: any; // Optional boat data for editing
}

// Simple image item component
const ImageItem = memo(
  ({
    image,
    index,
    isMain,
    onDelete,
  }: {
    image: string;
    index: number;
    isMain: boolean;
    onDelete: (index: number) => void;
  }) => {
    return (
      <div className="relative w-32 h-32 border rounded-md overflow-hidden group bg-gray-100 shrink-0">
        {/* Main Image Badge */}
        {isMain && (
          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded z-10 shadow-xs font-medium">
            Main
          </div>
        )}

        <img
          src={image}
          alt={`${isMain ? "Main" : "Gallery"} image ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
          width={128}
          height={128}
          draggable={false}
        />

        {/* Drag Handle */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-grab active:cursor-grabbing">
          <GripVertical className="h-6 w-6 text-white drop-shadow-md" />
        </div>

        {/* Delete Button */}
        <button
          type="button"
          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold z-20"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(index);
          }}
        >
          ×
        </button>
      </div>
    );
  }
);

ImageItem.displayName = "ImageItem";

export default function BoatForm({ userId, boat }: BoatFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separate state for images to avoid form re-renders
  const [images, setImages] = useState<string[]>(() => {
    if (!boat) return [];
    const allImages = [];
    if (boat.mainImage) allImages.push(boat.mainImage);
    if (boat.galleryImages?.length) allImages.push(...boat.galleryImages);
    return allImages.filter(Boolean);
  });

  // Initialize form with default values or existing boat data
  const form = useForm<BoatFormValues>({
    resolver: zodResolver(boatFormSchema),
    defaultValues: boat
      ? {
          ...boat,
          // Convert string values to numbers if needed
          length:
            typeof boat.length === "string"
              ? parseFloat(boat.length)
              : boat.length,
          capacity:
            typeof boat.capacity === "string"
              ? parseInt(boat.capacity)
              : boat.capacity,
          year: typeof boat.year === "string" ? parseInt(boat.year) : boat.year,
          pricePerDay:
            typeof boat.pricePerDay === "string"
              ? parseFloat(boat.pricePerDay)
              : boat.pricePerDay,
          instantBook: boat.instantBook ?? false,
        }
      : {
          name: "",
          description: "",
          boatType: "",
          length: undefined,
          capacity: undefined,
          year: undefined,
          manufacturer: "",
          pricePerDay: undefined,
          location: {
            city: "",
            state: "",
          },
          mainImage: "",
          galleryImages: [],
          instantBook: false,
        },
  });

  // Simple form image sync
  const updateFormImages = useCallback(
    (newImages: string[]) => {
      if (newImages.length === 0) {
        form.setValue("mainImage", "");
        form.setValue("galleryImages", []);
      } else {
        form.setValue("mainImage", newImages[0]);
        form.setValue("galleryImages", newImages.slice(1));
      }
    },
    [form]
  );

  // Simple image upload handler
  const handleImageUpload = useCallback(
    (url: string) => {
      setImages((prev) => {
        const newImages = [...prev, url];
        updateFormImages(newImages);
        return newImages;
      });
    },
    [updateFormImages]
  );

  // Simple drag end handler
  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return;

      const startIndex = result.source.index;
      const endIndex = result.destination.index;

      if (startIndex === endIndex) return;

      setImages((prev) => {
        const newImages = Array.from(prev);
        const [reorderedItem] = newImages.splice(startIndex, 1);
        newImages.splice(endIndex, 0, reorderedItem);
        updateFormImages(newImages);
        return newImages;
      });
    },
    [updateFormImages]
  );

  // Simple image delete handler

  // Handle form submission
  const onSubmit = async (data: BoatFormValues) => {
    setIsSubmitting(true);

    try {
      // Ensure form has latest image data
      updateFormImages(images);

      // Prepare the boat data
      const boatData = {
        ...data,
        ownerId: userId,
      };

      // API endpoint and method depend on whether we're creating or updating
      const endpoint = boat ? `/api/boats/${boat.id}` : "/api/boats";
      const method = boat ? "PUT" : "POST";

      // Send the request
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(boatData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save boat");
      }

      const result = await response.json();

      toast({
        title: boat ? "Boat Updated" : "Boat Created",
        description: boat
          ? "Your boat has been updated successfully."
          : "Your boat has been listed successfully.",
      });

      // Redirect to the boats list
      router.push("/profile");
      router.refresh();
    } catch (error) {
      console.error("Error saving boat:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save boat",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium border-b pb-2">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Boat Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sea Breeze" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boatType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Boat Type*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select boat type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {boatTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description*</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your boat, its features, and what makes it special..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include details about amenities, condition, and any special
                  features.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Specifications Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium border-b pb-2">Specifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Beneteau" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 2018"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (ft)*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 32"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (people)*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 8"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Location and Pricing Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium border-b pb-2">
            Location & Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="location.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Miami" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Florida" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Day ($)*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 250"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium border-b pb-2">Images</h2>
          <p className="text-sm text-gray-600">
            Upload and arrange images. The first image will be used as the main
            image.
          </p>

          <div className="space-y-4">
            {/* Proper React Beautiful DnD Implementation */}
            <div>
              <FormLabel>
                Boat Images*
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (First image becomes main image)
                </span>
              </FormLabel>
              <div className="mt-2 space-y-4">
                {/* Upload Button */}
                <ImageUpload
                  type="boat"
                  onUploadComplete={handleImageUpload}
                  buttonText={
                    images.length === 0
                      ? "Upload First Image"
                      : "Add More Images"
                  }
                  variant="outline"
                  multiple={true}
                />

                {/* Helper text */}
                <p className="text-sm text-gray-500">
                  Drag images horizontally to reorder them. The first image will
                  automatically be used as the main image displayed in listings.
                </p>

                {/* Image count */}
                {images.length > 0 && (
                  <p className="text-sm text-blue-600 font-medium">
                    {images.length} image{images.length !== 1 ? "s" : ""}{" "}
                    uploaded
                  </p>
                )}
              </div>

              {/* Show form errors for both fields */}
              {form.formState.errors.mainImage && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.mainImage.message}
                </p>
              )}
              {form.formState.errors.galleryImages && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.galleryImages.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Options */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium border-b pb-2">Booking Options</h2>

          <FormField
            control={form.control}
            name="instantBook"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Instant Booking</FormLabel>
                  <FormDescription>
                    Allow users to book your boat instantly without requiring
                    your approval for each request.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {boat ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Ship className="mr-2 h-4 w-4" />
              {boat ? "Update Boat" : "List My Boat"}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
