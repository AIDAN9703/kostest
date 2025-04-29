import { Button } from "@/components/ui/button";
import { useSearchURL } from "@/hooks/useSearchURL";
import { useSearchStore } from "@/store/useSearchStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define type for destination
interface Destination {
    name: string;
    displayName: string;
    params: string;
}

export default function SearchResultsFallback() {
    const { clearSearchParams } = useSearchURL();
    const router = useRouter();
    
    // Get search store functions to update search state
    const { 
        setSearchValue, 
        clearPlaceDetails,
        clearSearchValue 
    } = useSearchStore();
    
    // Popular destinations with Miami coordinates
    const popularDestinations: Destination[] = [
        { 
            name: "Miami", 
            displayName: "Miami, FL, USA",
            params: "ne_lat=25.8550&ne_lng=-80.1200&sw_lat=25.7090&sw_lng=-80.3200&map_toggle=on" 
        },
        { 
            name: "Fort Lauderdale", 
            displayName: "Fort Lauderdale, FL, USA",
            params: "near=Fort%20Lauderdale" 
        },
        { 
            name: "Naples", 
            displayName: "Naples, FL, USA",
            params: "near=Naples%2C%20FL" 
        }
    ];
    
    // Handle destination click to update search store state
    const handleDestinationClick = (destination: Destination) => {
        // Update search value in store to match selected destination
        setSearchValue(destination.displayName);
        
        // Navigate to the search URL
        router.push(`/boats/search?${destination.params}`);
    };
    
    // Reset all filters and search state
    const handleResetAll = () => {
        clearSearchParams();
        clearSearchValue();
        clearPlaceDetails();
    };
    
    return (
        <div className="pt-32 pb-20 text-center max-w-2xl mx-auto px-4">
            <div className="mb-8 mx-auto h-px w-16 bg-primary/20" />
            
            <h3 className="text-2xl font-medium text-primary mb-4">The water awaits, but no boats here</h3>
            
            <p className="text-primary/70 max-w-md mx-auto mb-10">
                We couldn't find any boats matching your current filters. Let's find you the perfect vessel.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                <Button 
                    onClick={handleResetAll}
                    className="bg-primary hover:bg-primary/90 text-white"
                >
                    Reset All Filters
                </Button>
                
                <Button 
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="border-primary/20 text-primary hover:bg-primary/5"
                >
                    Go Back
                </Button>
            </div>
            
            <div>
                <p className="text-sm text-primary/80 mb-4">Discover popular destinations</p>
                <div className="flex flex-wrap gap-3 justify-center">
                    {popularDestinations.map((destination) => (
                        <button
                            key={destination.name}
                            onClick={() => handleDestinationClick(destination)}
                            className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-md text-sm transition-colors"
                        >
                            {destination.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
