'use client'

import { useRef, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchStore } from '@/store/useSearchStore'
import { Button } from "@/components/ui/button"
import { PlacesAutocomplete } from "@/components/ui/places-autocomplete"
import { LocationData } from "@/types/types"
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useSearchURL } from '@/hooks/useSearchURL'

interface SearchBarProps {
  variant?: 'hero' | 'nav'
}

export default function SearchBar({ variant = 'hero' }: SearchBarProps) {
  const styles = {
    container: variant === 'hero' 
      ? "w-full max-w-[90%] md:max-w-[75%] lg:max-w-[50%] mx-auto"
      : "w-full max-w-[300px] md:max-w-[400px]",
    input: variant === 'hero'
      ? "h-12 text-black text-base md:text-lg bg-white rounded-l-lg rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      : "h-8 text-black text-sm bg-white rounded-l-lg rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0",
    button: variant === 'hero'
      ? "h-12 w-12 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
      : "h-8 w-8 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
  }
  const { 
    searchValue, 
    setSearchValue, 
    setAutocompleteRef,
    setSelectedPlace,
    setPlaceDetails
  } = useSearchStore()
  
  const router = useRouter()
  const { toast } = useToast()
  const { updateSearchParams } = useSearchURL()
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasSelectedPlace, setHasSelectedPlace] = useState(false)
  const [selectedLocationData, setSelectedLocationData] = useState<LocationData | null>(null)

  useEffect(() => {
    if (inputRef.current) {
      setAutocompleteRef(inputRef as React.RefObject<HTMLInputElement>)
    }
  }, [setAutocompleteRef])

  const handlePlaceSelected = (locationData: LocationData) => {
    // Store place selection data without triggering search
    setHasSelectedPlace(true)
    setSearchValue(locationData.formatted_address)
    setSelectedPlace(locationData.raw)
    setSelectedLocationData(locationData)
    
    // Store processed location data
    if (locationData.raw) {
      setPlaceDetails(locationData.raw)
    }
  }

  const handleLocationError = (errorMessage: string) => {
    toast({
      title: "Location Error",
      description: errorMessage,
      variant: "destructive",
    })
  }

  // Handler for form submission (button click or Enter press)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasSelectedPlace || !selectedLocationData) {
      toast({
        title: "Invalid Location",
        description: "Please select a valid location from the suggestions",
        variant: "destructive",
      })
      return
    }
    
    // Now perform the search using the previously selected location
    const bounds = selectedLocationData.bounds
    if (!bounds) return
    
    // Navigate to search page with selected location parameters
    router.push(
      '/boats/search?' + 
      new URLSearchParams({
        near: selectedLocationData.formatted_address,
        ne_lat: bounds.ne_lat.toString(),
        ne_lng: bounds.ne_lng.toString(),
        sw_lat: bounds.sw_lat.toString(),
        sw_lng: bounds.sw_lng.toString(),
        zoom_level: '13',
        map_toggle: 'on'
      }).toString()
    )
  }

  return (
    <div className={styles.container}>
      <form className="flex items-center w-full" onSubmit={handleSubmit}>
        <PlacesAutocomplete
          onPlaceSelected={handlePlaceSelected}
          onError={handleLocationError}
          placeholder="Where can we take you?"
          className={styles.input}
          containerClassName="flex-1"
          defaultValue={searchValue}
        />
        <Button
          type="submit"
          variant="default"
          size={variant === 'hero' ? 'lg' : 'default'}
          className={`${styles.button} bg-gradient-to-r from-sky-300 to-emerald-400 hover:from-sky-400 hover:to-emerald-500`}
        >
          <Search size={variant === 'hero' ? 24 : 16} />
        </Button>
      </form>
    </div>
  )
} 