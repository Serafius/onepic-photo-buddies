import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface LocationFilterProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

const locations = [
  "All Locations",
  "New York, NY", 
  "Los Angeles, CA",
  "Chicago, IL",
  "Luxembourg, Alzette",
  "San Francisco, CA",
  "Miami, FL",
  "Austin, TX",
  "Seattle, WA"
];

export const LocationFilter = ({ selectedLocation, onLocationChange }: LocationFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-gray-500" />
      <Select value={selectedLocation} onValueChange={onLocationChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};