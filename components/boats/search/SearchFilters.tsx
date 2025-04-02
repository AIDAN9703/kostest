"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
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
  SheetTrigger, SheetFooter
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, MapPin, Search, 
  SlidersHorizontal, X, Loader2
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
  
  // Set the search filter height as a CSS variable for layout calculations
  useEffect(() => {
    const updateFilterHeight = () => {
      const filterElement = document.getElementById('search-filters');
      if (filterElement) {
        const height = filterElement.offsetHeight;
        document.documentElement.style.setProperty('--search-filter-height', `${height}px`);
      }
    };
    
    // Update on mount and when window is resized
    updateFilterHeight();
    window.addEventListener('resize', updateFilterHeight);
    
    return () => {
      window.removeEventListener('resize', updateFilterHeight);
    };
  }, []);
  
  return (
    <div id="search-filters" className="flex gap-3 overflow-x-auto py-3 px-6 border-b border-gray-100">
      {/* Search Input */}
      <div className="relative w-64 sm:w-72">
        <Input
          placeholder="Search by location..."
          defaultValue={location}
          onChange={(e) => handleLocationSearch(e.target.value)}
          className="h-10 pl-9 rounded-full"
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
              "h-10 rounded-full",
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
      
      {/* Category Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 rounded-full w-40",
              selectedCategories.length > 0 && "text-[#2C3E50] font-medium"
            )}
          >
            <span className="flex items-center justify-between w-full">
              <span className="truncate">
                {selectedCategories.length === 0 
                  ? "Boat type" 
                  : selectedCategories.length === 1 
                    ? categories.find(c => c.category === selectedCategories[0])?.category.replace('_', ' ') || "Boat type"
                    : `${selectedCategories.length} types`}
              </span>
              <svg className="h-4 w-4 ml-1 opacity-50" viewBox="0 0 12 12" fill="none">
                <path d="M2.25 4.5L6 8.25L9.75 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="center">
          <div className="max-h-60 overflow-y-auto">
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
        </PopoverContent>
      </Popover>
      
      {/* Guests Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 rounded-full w-40",
              guests > DEFAULT_FILTERS.guests && "text-[#2C3E50] font-medium"
            )}
          >
            <span className="flex items-center justify-between w-full">
              <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
              <svg className="h-4 w-4 ml-1 opacity-50" viewBox="0 0 12 12" fill="none">
                <path d="M2.25 4.5L6 8.25L9.75 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="center">
          <div className="max-h-60 overflow-y-auto">
            {[1, 2, 4, 6, 8, 10, 12, 15, 20, 25, 30].map((num) => (
              <div 
                key={num} 
                className={cn(
                  "py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer",
                  guests === num && "bg-gray-50"
                )}
                onClick={() => setGuests(num)}
              >
                {num} {num === 1 ? 'Guest' : 'Guests'}
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
              "h-10 rounded-full",
              activeFilterCount > 0 && "text-[#2C3E50] font-medium"
            )}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 rounded-full bg-[#2C3E50] text-white">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-4">
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
          
          <SheetFooter className="mt-6 flex gap-3">
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
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Search Button */}
      <Button 
        onClick={applyFilters}
        className="h-10 rounded-full bg-primary hover:bg-primary/80 text-white"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Search className="h-4 w-4 mr-1" />
        )}
        Search
      </Button>
      
      {/* Clear Filters Button */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          onClick={resetFilters}
          className="h-10 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
} 