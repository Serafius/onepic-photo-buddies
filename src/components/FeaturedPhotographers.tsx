import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const photographers = [
  {
    id: "moutasem-id", // We'll use a temporary ID for now
    name: "Moutasem Bellah",
    specialty: "Event Photography",
    rating: 5.0,
    image: "/lovable-uploads/71da2de9-90e4-4e69-a867-55b6102a0bdd.png",
    location: "Luxembourg, Alzette",
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Sarah Johnson",
    specialty: "Wedding Photography",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    location: "New York, NY",
  },
  {
    id: 2,
    name: "Michael Chen",
    specialty: "Portrait Photography",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    location: "Los Angeles, CA",
  },
  {
    id: 3,
    name: "Emma Davis",
    specialty: "Event Photography",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67",
    location: "Chicago, IL",
  },
];

export const FeaturedPhotographers = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-semibold mb-4 text-primary">Featured Photographers</h2>
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {photographers.map((photographer) => (
          <Card 
            key={photographer.id} 
            className="overflow-hidden hover:scale-102 transition-all duration-300 glass-card cursor-pointer border-0 shadow-md hover:shadow-lg"
            onClick={() => navigate(`/photographer/${photographer.id}`)}
          >
            <div className="p-4 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10">
                <img
                  src={photographer.image}
                  alt={photographer.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-primary">{photographer.name}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm">{photographer.rating}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-1 bg-primary/5">
                  {photographer.specialty}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {photographer.location}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};