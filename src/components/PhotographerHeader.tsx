import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface PhotographerHeaderProps {
  photographerId?: string;
}

export function PhotographerHeader({ photographerId }: PhotographerHeaderProps) {
  const [loading, setLoading] = useState(true);
  const [photographer, setPhotographer] = useState<{
    id: string;
    name: string | null;
    specialty: string | null;
    location: string | null;
    city: string | null;
    state: string | null;
    bio: string | null;
    rating: number | null;
  } | null>(null);
  const [photoCount, setPhotoCount] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!photographerId) return;
      setLoading(true);
      try {
        const [pRes, countRes, catRes] = await Promise.all([
          supabase
            .from("photographers")
            .select("id, name, specialty, location, city, state, bio, rating")
            .eq("id", photographerId)
            .maybeSingle(),
          supabase
            .from("portfolio_images")
            .select("id", { count: "exact", head: true })
            .eq("photographer_id", photographerId),
          supabase
            .from("photographer_categories")
            .select("name")
            .eq("photographer_id", photographerId)
            .limit(10),
        ]);

        if (!isMounted) return;

        if (pRes.data) setPhotographer(pRes.data as any);
        setPhotoCount(countRes.count ?? 0);
        setCategories((catRes.data ?? []).map((c: any) => c.name).filter(Boolean));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [photographerId]);

  const displayLocation = useMemo(() => {
    if (!photographer) return null;
    return (
      photographer.city ||
      photographer.state ||
      photographer.location ||
      null
    );
  }, [photographer]);

  if (!photographerId) return null;

  if (loading) {
    return (
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 w-full max-w-xl">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </header>
    );
  }

  if (!photographer) return null;

  const name = photographer.name ?? "Photographer";
  const rating = photographer.rating ?? 3.5;

  return (
    <header className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage loading="lazy" alt={`${name} profile photo`} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">
              {name} — Portfolio
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {displayLocation && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {displayLocation}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4" aria-hidden="true" />
                {rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                {photoCount} photos
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to={`/client/sessions?photographer=${photographer.id}`} aria-label={`Book a session with ${name}`}>
              Book session
            </Link>
          </Button>
        </div>
      </div>

      <section className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          {photographer.specialty && (
            <Badge variant="secondary" aria-label="Specialty">
              {photographer.specialty}
            </Badge>
          )}
          {categories.map((cat) => (
            <Badge key={cat} variant="outline" aria-label={`Category ${cat}`}>
              {cat}
            </Badge>
          ))}
        </div>
      </section>
    </header>
  );
}
