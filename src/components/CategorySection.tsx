import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const categories = [
  { 
    id: 1, 
    name: "Weddings", 
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    description: "Capture your special day",
    path: "/category/weddings"
  },
  { 
    id: 2, 
    name: "Portraits", 
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    description: "Professional headshots & portraits",
    path: "/category/portraits"
  },
  { 
    id: 3, 
    name: "Events", 
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    description: "Corporate & social events",
    path: "/category/events"
  },
  { 
    id: 4, 
    name: "Food", 
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    description: "Restaurant & culinary photography",
    path: "/category/food"
  },
  { 
    id: 5, 
    name: "Nature", 
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    description: "Landscape and wildlife photography",
    path: "/category/nature"
  },
  { 
    id: 6, 
    name: "Wildlife", 
    image: "https://images.unsplash.com/photo-1518877593221-1f28583780b4",
    description: "Capture amazing wildlife moments",
    path: "/category/wildlife"
  }
];

export const CategorySection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary">Discover Categories</h2>
        <button className="text-primary hover:text-primary/80 transition-colors text-sm">
          View All
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="hover-scale glass-card cursor-pointer"
            onClick={() => navigate(category.path)}
          >
            <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
              <img
                src={category.image}
                alt={category.name}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-primary">{category.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{category.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};