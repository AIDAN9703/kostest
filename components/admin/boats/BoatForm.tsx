"use client";

import { useRouter } from "next/navigation";
import { boatCategoryEnum } from "@/database/schema";
import { createBoat, updateBoat } from "@/lib/actions/admin/boats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Ship } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  createBoatSchema, 
  updateBoatSchema,
  type CreateBoatInput,
  type UpdateBoatInput 
} from "@/lib/validation/admin/boats";
import { 
  Form, 
  FormControl, 
  FormDescription,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ArrayField } from "@/components/admin/boats/FormHelpers";
import { PricingTiers } from "@/components/admin/boats/PricingTiers";
import { CustomPlacesAutocomplete } from "@/components/ui/custom-places-autocomplete";
import { LocationData } from "@/lib/types/types";
import { OwnerSelect } from "@/components/admin/boats/OwnerSelect";

// Define props type
interface BoatFormProps {
  boat?: CreateBoatInput; // undefined for create, populated for edit
  boatId?: string; // undefined for create, populated for edit
}

export function BoatForm({ boat, boatId }: BoatFormProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  
  // Determine whether we're creating or updating a boat
  const isCreating = !boatId;
  const formSchema = isCreating ? createBoatSchema : updateBoatSchema;
  
  // Initialize react-hook-form
  const form = useForm<CreateBoatInput | UpdateBoatInput>({
    resolver: zodResolver(formSchema),
    defaultValues: boat || {
      // Required fields with defaults
      name: "",
      category: boatCategoryEnum.enumValues[0],
      lengthFt: 0,
      capacity: 0,
      features: ["Standard features"],
      pricingTiers: [],
      
      // Boolean fields
      active: false,
      featured: false,
      crewRequired: true,
      crewIncluded: true,
      dayCharter: true,
      termCharter: false,
      instantBook: false,
      fuelIncluded: false,
      ownerId: "",
    },
  });
  
  const { formState } = form;
  const { isSubmitting } = formState;

  // Handle form submission
  async function onSubmit(data: CreateBoatInput | UpdateBoatInput) {
    try {
      if (isCreating) {
        // Creating a new boat
        await createBoat(data as CreateBoatInput);
        toast({
          title: "Success",
          description: "Boat created successfully.",
        });
        router.push('/admin/boats');
      } else {
        // Updating an existing boat
        await updateBoat(boatId!, data);
        toast({
          title: "Success",
          description: "Boat updated successfully.",
        });
        router.push(`/admin/boats/${boatId}`);
      }
      
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Failed to save boat. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to save boat. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Handle gallery image upload with proper array handling
  const handleGalleryUpload = (url: string, field: any) => {
    // Make sure we properly maintain the array of images by getting the current state
    // from the form, not the field which might be stale during multiple uploads
    const currentImages = form.getValues("galleryImages") || [];
    // Update the form with the new array including the new image
    field.onChange([...currentImages, url]);
  };

  // Render form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the boat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boat Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Enter boat name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {boatCategoryEnum.enumValues.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="displayTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Title</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Optional display title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        placeholder="Enter boat description" 
                        className="min-h-[100px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Active
                      </FormLabel>
                      <FormDescription>
                        Boat is visible and available on the platform
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Featured
                      </FormLabel>
                      <FormDescription>
                        Show in featured listings
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>Connect this boat to an owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner ID <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <OwnerSelect 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        placeholder="Search for an owner..." 
                      />
                    </FormControl>
                    <FormDescription>
                      Search by name, email or username
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* OwnerEmail removed – owner selected via ID */}
            </div>
          </CardContent>
        </Card>

        {/* Boat Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Boat Specifications</CardTitle>
            <CardDescription>Technical details about the boat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Manufacturer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Model name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="yearBuilt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Built</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ""} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                        placeholder="Year" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="lengthFt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (ft) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        placeholder="Length in feet" 
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
                    <FormLabel>Capacity <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        placeholder="Maximum passengers" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ""} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                        placeholder="Number of bathrooms" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features & Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Features & Amenities</CardTitle>
            <CardDescription>What the boat offers to guests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ArrayField
              form={form}
              name="features"
              label="Features"
              placeholder="Add a feature (e.g., GPS, Air Conditioning)"
              required={true}
              addButtonText="Add Feature"
            />
            
            <ArrayField
              form={form}
              name="safetyEquipment"
              label="Safety Equipment"
              placeholder="Add safety equipment (e.g., Life Jackets, Fire Extinguisher)"
              addButtonText="Add Equipment"
            />
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Images of the boat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="mainImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Image</FormLabel>
                  <div className="flex items-start gap-4">
                    <div className="relative w-40 h-40 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                      {field.value ? (
                        <img
                          src={field.value}
                          alt="Main boat image"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Ship className="h-10 w-10 text-gray-300" />
                      )}
                    </div>
                    
                    <ImageUpload
                      type="boat"
                      onUploadComplete={(url) => field.onChange(url)}
                      buttonText="Upload Image"
                      variant="outline"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="galleryImages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gallery Images</FormLabel>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {field.value && field.value.length > 0 ? field.value.map((image, index) => (
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
                            const newImages = [...field.value || []];
                            newImages.splice(index, 1);
                            field.onChange(newImages.length ? newImages : undefined);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )) : (
                      <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-gray-50">
                        <Ship className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  <ImageUpload
                    type="boat"
                    onUploadComplete={(url) => handleGalleryUpload(url, field)}
                    buttonText="Add Gallery Images"
                    variant="outline"
                    multiple={true}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set pricing options for this boat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Cleaning Fee only (tiers handle base pricing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cleaningFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleaning Fee ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        placeholder="Cleaning fee" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Pricing Tiers */}
            <div className="border-t border-gray-100 pt-6">
              <FormField
                control={form.control}
                name="pricingTiers"
                render={({ field }) => (
                  <FormItem>
                    <PricingTiers 
                      tiers={field.value || []} 
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Security deposit */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium mb-4">Additional Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          placeholder="Security deposit amount" 
                        />
                      </FormControl>
                      <FormDescription>
                        Refundable security deposit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where the boat is located</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="locationLabel"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Location Label</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="e.g., Miami Beach Marina" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Map Location Field */}
            <div className="space-y-5 border-t border-gray-100 pt-5 mt-4">
              <div>
                <FormLabel className="text-base font-medium">Map Location</FormLabel>
                <FormDescription className="mt-1">
                  Set the boat's exact coordinates on the map. This is used for location-based searches.
                </FormDescription>
              </div>
              
              <FormField
                control={form.control}
                name="locationCoordinates"
                render={({ field }) => {
                  // Local states
                  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
                  
                  // Get existing coordinates for display
                  const hasCoordinates = field.value && 
                    typeof field.value.lat === 'number' && 
                    typeof field.value.lng === 'number';
                  
                  // Handle when a place is selected from autocomplete
                  const handlePlaceSelected = (locationData: LocationData) => {
                    // Update form with coordinates
                    field.onChange({
                      lat: locationData.coordinates.lat,
                      lng: locationData.coordinates.lng
                    });
                    
                    setIsDropdownOpen(false);
                    
                    toast({
                      title: "Location Saved",
                      description: `Location set to: ${locationData.formatted_address}`,
                    });
                  };
                  
                  // Handle error from location component
                  const handleError = (errorMessage: string) => {
                    toast({
                      title: "Location Error",
                      description: errorMessage,
                      variant: "destructive",
                    });
                  };
                  
                  // Clear location coordinates
                  const handleClearLocation = () => {
                    field.onChange(null);
                    toast({
                      title: "Location Cleared",
                      description: "The map location has been removed",
                    });
                  };
                  
                  return (
                    <FormControl>
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Left column: Search box */}
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Search for location</div>
                          <div className="relative z-50">
                            <CustomPlacesAutocomplete
                              onPlaceSelected={handlePlaceSelected}
                              onError={handleError}
                              placeholder="Search for marina, harbor, or other location..."
                              defaultValue=""
                              types={['establishment', 'geocode']}
                              isOpen={isDropdownOpen}
                              onFocus={() => setIsDropdownOpen(true)}
                              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                              className="w-full"
                              containerClassName="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Type a location name and select from the dropdown
                            </p>
                          </div>
                        </div>
                        
                        {/* Right column: Current location display or placeholder */}
                        <div className="rounded-lg border">
                          {hasCoordinates && field.value ? (
                            <div className="h-full flex flex-col">
                              <div className="bg-green-50 px-4 py-3 rounded-t-lg border-b border-green-100">
                                <h3 className="text-sm font-semibold text-green-800 flex items-center">
                                  <svg className="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                  Location coordinates set
                                </h3>
                              </div>
                              <div className="p-4 flex-grow">
                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                  <div>
                                    <span className="text-gray-500">Latitude:</span>
                                    <div className="font-mono mt-1 bg-gray-50 p-1 rounded border border-gray-200 text-gray-800">
                                      {field.value.lat.toFixed(6)}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Longitude:</span>
                                    <div className="font-mono mt-1 bg-gray-50 p-1 rounded border border-gray-200 text-gray-800">
                                      {field.value.lng.toFixed(6)}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="w-full"
                                  onClick={handleClearLocation}
                                >
                                  Clear Location
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                              <div className="rounded-full bg-gray-100 p-3 mb-3">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <p className="text-sm">No location set</p>
                              <p className="text-xs mt-1">Use the search box to find and select a location</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Charter Options */}
        <Card>
          <CardHeader>
            <CardTitle>Charter Options</CardTitle>
            <CardDescription>Configure how this boat can be chartered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="crewRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Crew Required</FormLabel>
                      <FormDescription>This boat requires a crew to operate</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="crewIncluded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Crew Included</FormLabel>
                      <FormDescription>Crew is included in the price</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dayCharter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Day Charter</FormLabel>
                      <FormDescription>Available for day charters</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="termCharter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Term Charter</FormLabel>
                      <FormDescription>Available for term charters (multi-day)</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instantBook"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Instant Book</FormLabel>
                      <FormDescription>Allow instant booking without approval</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fuelIncluded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Fuel Included</FormLabel>
                      <FormDescription>Fuel is included in the price</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Submit buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => boatId ? router.push(`/admin/boats/${boatId}`) : router.push('/admin/boats')}
          >
            Cancel
          </Button>
          <Button className="text-white" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (boatId ? 'Update Boat' : 'Create Boat')}
          </Button>
        </div>
      </form>
    </Form>
  );
}