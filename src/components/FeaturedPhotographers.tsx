import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const photographers = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialty: "Wedding Photography",
    rating: 4.9,
    image: "/placeholder.svg",
    location: "New York, NY",
  },
  {
    id: 2,
    name: "Michael Chen",
    specialty: "Portrait Photography",
    rating: 4.8,
    image: "/placeholder.svg",
    location: "Los Angeles, CA",
  },
  {
    id: 3,
    name: "Emma Davis",
    specialty: "Event Photography",
    rating: 4.7,
    image: "/placeholder.svg",
    location: "Chicago, IL",
  },
];

export const FeaturedPhotographers = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8 fade-in">Featured Photographers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
          {photographers.map((photographer) => (
            <Card key={photographer.id} className="overflow-hidden hover-scale glass-card">
              <div className="aspect-[3/2] relative">
                <img
                  src={photographer.image}
                  alt={photographer.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{photographer.name}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm">{photographer.rating}</span>
                  </div>
                </div>
                <Badge variant="secondary">{photographer.specialty}</Badge>
                <p className="text-sm text-muted-foreground">{photographer.location}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};