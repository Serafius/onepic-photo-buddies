import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

const categories = [
  { 
    id: 1, 
    name: "Weddings", 
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    description: "Capture your special day"
  },
  { 
    id: 2, 
    name: "Portraits", 
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    description: "Professional headshots & portraits"
  },
  { 
    id: 3, 
    name: "Events", 
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    description: "Corporate & social events"
  },
  { 
    id: 4, 
    name: "Food", 
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    description: "Restaurant & culinary photography"
  },
  { 
    id: 5, 
    name: "Fashion", 
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67",
    description: "Fashion & lifestyle shoots"
  },
  { 
    id: 6, 
    name: "Nature", 
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    description: "Landscape & wildlife photography"
  },
];

export const CategorySection = () => {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary fade-in">Discover Categories</h2>
          <button className="text-primary hover:text-primary/80 transition-colors">
            View All
          </button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap rounded-lg">
          <div className="flex space-x-4 p-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="inline-block w-[300px] hover-scale glass-card cursor-pointer"
              >
                <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-primary">{category.name}</h3>
                  <p className="text-gray-600 mt-1">{category.description}</p>
                </div>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};