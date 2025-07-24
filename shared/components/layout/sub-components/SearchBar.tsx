'use client'

import { useRef, useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { useSearchStore } from '@/features/search/store/useSearchStore'
import { Button } from "@/shared/components/ui/button"
import { CustomPlacesAutocomplete } from "@/shared/components/ui/custom-places-autocomplete"
import { LocationData } from "@/shared/types/types"
import { useRouter } from 'next/navigation'
import { useToast } from '@/shared/hooks/use-toast'

interface SearchBarProps {
  variant?: 'hero' | 'nav'
}

export default function SearchBar({ variant = 'hero' }: SearchBarProps) {
  const styles = {
    container: variant === 'hero' 
      ? "w-full max-w-[90%] md:max-w-[75%] lg:max-w-[50%] mx-auto text-black relative"
      : "w-full max-w-[300px] md:max-w-[400px] text-black relative",
    wrapper: "group relative transition-all duration-300 rounded-full",
    input: variant === 'hero'
      ? "h-12 sm:h-14 text-black font-poppins font-thin text-base md:text-lg bg-white rounded-full pl-10 pr-12 border-2 border-slate-300 shadow-md outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0"
      : "h-10 text-black font-poppins font-thin text-sm bg-white rounded-full pl-9 pr-10 border-2 border-slate-300 shadow-md outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0",
    button: variant === 'hero'
      ? "absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8"
      : "absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6",
    locationIcon: variant === 'hero'
      ? "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      : "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  }
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Get UI state from Zustand store
  const { 
    searchValue, 
    setSearchValue,
    selectedPlace,
    setSelectedPlace,
    setPlaceDetails,
    placeDetails,
    clearPlaceDetails,
    clearSearchValue
  } = useSearchStore()
  
  const router = useRouter()
  const { toast } = useToast()

  // Extract navigation logic to reusable function
  const navigateToSearch = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.viewport) {
      const viewport = place.geometry.viewport;
      const searchParams = new URLSearchParams({
        near: place.formatted_address || '',
        ne_lat: viewport.getNorthEast().lat().toString(),
        ne_lng: viewport.getNorthEast().lng().toString(),
        sw_lat: viewport.getSouthWest().lat().toString(),
        sw_lng: viewport.getSouthWest().lng().toString(),
        zoom_level: '13',
        map_toggle: 'on'
      });
      
      router.push(`/boats/search?${searchParams.toString()}`);
    }
  }

  const handlePlaceSelected = (locationData: LocationData) => {
    setSearchValue(locationData.formatted_address);
    setSelectedPlace(locationData.raw);
    
    // Store processed location data
    if (locationData.raw) {
      setPlaceDetails(locationData.raw);
      // Immediately navigate after selection
      navigateToSearch(locationData.raw);
    }
  }

  const handleLocationError = (errorMessage: string) => {
    toast({
      title: "Location Error",
      description: errorMessage,
      variant: "destructive",
    })
  }

  // Handler for manual form submission (search button click)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPlace) {
      toast({
        title: "Invalid Location",
        description: "Please select a valid location from the suggestions",
        variant: "destructive",
      })
      return
    }
    
    navigateToSearch(selectedPlace)
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <form className={styles.wrapper} onSubmit={handleSubmit}>
        <div className={styles.locationIcon}>
          <MapPin size={variant === 'hero' ? 18 : 16} />
        </div>
        <CustomPlacesAutocomplete
          onPlaceSelected={handlePlaceSelected}
          onError={handleLocationError}
          placeholder="Where can we take you?"
          className={styles.input}
          containerClassName="w-full"
          defaultValue={searchValue}
          variant={variant}
          isOpen={isFocused}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        <button 
          type="submit"
          className={`${styles.button}`}
          aria-label="Search"
        >
          <Search 
            size={variant === 'hero' ? 24 : 18} 
            className="text-slate-400" 
          />
        </button>
      </form>
    </div>
  )
} 