import { PhotographerList } from "@/components/PhotographersList";
import { photographers } from "@/lib/data";
import { useState } from "react";
import { LocationFilter } from "@/components/LocationFilter";

export const AllPhotographers = () => {
    const [selectedLocation, setSelectedLocation] = useState("All Locations");
    
    const filteredPhotographers = selectedLocation === "All Locations" 
        ? photographers 
        : photographers.filter(p => p.location === selectedLocation);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">All Photographers</h1>
                <LocationFilter 
                    selectedLocation={selectedLocation}
                    onLocationChange={setSelectedLocation}
                />
            </div>
            <PhotographerList
                photographers={filteredPhotographers}
                size="detailed"
                title="Top Rated Photographers"
            />
        </div>
    );
};