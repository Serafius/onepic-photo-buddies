import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { LocationFilter } from "@/components/LocationFilter";

interface PortfolioImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  category_name: string | null;
  photographer_name: string | null;
}

const ITEMS_PER_PAGE = 9;

export const CategoryPage = () => {
  const { category } = useParams();
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const loader = useRef(null);

  const loadImages = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

// Build case-insensitive filters for common synonyms (e.g., wedding/weddings)
      const key = category?.toLowerCase() || '';
      const synonyms = (() => {
        if (["wedding", "weddings"].includes(key)) return ["wedding", "weddings"];
        if (["portrait", "portraits"].includes(key)) return ["portrait", "portraits"];
        if (["event", "events"].includes(key)) return ["event", "events"];
        if (["food", "foods"].includes(key)) return ["food", "foods"];
        return key ? [key] : [];
      })();

      // Optional: pre-filter photographer IDs by selected location to avoid joins
      let allowedPhotographerIds: string[] | null = null;
      if (selectedLocation !== "All Locations") {
        const { data: photogs, error: photogsError } = await supabase
          .from('photographers')
          .select('id, location')
          .ilike('location', `%${selectedLocation}%`);
        if (photogsError) throw photogsError;
        allowedPhotographerIds = (photogs || []).map((p: any) => p.id);
        if (allowedPhotographerIds.length === 0) {
          setHasMore(false);
          return;
        }
      }

      // Query view used on the Index page and filter by category_name
      let query = supabase
        .from('v_portfolio_images')
        .select(`
          id,
          image_url,
          title,
          description,
          category_name,
          photographer_name,
          photographer_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (synonyms.length > 0) {
        const orFilter = synonyms.map((s) => `category_name.ilike.%${s}%`).join(',');
        query = query.or(orFilter);
      }

      if (allowedPhotographerIds && allowedPhotographerIds.length > 0) {
        query = query.in('photographer_id', allowedPhotographerIds);
      }

      const { data, error } = await query.range(from, to);

      if (error) throw error;

      if (data) {
        if (data.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }
        setImages(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, category, selectedLocation]);

  useEffect(() => {
    // Reset state when category changes
    setImages([]);
    setPage(0);
    setHasMore(true);
  }, [category, selectedLocation]);

  useEffect(() => {
    if (images.length === 0 && page === 0) {
      loadImages();
    }
  }, [images.length, page, loadImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          loadImages();
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => observer.disconnect();
  }, [loadImages, isLoading]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold capitalize">{category} Photography</h1>
        <LocationFilter 
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <div className="aspect-square relative">
              <img
                src={image.image_url}
                alt={image.title || "Photography"}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {image.title && <h3 className="font-semibold">{image.title}</h3>}
                {image.photographer_name && (
                  <p className="text-sm">by {image.photographer_name}</p>
                )}
                {image.description && (
                  <p className="text-sm mt-2">{image.description}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Loading indicator */}
      <div ref={loader} className="flex justify-center mt-8">
        {isLoading && (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        )}
      </div>
      
      {/* No more images message */}
      {!hasMore && images.length > 0 && (
        <p className="text-center text-gray-500 mt-8">
          No more images to load
        </p>
      )}
      
      {/* Empty state */}
      {!isLoading && images.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No images found for this category
        </p>
      )}
    </div>
  );
};