import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PortfolioImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

interface Photographer {
  id: string;
  name: string;
  specialty: string | null;
  hourly_rate: number;
  location: string | null;
  rating: number | null;
  bio: string | null;
}

export const PhotographerPortfolio = ({ photographerId }: { photographerId: string }) => {
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Fetch photographer details
        const { data: photographerData, error: photographerError } = await supabase
          .from("photographers")
          .select("*")
          .eq("id", photographerId)
          .single();

        if (photographerError) throw photographerError;
        setPhotographer(photographerData);

        // Fetch portfolio images
        const { data: imagesData, error: imagesError } = await supabase
          .from("portfolio_images")
          .select("*")
          .eq("photographer_id", photographerId);

        if (imagesError) throw imagesError;
        setImages(imagesData);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        toast({
          title: "Error",
          description: "Failed to load portfolio",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [photographerId, toast]);

  const handleHire = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to hire a photographer",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("booking_requests")
        .insert({
          photographer_id: photographerId,
          client_id: session.user.id,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking request sent successfully",
      });
    } catch (error) {
      console.error("Error creating booking request:", error);
      toast({
        title: "Error",
        description: "Failed to send booking request",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!photographer) {
    return <div>Photographer not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{photographer.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-lg font-semibold">${photographer.hourly_rate}/hour</span>
          <span className="text-gray-600">{photographer.location}</span>
          {photographer.rating && (
            <span className="flex items-center">
              ⭐ {photographer.rating.toFixed(1)}
            </span>
          )}
        </div>
        {photographer.bio && <p className="text-gray-700 mb-4">{photographer.bio}</p>}
        <Button onClick={handleHire} className="btn-primary">
          Hire Professional
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden hover-scale">
            <img
              src={image.image_url}
              alt={image.title || "Portfolio image"}
              className="w-full h-64 object-cover"
            />
            {image.title && (
              <div className="p-4">
                <h3 className="font-semibold">{image.title}</h3>
                {image.description && (
                  <p className="text-gray-600 text-sm">{image.description}</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};