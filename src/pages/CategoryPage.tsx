import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";

const categoryImages = {
  weddings: [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552",
      title: "Beach Wedding",
      photographer: "Emma White"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
      title: "Garden Ceremony",
      photographer: "John Davis"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
      title: "Church Wedding",
      photographer: "Michael Brown"
    }
  ],
  portraits: [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      title: "Professional Headshot",
      photographer: "Lisa Chen"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      title: "Corporate Portrait",
      photographer: "David Kim"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      title: "Fashion Portrait",
      photographer: "Sophie Martin"
    }
  ]
};

export const CategoryPage = () => {
  const { category } = useParams();
  const images = categoryImages[category as keyof typeof categoryImages] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 capitalize">{category} Photography</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <div className="aspect-square relative">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-semibold">{image.title}</h3>
                <p className="text-sm">by {image.photographer}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};