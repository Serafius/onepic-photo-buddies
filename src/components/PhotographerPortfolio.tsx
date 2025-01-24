import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Package, Image, Camera } from "lucide-react";

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

interface Category {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

const staticCategories = [
  { 
    id: 1, 
    name: "Weddings", 
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    description: "Capture your special day",
    bookingMessage: "Book a wedding photography session",
  },
  { 
    id: 2, 
    name: "Portraits", 
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    description: "Professional headshots & portraits",
    bookingMessage: "Book a portrait session",
  },
  { 
    id: 3, 
    name: "Events", 
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    description: "Corporate & social events",
    bookingMessage: "Book an event photographer",
  },
  { 
    id: 4, 
    name: "Food", 
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    description: "Restaurant & culinary photography",
    bookingMessage: "Book a food photography session",
  }
];

export const PhotographerPortfolio = ({ photographerId }: { photographerId: string }) => {
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data: photographerData, error: photographerError } = await supabase
          .from("photographers")
          .select("*")
          .eq("id", photographerId)
          .single();

        if (photographerError) throw photographerError;
        setPhotographer(photographerData);

        const { data: imagesData, error: imagesError } = await supabase
          .from("portfolio_images")
          .select("*")
          .eq("photographer_id", photographerId);

        if (imagesError) throw imagesError;
        setImages(imagesData);

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("photographer_categories")
          .select("*")
          .eq("photographer_id", photographerId);

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);
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

  const handleCategoryClick = async (category: typeof staticCategories[0]) => {
    setMessage(category.bookingMessage);
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
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
      {/* Photographer Info Section */}
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
      </div>

      {/* Photography Packages Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-6 h-6" />
          <h2 className="text-2xl font-semibold">Photography Packages</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-lg">
                {category.name} - ${category.price}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">{category.description}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Categories Section */}
      <section className="mt-12 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Camera className="w-6 h-6" />
          <h2 className="text-2xl font-semibold">Book by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {staticCategories.map((category) => (
            <Card 
              key={category.id} 
              className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="relative aspect-square">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 text-white p-4 flex flex-col justify-end transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm mt-1 text-gray-200">{category.description}</p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking-section" className="mb-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Book a Session</h2>
        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message to your booking request..."
            className="w-full p-2 border rounded-md"
            rows={4}
          />
          <Button onClick={() => { /* Handle booking logic here */ }} className="w-full">
            Book Now
          </Button>
        </div>
      </section>

      {/* Portfolio Gallery Section */}
      <section className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Image className="w-6 h-6" />
          <h2 className="text-2xl font-semibold">Portfolio Gallery</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-square">
                <img
                  src={image.image_url}
                  alt={image.title || "Portfolio image"}
                  className="w-full h-full object-cover"
                />
                {(image.title || image.description) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {image.title && <h3 className="font-semibold">{image.title}</h3>}
                    {image.description && <p className="text-sm mt-1">{image.description}</p>}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
