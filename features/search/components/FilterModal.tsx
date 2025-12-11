"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils/general-utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  X,
  Filter,
  Check,
  ChevronDown,
} from "lucide-react";
import { getSearchCategories } from "@/features/search/actions/search-actions";
import { useSearchURL } from "@/features/search/hooks/useSearchURL";
import {
  parseNumberParam,
  parseStringParam,
  parseArrayParam,
} from "@/shared/lib/utils/search-params-utils";

// Common boat features for filtering
const BOAT_FEATURES = [
  { id: "wifi", label: "WiFi", icon: "wifi" },
  { id: "airConditioning", label: "AC", icon: "snowflake" },
  { id: "kitchen", label: "Kitchen", icon: "utensils" },
  { id: "shower", label: "Shower", icon: "shower" },
  { id: "bluetooth", label: "Bluetooth", icon: "bluetooth" },
  { id: "usb", label: "USB Charging", icon: "usb" },
  { id: "waterToys", label: "Water Toys", icon: "umbrella-beach" },
  { id: "fishingGear", label: "Fishing Gear", icon: "fish" },
  { id: "snorkelingGear", label: "Snorkeling", icon: "mask" },
  { id: "paddleBoard", label: "Paddle Board", icon: "water" },
  { id: "jetSki", label: "Jet Ski", icon: "tint" },
  { id: "bbq", label: "BBQ Grill", icon: "fire" },
];

// Default filter values
const DEFAULT_FILTERS = {
  date: undefined,
  priceRange: [0, 20000] as [number, number],
  lengthRange: [0, 100] as [number, number],
  yearBuilt: [1980, new Date().getFullYear()] as [number, number],
  guests: 1,
  cabins: 0,
  bathrooms: 0,
  location: "",
  category: "all",
  features: [] as string[],
};

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const { searchParams, isPending, updateSearchParams, clearSearchParams } =
    useSearchURL();

  // State to track active filter sections
  const [activeSection, setActiveSection] = useState<string | null>("date");

  // Parse initial filter values with our unified utilities
  const getInitialNumberParam = (key: string, defaultValue: number): number => {
    const value = parseNumberParam(searchParams.get(key));
    return value !== null ? value : defaultValue;
  };

  // State for all filter values
  const [date, setDate] = useState<Date | undefined>(() => {
    const dateStr = parseStringParam(searchParams.get("date"));
    return dateStr ? new Date(dateStr) : undefined;
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([
    getInitialNumberParam("minPrice", DEFAULT_FILTERS.priceRange[0]),
    getInitialNumberParam("maxPrice", DEFAULT_FILTERS.priceRange[1]),
  ]);

  const [lengthRange, setLengthRange] = useState<[number, number]>([
    getInitialNumberParam("minLength", DEFAULT_FILTERS.lengthRange[0]),
    getInitialNumberParam("maxLength", DEFAULT_FILTERS.lengthRange[1]),
  ]);

  const [yearBuilt, setYearBuilt] = useState<[number, number]>([
    getInitialNumberParam("minYear", DEFAULT_FILTERS.yearBuilt[0]),
    getInitialNumberParam("maxYear", DEFAULT_FILTERS.yearBuilt[1]),
  ]);

  const [guests, setGuests] = useState(
    getInitialNumberParam("passengers", DEFAULT_FILTERS.guests)
  );
  const [cabins, setCabins] = useState(
    getInitialNumberParam("cabins", DEFAULT_FILTERS.cabins)
  );
  const [bathrooms, setBathrooms] = useState(
    getInitialNumberParam("bathrooms", DEFAULT_FILTERS.bathrooms)
  );

  // Location state using 'near' parameter
  const [location, setLocation] = useState(
    parseStringParam(searchParams.get("near")) || DEFAULT_FILTERS.location
  );

  // Categories - use our unified array parser
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    return parseArrayParam(searchParams.get("category"));
  });

  // Features - use our unified array parser
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    return parseArrayParam(searchParams.get("features"));
  });

  // Categories data
  const [categories, setCategories] = useState<
    { category: string; count: number; displayName: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Count active filters
  const activeFilterCount = useCallback(() => {
    let count = 0;

    if (date) count++;
    if (
      priceRange[0] > DEFAULT_FILTERS.priceRange[0] ||
      priceRange[1] < DEFAULT_FILTERS.priceRange[1]
    )
      count++;
    if (
      lengthRange[0] > DEFAULT_FILTERS.lengthRange[0] ||
      lengthRange[1] < DEFAULT_FILTERS.lengthRange[1]
    )
      count++;
    if (
      yearBuilt[0] > DEFAULT_FILTERS.yearBuilt[0] ||
      yearBuilt[1] < DEFAULT_FILTERS.yearBuilt[1]
    )
      count++;
    if (guests > DEFAULT_FILTERS.guests) count++;
    if (cabins > DEFAULT_FILTERS.cabins) count++;
    if (bathrooms > DEFAULT_FILTERS.bathrooms) count++;
    if (selectedCategories.length > 0) count++;
    if (selectedFeatures.length > 0) count++;

    return count;
  }, [
    date,
    priceRange,
    lengthRange,
    yearBuilt,
    guests,
    cabins,
    bathrooms,
    selectedCategories,
    selectedFeatures,
  ]);

  // Fetch categories on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchCategories = async () => {
      try {
        const categoriesData = await getSearchCategories();
        if (isMounted) {
          setCategories(categoriesData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch boat categories:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Apply filters and update URL
  const applyFilters = useCallback(() => {
    updateSearchParams({
      date: date ? format(date, "yyyy-MM-dd") : null,
      minPrice:
        priceRange[0] > DEFAULT_FILTERS.priceRange[0] ? priceRange[0] : null,
      maxPrice:
        priceRange[1] < DEFAULT_FILTERS.priceRange[1] ? priceRange[1] : null,
      minLength:
        lengthRange[0] > DEFAULT_FILTERS.lengthRange[0] ? lengthRange[0] : null,
      maxLength:
        lengthRange[1] < DEFAULT_FILTERS.lengthRange[1] ? lengthRange[1] : null,
      passengers: guests > DEFAULT_FILTERS.guests ? guests : null,
      cabins: cabins > DEFAULT_FILTERS.cabins ? cabins : null,
      bathrooms: bathrooms > DEFAULT_FILTERS.bathrooms ? bathrooms : null,
      minYear:
        yearBuilt[0] > DEFAULT_FILTERS.yearBuilt[0] ? yearBuilt[0] : null,
      maxYear:
        yearBuilt[1] < DEFAULT_FILTERS.yearBuilt[1] ? yearBuilt[1] : null,
      near: location || null,
      category:
        selectedCategories.length > 0 ? selectedCategories.join(",") : null,
      features: selectedFeatures.length > 0 ? selectedFeatures.join(",") : null,
      page: 1, // Reset to first page when filters change
    });
    onClose();
  }, [
    updateSearchParams,
    date,
    priceRange,
    lengthRange,
    yearBuilt,
    guests,
    cabins,
    bathrooms,
    location,
    selectedCategories,
    selectedFeatures,
    onClose,
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
    setSelectedCategories([]);
    setSelectedFeatures([]);

    // Clear all filter parameters by setting them to null
    updateSearchParams({
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
      near: null,
      page: 1,
    });
  }, [updateSearchParams]);

  // Handle feature toggle
  const toggleFeature = useCallback((featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  }, []);

  // Toggle category selection
  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
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

  // Toggle accordion sections
  const toggleSection = useCallback((section: string) => {
    setActiveSection((prev) => (prev === section ? null : section));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
              {activeFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount()}
                </Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5">
          {/* Date Section */}
          <div className="filter-section">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("date")}
            >
              <h3 className="text-base font-medium flex items-center">
                Date
                {date && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Selected
                  </Badge>
                )}
              </h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  activeSection === "date" ? "transform rotate-180" : ""
                )}
              />
            </div>

            {activeSection === "date" && (
              <div className="mt-3 mb-1 py-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left border-dashed border-gray-300",
                        date &&
                          "text-primary border-primary border-solid font-medium"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {date ? format(date, "MMMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>

                {date && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDate(undefined)}
                    className="mt-2 text-xs h-8"
                  >
                    Clear date
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Price Range Section */}
          <div className="filter-section border-t pt-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("price")}
            >
              <h3 className="text-base font-medium flex items-center">
                Price Range
                {(priceRange[0] > DEFAULT_FILTERS.priceRange[0] ||
                  priceRange[1] < DEFAULT_FILTERS.priceRange[1]) && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Custom
                  </Badge>
                )}
              </h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  activeSection === "price" ? "transform rotate-180" : ""
                )}
              />
            </div>

            {activeSection === "price" && (
              <div className="mt-3 mb-1 py-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-gray-50 px-3 py-2 rounded-md border text-sm w-24 text-center">
                    ${priceRange[0]}
                  </div>
                  <div className="text-gray-500 text-xs">charter price</div>
                  <div className="bg-gray-50 px-3 py-2 rounded-md border text-sm w-24 text-center">
                    ${priceRange[1] === 20000 ? "20000+" : priceRange[1]}
                  </div>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  min={0}
                  max={20000}
                  step={500}
                  className="my-6"
                />

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange([0, 1000])}
                    className={cn(
                      "h-10",
                      priceRange[0] === 0 && priceRange[1] === 1000
                        ? "bg-primary/10 border-primary"
                        : ""
                    )}
                  >
                    Under $1000
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange([1000, 5000])}
                    className={cn(
                      "h-10",
                      priceRange[0] === 1000 && priceRange[1] === 5000
                        ? "bg-primary/10 border-primary"
                        : ""
                    )}
                  >
                    $1000-$5000
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange([5000, 20000])}
                    className={cn(
                      "h-10",
                      priceRange[0] === 5000 && priceRange[1] === 20000
                        ? "bg-primary/10 border-primary"
                        : ""
                    )}
                  >
                    $5000+
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Boat Length Section */}
          <div className="filter-section border-t pt-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("length")}
            >
              <h3 className="text-base font-medium flex items-center">
                Boat Length
                {(lengthRange[0] > DEFAULT_FILTERS.lengthRange[0] ||
                  lengthRange[1] < DEFAULT_FILTERS.lengthRange[1]) && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Custom
                  </Badge>
                )}
              </h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  activeSection === "length" ? "transform rotate-180" : ""
                )}
              />
            </div>

            {activeSection === "length" && (
              <div className="mt-3 mb-1 py-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-gray-50 px-3 py-2 rounded-md border text-sm w-24 text-center">
                    {lengthRange[0]} ft
                  </div>
                  <div className="text-gray-500 text-xs">boat length</div>
                  <div className="bg-gray-50 px-3 py-2 rounded-md border text-sm w-24 text-center">
                    {lengthRange[1] === 100
                      ? "100+ ft"
                      : `${lengthRange[1]} ft`}
                  </div>
                </div>
                <Slider
                  value={lengthRange}
                  onValueChange={handleLengthRangeChange}
                  min={0}
                  max={100}
                  step={5}
                  className="my-6"
                />

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLengthRange([0, 30])}
                    className={cn(
                      "h-10",
                      lengthRange[0] === 0 && lengthRange[1] === 30
                        ? "bg-primary/10 border-primary"
                        : ""
                    )}
                  >
                    Up to 30ft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLengthRange([30, 60])}
                    className={cn(
                      "h-10",
                      lengthRange[0] === 30 && lengthRange[1] === 60
                        ? "bg-primary/10 border-primary"
                        : ""
                    )}
                  >
                    30-60ft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLengthRange([60, 100])}
                    className={cn(
                      "h-10",
                      lengthRange[0] === 60 && lengthRange[1] === 100
                        ? "bg-primary/10 border-primary"
                        : ""
                    )}
                  >
                    60ft+
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Year Built Section */}
          <div className="filter-section border-t pt-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("year")}
            >
              <h3 className="text-base font-medium flex items-center">
                Year Built
                {(yearBuilt[0] > DEFAULT_FILTERS.yearBuilt[0] ||
                  yearBuilt[1] < DEFAULT_FILTERS.yearBuilt[1]) && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Custom
                  </Badge>
                )}
              </h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  activeSection === "year" ? "transform rotate-180" : ""
                )}
              />
            </div>

            {activeSection === "year" && (
              <div className="mt-3 mb-1 py-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-gray-50 px-3 py-2 rounded-md border text-sm w-24 text-center">
                    {yearBuilt[0]}
                  </div>
                  <div className="text-gray-500 text-xs">model year</div>
                  <div className="bg-gray-50 px-3 py-2 rounded-md border text-sm w-24 text-center">
                    {yearBuilt[1]}
                  </div>
                </div>
                <Slider
                  value={yearBuilt}
                  onValueChange={handleYearBuiltChange}
                  min={1980}
                  max={new Date().getFullYear()}
                  step={1}
                  className="my-6"
                />
              </div>
            )}
          </div>

          {/* Capacity & Amenities Section */}
          <div className="filter-section border-t pt-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("capacity")}
            >
              <h3 className="text-base font-medium flex items-center">
                Capacity & Amenities
                {(guests > DEFAULT_FILTERS.guests ||
                  cabins > DEFAULT_FILTERS.cabins ||
                  bathrooms > DEFAULT_FILTERS.bathrooms) && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Custom
                  </Badge>
                )}
              </h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  activeSection === "capacity" ? "transform rotate-180" : ""
                )}
              />
            </div>

            {activeSection === "capacity" && (
              <div className="mt-3 mb-1 py-2">
                <div className="space-y-4">
                  {/* Guests */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Guests
                    </label>
                    <Select
                      value={guests.toString()}
                      onValueChange={(value) => setGuests(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Any</SelectItem>
                        {[2, 4, 6, 8, 10, 12, 15, 20, 25, 30].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}+ guests
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cabins & Bathrooms */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Cabins
                      </label>
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
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Bathrooms
                      </label>
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
                </div>
              </div>
            )}
          </div>

          {/* Boat Types Section */}
          <div className="filter-section border-t pt-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("categories")}
            >
              <h3 className="text-base font-medium flex items-center">
                Boat Types
                {selectedCategories.length > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {selectedCategories.length}
                  </Badge>
                )}
              </h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  activeSection === "categories" ? "transform rotate-180" : ""
                )}
              />
            </div>

            {activeSection === "categories" && (
              <div className="mt-3 mb-1 py-2">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    <div className="max-h-56 overflow-y-auto border rounded-xl p-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.category}
                          className={cn(
                            "flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors",
                            selectedCategories.includes(cat.category)
                              ? "bg-primary/10 hover:bg-primary/15"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => toggleCategory(cat.category)}
                        >
                          <Checkbox
                            id={`cat-${cat.category}`}
                            checked={selectedCategories.includes(cat.category)}
                            onCheckedChange={() => toggleCategory(cat.category)}
                            className={cn(
                              "mr-3",
                              selectedCategories.includes(cat.category)
                                ? "border-primary"
                                : ""
                            )}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`cat-${cat.category}`}
                              className="cursor-pointer w-full font-medium"
                            >
                              {cat.displayName}
                            </label>
                            <p className="text-xs text-gray-500">
                              {cat.count} boats
                            </p>
                          </div>
                          {selectedCategories.includes(cat.category) && (
                            <Check className="h-4 w-4 text-primary ml-2" />
                          )}
                        </div>
                      ))}
                    </div>

                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategories([])}
                        className="w-full mt-2 text-sm"
                      >
                        Clear selection ({selectedCategories.length})
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="filter-section border-t pt-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("features")}
            >
              <h3 className="text-base font-medium flex items-center">
                Features
                {selectedFeatures.length > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {selectedFeatures.length}
                  </Badge>
                )}
              </h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  activeSection === "features" ? "transform rotate-180" : ""
                )}
              />
            </div>

            {activeSection === "features" && (
              <div className="mt-3 mb-1 py-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {BOAT_FEATURES.map((feature) => (
                    <div
                      key={feature.id}
                      className={cn(
                        "flex items-center p-2 rounded-lg border cursor-pointer transition-colors",
                        selectedFeatures.includes(feature.id)
                          ? "bg-primary/10 border-primary"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <Checkbox
                        id={feature.id}
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="mr-2"
                      />
                      <label
                        htmlFor={feature.id}
                        className="cursor-pointer flex-1"
                      >
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>

                {selectedFeatures.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFeatures([])}
                    className="w-full mt-3 text-sm"
                  >
                    Clear features ({selectedFeatures.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t sticky bottom-0 bg-white z-10">
          <div className="flex w-full gap-4">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex-1 h-12"
            >
              Reset All
            </Button>
            <Button
              onClick={applyFilters}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : activeFilterCount() > 0 ? (
                `Apply Filters (${activeFilterCount()})`
              ) : (
                "Apply Filters"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
