"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, Ship } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the form schema
const boatFormSchema = z.object({
  name: z.string().min(3, "Boat name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  boatType: z.string().min(1, "Please select a boat type"),
  length: z.coerce.number().positive("Length must be a positive number"),
  capacity: z.coerce.number().int().positive("Capacity must be a positive integer"),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear(), "Year must be valid"),
  manufacturer: z.string().min(2, "Manufacturer must be at least 2 characters"),
  pricePerDay: z.coerce.number().positive("Price must be a positive number"),
  location: z.object({
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
  }),
  mainImage: z.string().url("Please upload a main image").optional(),
  galleryImages: z.array(z.string().url()).optional(),
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

export default function BoatForm({ userId, boat }: BoatFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(boat?.mainImage || null);
  const [galleryImages, setGalleryImages] = useState<string[]>(boat?.galleryImages || []);

  // Initialize form with default values or existing boat data
  const form = useForm<BoatFormValues>({
    resolver: zodResolver(boatFormSchema),
    defaultValues: boat ? {
      ...boat,
      // Convert string values to numbers if needed
      length: typeof boat.length === 'string' ? parseFloat(boat.length) : boat.length,
      capacity: typeof boat.capacity === 'string' ? parseInt(boat.capacity) : boat.capacity,
      year: typeof boat.year === 'string' ? parseInt(boat.year) : boat.year,
      pricePerDay: typeof boat.pricePerDay === 'string' ? parseFloat(boat.pricePerDay) : boat.pricePerDay,
    } : {
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
    },
  });

  // Handle main image upload
  const handleMainImageUpload = (imageUrl: string) => {
    setMainImage(imageUrl);
    form.setValue("mainImage", imageUrl, { 
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Handle gallery image upload
  const handleGalleryImageUpload = (imageUrl: string) => {
    const newGalleryImages = [...galleryImages, imageUrl];
    setGalleryImages(newGalleryImages);
    form.setValue("galleryImages", newGalleryImages, { 
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Handle form submission
  const onSubmit = async (data: BoatFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare the boat data
      const boatData = {
        ...data,
        ownerId: userId,
      };
      
      // API endpoint and method depend on whether we're creating or updating
      const endpoint = boat ? `/api/boats/${boat.id}` : '/api/boats';
      const method = boat ? 'PUT' : 'POST';
      
      // Send the request
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(boatData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save boat');
      }
      
      const result = await response.json();
      
      toast({
        title: boat ? "Boat Updated" : "Boat Created",
        description: boat ? "Your boat has been updated successfully." : "Your boat has been listed successfully.",
      });
      
      // Redirect to the boats list
      router.push('/profile/boats');
      router.refresh();
    } catch (error) {
      console.error('Error saving boat:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save boat",
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
          <h2 className="text-lg font-medium border-b pb-2">Basic Information</h2>
          
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
                  Include details about amenities, condition, and any special features.
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
          <h2 className="text-lg font-medium border-b pb-2">Location & Pricing</h2>
          
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
          
          <div className="space-y-4">
            <div>
              <FormLabel>Main Image*</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative w-40 h-40 border rounded-md overflow-hidden bg-gray-50">
                  {mainImage ? (
                    <img 
                      src={mainImage} 
                      alt="Main boat image" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Ship className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </div>
                
                <ImageUpload
                  type="boat"
                  onUploadComplete={handleMainImageUpload}
                  buttonText="Upload Main Image"
                  variant="outline"
                />
              </div>
              {form.formState.errors.mainImage && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.mainImage.message}
                </p>
              )}
            </div>
            
            <div>
              <FormLabel>Gallery Images</FormLabel>
              <div className="mt-2">
                <div className="flex flex-wrap gap-4 mb-4">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="relative w-32 h-32 border rounded-md overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Gallery image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        onClick={() => {
                          const newImages = galleryImages.filter((_, i) => i !== index);
                          setGalleryImages(newImages);
                          form.setValue("galleryImages", newImages);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {galleryImages.length === 0 && (
                    <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-gray-50">
                      <Ship className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>
                
                <ImageUpload
                  type="boat"
                  onUploadComplete={handleGalleryImageUpload}
                  buttonText="Add Gallery Image"
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-primary text-white" 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {boat ? 'Update Boat' : 'List Boat'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 