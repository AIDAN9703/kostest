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

interface SearchStore {
  searchValue: string
  isExpanded: boolean
  selectedPlace: google.maps.places.PlaceResult | null
  placeDetails: PlaceDetails | null
  autocompleteRef: React.RefObject<HTMLInputElement> | null
  setSearchValue: (value: string) => void
  setIsExpanded: (value: boolean) => void
  setSelectedPlace: (place: google.maps.places.PlaceResult | null) => void
  setPlaceDetails: (place: google.maps.places.PlaceResult | null) => void
  setAutocompleteRef: (ref: React.RefObject<HTMLInputElement> | null) => void
  clearPlaceDetails: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchValue: '',
  isExpanded: false,
  selectedPlace: null,
  placeDetails: null,
  autocompleteRef: null,
  setSearchValue: (value) => set({ searchValue: value }),
  setIsExpanded: (value) => set({ isExpanded: value }),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
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
  setAutocompleteRef: (ref) => set({ autocompleteRef: ref }),
  clearPlaceDetails: () => set({ placeDetails: null, selectedPlace: null }),
})) 