
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const categories = [
  { 
    id: 1, 
    name: "weddings", 
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    description: "Capture your special day",
    path: "/category/weddings"
  },
  { 
    id: 2, 
    name: "portraits", 
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    description: "Professional headshots & portraits",
    path: "/category/portraits"
  },
  { 
    id: 3, 
    name: "events", 
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    description: "Corporate & social events",
    path: "/category/events"
  },
  { 
    id: 4, 
    name: "food", 
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    description: "Restaurant & culinary photography",
    path: "/category/food"
  }
];

export const CategorySection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${category}`);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary">Discover Categories</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="hover-scale glass-card cursor-pointer"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
              <img
                src={category.image}
                alt={category.name}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-primary capitalize">{category.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{category.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
