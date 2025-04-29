import { create } from 'zustand'

interface PlaceDetails {
  formattedAddress: string
  coordinates: {
    lat: number
    lng: number
  } | null
  viewport: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  } | null
  placeId: string
  name: string
}

// Only keeping UI-specific state here, search results state belongs in URL params
interface SearchStore {
  // Search input state
  searchValue: string
  setSearchValue: (value: string) => void
  clearSearchValue: () => void
  
  // Autocomplete reference for Google Places
  autocompleteRef: React.RefObject<HTMLInputElement> | null
  setAutocompleteRef: (ref: React.RefObject<HTMLInputElement> | null) => void
  
  // Selected place from Google Places
  selectedPlace: google.maps.places.PlaceResult | null
  setSelectedPlace: (place: google.maps.places.PlaceResult | null) => void
  
  // Processed place details for easier consumption
  placeDetails: PlaceDetails | null
  setPlaceDetails: (place: google.maps.places.PlaceResult | null) => void
  clearPlaceDetails: () => void
  
  // UI expansion state (for mobile/responsive layouts)
  isExpanded: boolean
  setIsExpanded: (value: boolean) => void
  resetSearchExpansion: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  // Search input
  searchValue: '',
  setSearchValue: (value) => set({ searchValue: value }),
  clearSearchValue: () => set({ searchValue: '' }),
  
  // UI expansion state
  isExpanded: false,
  setIsExpanded: (value) => set({ isExpanded: value }),
  resetSearchExpansion: () => set({ isExpanded: false }),
  
  // Google Places state
  selectedPlace: null,
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  autocompleteRef: null,
  setAutocompleteRef: (ref) => set({ autocompleteRef: ref }),
  
  // Place details processing
  placeDetails: null,
  setPlaceDetails: (place) => {
    if (!place) {
      set({ placeDetails: null })
      return
    }

    // Extract viewport/bounding box if available
    let viewport = null;
    if (place.geometry?.viewport) {
      const vp = place.geometry.viewport;
      viewport = {
        ne: {
          lat: vp.getNorthEast().lat(),
          lng: vp.getNorthEast().lng()
        },
        sw: {
          lat: vp.getSouthWest().lat(),
          lng: vp.getSouthWest().lng()
        }
      };
    }

    const details: PlaceDetails = {
      formattedAddress: place.formatted_address || '',
      coordinates: place.geometry?.location
        ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }
        : null,
      viewport: viewport,
      placeId: place.place_id || '',
      name: place.name || '',
    }

    set({ placeDetails: details })
  },
  clearPlaceDetails: () => set({ placeDetails: null, selectedPlace: null }),
})) 