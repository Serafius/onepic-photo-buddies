import { PhotographerList } from "@/components/PhotographersList";
import { useEffect, useMemo, useState } from "react";
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

export const FeaturedPhotographers = () => {
  const [rows, setRows] = useState<DbPhotographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Photographers")
        .select("id, name, profile_picture_url, rating, profession, location, city, country")
        .gte("rating", 3.5)
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
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      image: r.profile_picture_url || "/placeholder.svg",
      rating: Number(r.rating ?? 3.5),
      specialty: r.profession || "Photography",
      location: mapLocation(r) || "",
    }));
  }, [rows]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Featured Photographers</h1>
      {loading && <div className="text-muted-foreground">Loading featured photographers…</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && (
        <PhotographerList
          photographers={mapped}
          size="detailed"
          title="Top Rated Photographers"
        />
      )}
    </div>
  );
};