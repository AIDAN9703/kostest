"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, Loader2, X
} from "lucide-react";
import { SearchParamsType } from "@/types/types";
import { getBoatCategories } from "@/lib/actions/boat-actions";
import { useSearchURL } from "@/hooks/useSearchURL";

// Common boat features for filtering
const BOAT_FEATURES = [
  { id: "wifi", label: "WiFi" },
  { id: "airConditioning", label: "Air Conditioning" },
  { id: "kitchen", label: "Kitchen" },
  { id: "shower", label: "Shower" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "usb", label: "USB Charging" },
  { id: "waterToys", label: "Water Toys" },
  { id: "fishingGear", label: "Fishing Gear" },
  { id: "snorkelingGear", label: "Snorkeling Gear" },
  { id: "paddleBoard", label: "Paddle Board" },
  { id: "jetSki", label: "Jet Ski" },
  { id: "bbq", label: "BBQ" },
];

// Default filter values
const DEFAULT_FILTERS = {
  date: undefined,
  priceRange: [0, 1000] as [number, number],
  lengthRange: [0, 100] as [number, number],
  yearBuilt: [1980, new Date().getFullYear()] as [number, number],
  guests: 1,
  cabins: 0,
  bathrooms: 0,
  location: "",
  category: "all",
  features: [] as string[]
};

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: SearchParamsType;
}

// Helper function to parse comma-separated or array values
const parseArrayParam = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  
  // If it's a comma-separated string, split it
  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').filter(Boolean);
  }
  
  // If it's already an array, return it
  if (Array.isArray(value)) {
    return value;
  }
  
  // Single string value
  return [value];
};

export default function FilterModal({ isOpen, onClose, initialFilters }: FilterModalProps) {
  const { searchParams, isPending, updateSearchParams, clearSearchParams } = useSearchURL();
  
  // Parse initial filter values with proper type handling
  const parseInitialValue = <T,>(key: keyof SearchParamsType, defaultValue: T): T => {
    const value = initialFilters[key];
    if (value === undefined) return defaultValue;
    
    // Next.js URLSearchParams automatically handles arrays, so we can simplify this
    return value as unknown as T;
  };
  
  const parseInitialNumberValue = (key: keyof SearchParamsType, defaultValue: number): number => {
    const stringValue = parseInitialValue(key, String(defaultValue));
    const parsed = parseInt(stringValue);
    return !isNaN(parsed) ? parsed : defaultValue;
  };
  
  // State for all filter values
  const [date, setDate] = useState<Date | undefined>(
    initialFilters.date ? new Date(parseInitialValue('date', '')) : undefined
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInitialNumberValue('minPrice', DEFAULT_FILTERS.priceRange[0]),
    parseInitialNumberValue('maxPrice', DEFAULT_FILTERS.priceRange[1])
  ]);
  const [lengthRange, setLengthRange] = useState<[number, number]>([
    parseInitialNumberValue('minLength', DEFAULT_FILTERS.lengthRange[0]),
    parseInitialNumberValue('maxLength', DEFAULT_FILTERS.lengthRange[1])
  ]);
  const [yearBuilt, setYearBuilt] = useState<[number, number]>([
    parseInitialNumberValue('minYear', DEFAULT_FILTERS.yearBuilt[0]),
    parseInitialNumberValue('maxYear', DEFAULT_FILTERS.yearBuilt[1])
  ]);
  const [guests, setGuests] = useState(parseInitialNumberValue('passengers', DEFAULT_FILTERS.guests));
  const [cabins, setCabins] = useState(parseInitialNumberValue('cabins', DEFAULT_FILTERS.cabins));
  const [bathrooms, setBathrooms] = useState(parseInitialNumberValue('bathrooms', DEFAULT_FILTERS.bathrooms));
  
  // Location state using 'near' parameter instead of 'location'
  const [location, setLocation] = useState(parseInitialValue('near', DEFAULT_FILTERS.location));
  
  // Bounding box coordinates for map view
  const [neLat, setNeLat] = useState(parseInitialNumberValue('ne_lat', 0));
  const [neLng, setNeLng] = useState(parseInitialNumberValue('ne_lng', 0));
  const [swLat, setSwLat] = useState(parseInitialNumberValue('sw_lat', 0));
  const [swLng, setSwLng] = useState(parseInitialNumberValue('sw_lng', 0));
  const [zoomLevel, setZoomLevel] = useState(parseInitialNumberValue('zoom_level', 13));
  const [mapToggle, setMapToggle] = useState(parseInitialValue('map_toggle', 'on') === 'on');
  
  // Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryValue = initialFilters.category;
    
    if (!categoryValue || categoryValue === 'all') return [];
    
    return parseArrayParam(categoryValue);
  });
  
  // Handle features array properly
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    return parseArrayParam(initialFilters.features);
  });
  
  // Categories data
  const [categories, setCategories] = useState<{category: string; count: number}[]>([]);
  
  // Fetch categories on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchCategories = async () => {
      try {
        const categoriesData = await getBoatCategories();
        if (isMounted) setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch boat categories:", error);
      }
    };
    
    fetchCategories();
    
    return () => { isMounted = false; };
  }, []);
  
  // Apply filters and update URL
  const applyFilters = useCallback(() => {
    updateSearchParams({
      date: date ? format(date, 'yyyy-MM-dd') : null,
      minPrice: priceRange[0] > DEFAULT_FILTERS.priceRange[0] ? priceRange[0] : null,
      maxPrice: priceRange[1] < DEFAULT_FILTERS.priceRange[1] ? priceRange[1] : null,
      minLength: lengthRange[0] > DEFAULT_FILTERS.lengthRange[0] ? lengthRange[0] : null,
      maxLength: lengthRange[1] < DEFAULT_FILTERS.lengthRange[1] ? lengthRange[1] : null,
      passengers: guests > DEFAULT_FILTERS.guests ? guests : null,
      cabins: cabins > DEFAULT_FILTERS.cabins ? cabins : null,
      bathrooms: bathrooms > DEFAULT_FILTERS.bathrooms ? bathrooms : null,
      minYear: yearBuilt[0] > DEFAULT_FILTERS.yearBuilt[0] ? yearBuilt[0] : null,
      maxYear: yearBuilt[1] < DEFAULT_FILTERS.yearBuilt[1] ? yearBuilt[1] : null,
      near: location || null,
      // Preserve bounding box coordinates if they exist
      ne_lat: neLat || null,
      ne_lng: neLng || null,
      sw_lat: swLat || null,
      sw_lng: swLng || null,
      zoom_level: zoomLevel || null,
      map_toggle: mapToggle,
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : null,
      features: selectedFeatures.length > 0 ? selectedFeatures.join(',') : null,
      page: 1, // Reset to first page when filters change
    });
    onClose();
  }, [
    updateSearchParams, date, priceRange, lengthRange,
    yearBuilt, guests, cabins, bathrooms, location, selectedCategories, selectedFeatures,
    neLat, neLng, swLat, swLng, zoomLevel, mapToggle, onClose
  ]);
  
  // Reset all filters but optionally preserve location/map parameters
  const resetFilters = useCallback(() => {
    setDate(undefined);
    setPriceRange(DEFAULT_FILTERS.priceRange);
    setLengthRange(DEFAULT_FILTERS.lengthRange);
    setYearBuilt(DEFAULT_FILTERS.yearBuilt);
    setGuests(DEFAULT_FILTERS.guests);
    setCabins(DEFAULT_FILTERS.cabins);
    setBathrooms(DEFAULT_FILTERS.bathrooms);
    setSelectedCategories([]);
    setSelectedFeatures(DEFAULT_FILTERS.features);
    
    // Reset filters but preserve location-related parameters
    updateSearchParams({
      // Keep only location-related parameters
      near: location || null,
      ne_lat: neLat || null,
      ne_lng: neLng || null,
      sw_lat: swLat || null,
      sw_lng: swLng || null,
      zoom_level: zoomLevel || null,
      map_toggle: mapToggle,
      // Reset all other filters
      date: null,
      minPrice: null,
      maxPrice: null,
      minLength: null,
      maxLength: null,
      passengers: null,
      cabins: null,
      bathrooms: null,
      minYear: null,
      maxYear: null,
      category: null,
      features: null,
      page: 1
    });
  }, [
    updateSearchParams, location, neLat, neLng, swLat, swLng, zoomLevel, mapToggle
  ]);
  
  // Handle feature toggle
  const toggleFeature = useCallback((featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  }, []);
  
  // Toggle category selection
  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);
  
  // Handle slider value changes with proper typing
  const handlePriceRangeChange = useCallback((value: number[]) => {
    setPriceRange([value[0], value[1]] as [number, number]);
  }, []);
  
  const handleLengthRangeChange = useCallback((value: number[]) => {
    setLengthRange([value[0], value[1]] as [number, number]);
  }, []);
  
  const handleYearBuiltChange = useCallback((value: number[]) => {
    setYearBuilt([value[0], value[1]] as [number, number]);
  }, []);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Results</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Date Picker */}
          <div>
            <h3 className="mb-2">Date</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    date && "text-[#2C3E50] font-medium"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {date ? format(date, "MMM d, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Price Range */}
          <div>
            <div className="flex justify-between mb-2">
              <h3>Price Range (per hour)</h3>
              <div className="text-sm text-gray-500">
                ${priceRange[0]} - ${priceRange[1] === 1000 ? '1000+' : priceRange[1]}
              </div>
            </div>
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              min={0}
              max={1000}
              step={50}
            />
          </div>
          
          {/* Length Range */}
          <div>
            <div className="flex justify-between mb-2">
              <h3>Boat Length (ft)</h3>
              <div className="text-sm text-gray-500">
                {lengthRange[0]} - {lengthRange[1] === 100 ? '100+' : lengthRange[1]} ft
              </div>
            </div>
            <Slider
              value={lengthRange}
              onValueChange={handleLengthRangeChange}
              min={0}
              max={100}
              step={5}
            />
          </div>
          
          {/* Year Built */}
          <div>
            <div className="flex justify-between mb-2">
              <h3>Year Built</h3>
              <div className="text-sm text-gray-500">
                {yearBuilt[0]} - {yearBuilt[1]}
              </div>
            </div>
            <Slider
              value={yearBuilt}
              onValueChange={handleYearBuiltChange}
              min={1980}
              max={new Date().getFullYear()}
              step={1}
            />
          </div>
          
          {/* Guests */}
          <div>
            <h3 className="mb-2">Guests</h3>
            <Select 
              value={guests.toString()} 
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                {[2, 4, 6, 8, 10, 12, 15, 20, 25, 30].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Cabins & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2">Cabins</h3>
              <Select 
                value={cabins.toString()} 
                onValueChange={(value) => setCabins(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="mb-2">Bathrooms</h3>
              <Select 
                value={bathrooms.toString()} 
                onValueChange={(value) => setBathrooms(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Boat Categories */}
          <div>
            <h3 className="mb-2">Boat Types</h3>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {categories.map((cat) => (
                <div 
                  key={cat.category} 
                  className="flex items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => toggleCategory(cat.category)}
                >
                  <Checkbox 
                    id={`cat-${cat.category}`} 
                    checked={selectedCategories.includes(cat.category)}
                    onCheckedChange={() => toggleCategory(cat.category)}
                    className="mr-2"
                  />
                  <label htmlFor={`cat-${cat.category}`} className="cursor-pointer w-full">
                    {cat.category.replace('_', ' ')} ({cat.count})
                  </label>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setSelectedCategories([])}
              >
                Clear selection
              </Button>
            )}
          </div>
          
          {/* Features */}
          <div>
            <h3 className="mb-2">Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {BOAT_FEATURES.map((feature) => (
                <div key={feature.id} className="flex items-center">
                  <Checkbox 
                    id={feature.id} 
                    checked={selectedFeatures.includes(feature.id)}
                    onCheckedChange={() => toggleFeature(feature.id)}
                    className="mr-2"
                  />
                  <label htmlFor={feature.id}>
                    {feature.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1"
          >
            Reset All
          </Button>
          <Button 
            onClick={applyFilters}
            className="flex-1 bg-[#1E293B] hover:bg-[#2C3E50]"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 