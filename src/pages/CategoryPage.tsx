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
  photographer: {
    name: string;
  } | null;
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

      // Query portfolio images filtered by category and join with photographers table
      let query = supabase
        .from('portfolio_images')
        .select(`
          id,
          image_url,
          title,
          description,
          photographer:photographers (
            name,
            location
          )
        `)
        .eq('category_name', category?.toLowerCase()); // Filter by category

      // Add location filter if not "All Locations"
      if (selectedLocation !== "All Locations") {
        query = query.eq('photographer.location', selectedLocation);
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
  }, [page, isLoading, hasMore, category]);

  useEffect(() => {
    // Reset state when category changes
    setImages([]);
    setPage(0);
    setHasMore(true);
    loadImages();
  }, [category, selectedLocation]);

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
                {image.photographer?.name && (
                  <p className="text-sm">by {image.photographer.name}</p>
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