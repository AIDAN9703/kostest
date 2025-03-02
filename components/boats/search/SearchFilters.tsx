"use client";

import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, 
  SheetTrigger, SheetFooter, SheetClose
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, Users, MapPin, Search, 
  SlidersHorizontal, X, Loader2, DollarSign, Anchor, Ruler
} from "lucide-react";
import { SearchParamsType } from "@/types/types";
import { getBoatCategories } from "@/lib/actions/boat-actions";

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

interface SearchFiltersProps {
  initialFilters: SearchParamsType;
}

export default function SearchFilters({ initialFilters }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Parse initial filter values with proper type handling
  const parseInitialValue = <T,>(key: keyof SearchParamsType, defaultValue: T): T => {
    const value = initialFilters[key];
    if (value === undefined) return defaultValue;
    return Array.isArray(value) ? (value[0] as unknown as T) : (value as unknown as T);
  };
  
  const parseInitialNumberValue = (key: keyof SearchParamsType, defaultValue: number): number => {
    const value = initialFilters[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(Array.isArray(value) ? value[0] || `${defaultValue}` : value);
    return isNaN(parsed) ? defaultValue : parsed;
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
  const [location, setLocation] = useState(parseInitialValue('location', DEFAULT_FILTERS.location));
  
  // Update category state to handle multiple selections
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryValue = initialFilters.category;
    
    if (!categoryValue) return [];
    if (categoryValue === 'all') return [];
    
    if (Array.isArray(categoryValue)) {
      return categoryValue;
    }
    
    // If it's a comma-separated string, split it
    if (typeof categoryValue === 'string' && categoryValue.includes(',')) {
      return categoryValue.split(',').filter(Boolean);
    }
    
    // Single category as string
    return [categoryValue];
  });
  
  // For backward compatibility
  const category = selectedCategories.length === 1 ? selectedCategories[0] : 
                  selectedCategories.length > 1 ? selectedCategories.join(',') : 'all';
  
  // Handle features array properly
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    if (!initialFilters.features) return [];
    
    if (Array.isArray(initialFilters.features)) {
      return initialFilters.features;
    }
    
    // If it's a comma-separated string, split it
    if (typeof initialFilters.features === 'string' && initialFilters.features.includes(',')) {
      return initialFilters.features.split(',').filter(Boolean);
    }
    
    // Single feature as string
    return [initialFilters.features];
  });
  
  // Categories data
  const [categories, setCategories] = useState<{category: string; count: number}[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Memoize libraries array to prevent reloading
  const libraries = useMemo(() => ["places"], []);
  
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
  
  // Create a URL with the current filters
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      // Update or remove each parameter
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      
      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  // Apply filters and update URL
  const applyFilters = useCallback(() => {
    startTransition(() => {
      const queryString = createQueryString({
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
        location: location || null,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : null,
        features: selectedFeatures.length > 0 ? selectedFeatures.join(',') : null,
        page: 1, // Reset to first page when filters change
      });
      
      router.push(`${pathname}?${queryString}`);
      setIsFiltersOpen(false);
    });
  }, [
    pathname, router, createQueryString, date, priceRange, lengthRange,
    yearBuilt, guests, cabins, bathrooms, location, selectedCategories, selectedFeatures
  ]);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setDate(undefined);
    setPriceRange(DEFAULT_FILTERS.priceRange);
    setLengthRange(DEFAULT_FILTERS.lengthRange);
    setYearBuilt(DEFAULT_FILTERS.yearBuilt);
    setGuests(DEFAULT_FILTERS.guests);
    setCabins(DEFAULT_FILTERS.cabins);
    setBathrooms(DEFAULT_FILTERS.bathrooms);
    setLocation(DEFAULT_FILTERS.location);
    setSelectedCategories([]);
    setSelectedFeatures(DEFAULT_FILTERS.features);
    
    startTransition(() => {
      router.push(pathname);
    });
  }, [pathname, router]);
  
  // Count active filters
  const activeFilterCount = [
    date !== undefined,
    priceRange[0] > DEFAULT_FILTERS.priceRange[0] || priceRange[1] < DEFAULT_FILTERS.priceRange[1],
    lengthRange[0] > DEFAULT_FILTERS.lengthRange[0] || lengthRange[1] < DEFAULT_FILTERS.lengthRange[1],
    yearBuilt[0] > DEFAULT_FILTERS.yearBuilt[0] || yearBuilt[1] < DEFAULT_FILTERS.yearBuilt[1],
    guests > DEFAULT_FILTERS.guests,
    cabins > DEFAULT_FILTERS.cabins,
    bathrooms > DEFAULT_FILTERS.bathrooms,
    !!location,
    selectedCategories.length > 0,
    selectedFeatures.length > 0
  ].filter(Boolean).length;
  
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
  
  // Debounced location search handler
  const handleLocationSearch = useDebouncedCallback((value: string) => {
    setLocation(value);
  }, 300);
  
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
    <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 pt-1 px-1 hide-scrollbar">
      {/* Search Input */}
      <div className="relative w-64 sm:w-72 z-10">
        <Input
          placeholder="Search by location..."
          defaultValue={location}
          onChange={(e) => handleLocationSearch(e.target.value)}
          className="h-10 pl-9 pr-3 rounded-full border border-gray-200 hover:border-gray-300 focus:border-[#2C3E50] focus:ring-[#2C3E50] focus:ring-offset-0 w-full text-gray-800 placeholder:text-gray-500 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 px-3 rounded-full border-gray-200 hover:border-gray-300 hover:bg-white whitespace-nowrap z-10",
              "focus:border-[#2C3E50] focus:ring-[#2C3E50] focus:ring-offset-0 focus-visible:ring-0 transition-all gap-1.5 text-sm min-w-[140px]",
              date && "text-[#2C3E50] font-medium"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
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
      
      {/* Category Dropdown - Multi-select with dropdown styling */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 px-3 rounded-full border-gray-200 hover:border-gray-300 hover:bg-white z-10",
              "focus:border-[#2C3E50] focus:ring-[#2C3E50] focus:ring-offset-0 focus-visible:ring-0 transition-all w-40 text-sm",
              selectedCategories.length > 0 && "text-[#2C3E50] font-medium"
            )}
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex-1 text-left truncate">
                {selectedCategories.length === 0 
                  ? "Boat type" 
                  : selectedCategories.length === 1 
                    ? categories.find(c => c.category === selectedCategories[0])?.category.replace('_', ' ') || "Boat type"
                    : `${selectedCategories.length} types`}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 shrink-0 opacity-50">
                <path d="M2.25 4.5L6 8.25L9.75 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="center">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.category} className="flex items-center space-x-2 py-1.5 px-2 hover:bg-gray-100 rounded-md cursor-pointer"
                   onClick={() => toggleCategory(cat.category)}>
                <Checkbox 
                  id={`cat-${cat.category}`} 
                  checked={selectedCategories.includes(cat.category)}
                  onCheckedChange={() => toggleCategory(cat.category)}
                  className="data-[state=checked]:bg-[#2C3E50] data-[state=checked]:border-[#2C3E50]"
                />
                <label
                  htmlFor={`cat-${cat.category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                >
                  {cat.category.replace('_', ' ')} ({cat.count})
                </label>
              </div>
            ))}
            {selectedCategories.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-xs"
                onClick={() => setSelectedCategories([])}
              >
                Clear selection
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Guests Dropdown - Custom implementation to match other filters */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 px-3 rounded-full border-gray-200 hover:border-gray-300 hover:bg-white z-10",
              "focus:border-[#2C3E50] focus:ring-[#2C3E50] focus:ring-offset-0 focus-visible:ring-0 transition-all w-40 text-sm",
              guests > DEFAULT_FILTERS.guests && "text-[#2C3E50] font-medium"
            )}
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex-1 text-left truncate">
                {guests} {guests === 1 ? 'Guest' : 'Guests'}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 shrink-0 opacity-50">
                <path d="M2.25 4.5L6 8.25L9.75 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="center">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[1, 2, 4, 6, 8, 10, 12, 15, 20, 25, 30].map((num) => (
              <div 
                key={num} 
                className={cn(
                  "flex items-center py-1.5 px-2 hover:bg-gray-100 rounded-md cursor-pointer",
                  guests === num && "bg-gray-50"
                )}
                onClick={() => setGuests(num)}
              >
                <span className="text-sm font-medium">
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Filters Button */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 px-3 rounded-full border-gray-200 hover:border-gray-300 hover:bg-white whitespace-nowrap z-10",
              "focus:border-[#2C3E50] focus:ring-[#2C3E50] focus:ring-offset-0 focus-visible:ring-0 transition-all gap-1.5 text-sm",
              activeFilterCount > 0 && "text-[#2C3E50] font-medium"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center rounded-full bg-[#2C3E50] text-white text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-serif">Filters</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-8">
            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[#1E293B]">Price Range (per hour)</h3>
                <div className="text-sm text-gray-500">
                  ${priceRange[0]} - ${priceRange[1] === 1000 ? '1000+' : priceRange[1]}
                </div>
              </div>
              <Slider
                defaultValue={priceRange}
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                min={0}
                max={1000}
                step={50}
                className="mt-2"
              />
            </div>
            
            {/* Length Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[#1E293B]">Boat Length (ft)</h3>
                <div className="text-sm text-gray-500">
                  {lengthRange[0]} - {lengthRange[1] === 100 ? '100+' : lengthRange[1]} ft
                </div>
              </div>
              <Slider
                defaultValue={lengthRange}
                value={lengthRange}
                onValueChange={handleLengthRangeChange}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
            
            {/* Year Built */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[#1E293B]">Year Built</h3>
                <div className="text-sm text-gray-500">
                  {yearBuilt[0]} - {yearBuilt[1]}
                </div>
              </div>
              <Slider
                defaultValue={yearBuilt}
                value={yearBuilt}
                onValueChange={handleYearBuiltChange}
                min={1980}
                max={new Date().getFullYear()}
                step={1}
                className="mt-2"
              />
            </div>
            
            {/* Cabins & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-[#1E293B]">Cabins</h3>
                <Select 
                  value={cabins.toString()} 
                  onValueChange={(value) => setCabins(parseInt(value))}
                >
                  <SelectTrigger className="h-10">
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
              <div className="space-y-2">
                <h3 className="font-medium text-[#1E293B]">Bathrooms</h3>
                <Select 
                  value={bathrooms.toString()} 
                  onValueChange={(value) => setBathrooms(parseInt(value))}
                >
                  <SelectTrigger className="h-10">
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
            
            {/* Features */}
            <div className="space-y-4">
              <h3 className="font-medium text-[#1E293B]">Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {BOAT_FEATURES.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={feature.id} 
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                    <label
                      htmlFor={feature.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <SheetFooter className="mt-8 flex flex-row gap-4 sm:justify-between">
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
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Filters'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Search Button */}
      <Button 
        onClick={applyFilters}
        className={cn(
          "h-10 px-4 rounded-full bg-[#1E293B] hover:bg-[#2C3E50] gap-1.5 text-white text-sm whitespace-nowrap z-10",
          "focus:ring-[#2C3E50] focus:ring-offset-0 focus-visible:ring-0"
        )}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
        ) : (
          <Search className="h-3.5 w-3.5" />
        )}
        Search
      </Button>
      
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          onClick={resetFilters}
          className={cn(
            "h-10 px-3 text-gray-500 hover:text-gray-700 gap-1.5 text-sm whitespace-nowrap z-10",
            "focus:ring-[#2C3E50] focus:ring-offset-0 focus-visible:ring-0"
          )}
        >
          <X className="h-3.5 w-3.5" />
          Clear all
        </Button>
      )}
    </div>
  );
} 