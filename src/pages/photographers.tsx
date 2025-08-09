import { PhotographerList } from "@/components/PhotographersList";
import { useEffect, useMemo, useState } from "react";
import { LocationFilter } from "@/components/LocationFilter";
import { supabase } from "@/integrations/supabase/client";

interface DbPhotographer {
  id: number;
  name: string;
  profile_picture_url: string | null;
  rating: number | null;
  profession: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
}

export const AllPhotographers = () => {
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<DbPhotographer[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Photographers")
        .select("id, name, profile_picture_url, rating, profession, location, city, country")
        .order("rating", { ascending: false });
      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const mapped = useMemo(() => {
    const mapLocation = (r: DbPhotographer) => r.location || [r.city, r.country].filter(Boolean).join(", ");
    const all = rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      image: r.profile_picture_url || "/placeholder.svg",
      rating: Number(r.rating ?? 3.5),
      specialty: r.profession || "Photography",
      location: mapLocation(r) || "",
    }));
    if (selectedLocation === "All Locations") return all;
    return all.filter((p) => p.location === selectedLocation);
  }, [rows, selectedLocation]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">All Photographers</h1>
        <LocationFilter
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
      </div>

      {loading && <div className="text-muted-foreground">Loading photographers…</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && (
        <PhotographerList
          photographers={mapped}
          size="detailed"
          title="All Photographers"
        />
      )}
    </div>
  );
};