import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

const categories = [
  { id: 1, name: "Weddings", image: "/placeholder.svg" },
  { id: 2, name: "Portraits", image: "/placeholder.svg" },
  { id: 3, name: "Events", image: "/placeholder.svg" },
  { id: 4, name: "Food", image: "/placeholder.svg" },
  { id: 5, name: "Fashion", image: "/placeholder.svg" },
  { id: 6, name: "Nature", image: "/placeholder.svg" },
];

export const CategorySection = () => {
  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8 fade-in">Explore Categories</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-lg">
          <div className="flex space-x-4 p-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="inline-block w-[250px] hover-scale glass-card cursor-pointer"
              >
                <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
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