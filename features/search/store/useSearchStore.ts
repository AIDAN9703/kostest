import { create } from "zustand";

/** Temporary autocomplete state for the nav search bar until navigation. */
interface SearchStore {
  selectedPlace: google.maps.places.PlaceResult | null;
  setSelectedPlace: (place: google.maps.places.PlaceResult | null) => void;
  clearSelectedPlace: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  selectedPlace: null,
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  clearSelectedPlace: () => set({ selectedPlace: null }),
}));
