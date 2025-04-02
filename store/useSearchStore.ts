import { create } from 'zustand'

interface SearchStore {
  searchValue: string
  isExpanded: boolean
  selectedPlace: google.maps.places.PlaceResult | null
  autocompleteRef: React.RefObject<HTMLInputElement> | null
  setSearchValue: (value: string) => void
  setIsExpanded: (value: boolean) => void
  setSelectedPlace: (place: google.maps.places.PlaceResult | null) => void
  setAutocompleteRef: (ref: React.RefObject<HTMLInputElement> | null) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchValue: '',
  isExpanded: false,
  selectedPlace: null,
  autocompleteRef: null,
  setSearchValue: (value) => set({ searchValue: value }),
  setIsExpanded: (value) => set({ isExpanded: value }),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setAutocompleteRef: (ref) => set({ autocompleteRef: ref }),
})) 