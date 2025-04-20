'use client'

import { Autocomplete } from '@react-google-maps/api'
import { useRef, useEffect, useState } from 'react'
import { Input } from './input'
import { Loader2 } from 'lucide-react'
import { LocationData } from '@/types/types'

interface PlacesAutocompleteProps {
  onPlaceSelected: (locationData: LocationData) => void;
  onError?: (errorMessage: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  defaultValue?: string;
  countryRestriction?: string;
  types?: string[];
}

export function PlacesAutocomplete({
  onPlaceSelected,
  onError,
  placeholder = 'Search location...',
  className = '',
  containerClassName = '',
  defaultValue = '',
  countryRestriction = 'us',
  types = ['(cities)']
}: PlacesAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [inputValue, setInputValue] = useState(defaultValue)

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsReady(true)
      } else {
        // If not loaded yet, check again in 100ms
        setTimeout(checkGoogleMapsLoaded, 100)
      }
    }
    
    checkGoogleMapsLoaded()
  }, [])

  // Update input value if defaultValue changes
  useEffect(() => {
    setInputValue(defaultValue)
  }, [defaultValue])

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      // More robust validation - check if place exists and has expected properties
      if (!place || !place.geometry) {
        if (onError) onError("Please select a location from the dropdown list");
        return;
      }
      
      // Basic validation
      if (!place.formatted_address) {
        if (onError) onError("Invalid location: No formatted address found");
        return;
      }

      if (!place.geometry?.location) {
        if (onError) onError("Location error: Could not get coordinates for this location");
        return;
      }

      // Require viewport to be available
      if (!place.geometry.viewport) {
        if (onError) onError("This location doesn't have defined boundaries. Please try a different location.");
        return;
      }

      // Extract viewport for bounds
      const vp = place.geometry.viewport;
      const viewport = {
        ne: {
          lat: vp.getNorthEast().lat(),
          lng: vp.getNorthEast().lng()
        },
        sw: {
          lat: vp.getSouthWest().lat(),
          lng: vp.getSouthWest().lng()
        }
      };
      
      const bounds = {
        ne_lat: vp.getNorthEast().lat(),
        ne_lng: vp.getNorthEast().lng(),
        sw_lat: vp.getSouthWest().lat(),
        sw_lng: vp.getSouthWest().lng()
      };

      // Create structured location data
      const locationData: LocationData = {
        formatted_address: place.formatted_address || '',
        coordinates: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        },
        viewport: viewport,
        bounds: bounds,
        place_id: place.place_id || '',
        name: place.name || '',
        raw: place,
        isValid: true
      };

      // Update the input value
      setInputValue(place.formatted_address || '');
      
      // Pass structured data to callback
      onPlaceSelected(locationData);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className={containerClassName}>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          componentRestrictions: { country: countryRestriction },
          types: types,
          fields: ['geometry.location', 'geometry.viewport', 'formatted_address', 'name', 'place_id']
        }}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className={className}
          aria-label="Search for a location"
          value={inputValue}
          onChange={handleInputChange}
        />
      </Autocomplete>
    </div>
  )
} 