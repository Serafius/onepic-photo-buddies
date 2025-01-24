import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const photos = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    likes: 234,
    comments: 12,
    author: "Sarah Smith",
    description: "Perfect morning light in my workspace",
    category: "Lifestyle",
    photographerId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    likes: 156,
    comments: 8,
    author: "John Doe",
    description: "Team collaboration at its finest",
    category: "Corporate"
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67",
    likes: 489,
    comments: 23,
    author: "Mike Wilson",
    description: "When code meets creativity",
    category: "Tech"
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
    likes: 345,
    comments: 15,
    author: "Emma Davis",
    description: "My favorite model taking a break",
    category: "Pets"
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    likes: 567,
    comments: 32,
    author: "Alex Johnson",
    description: "The beauty of technology",
    category: "Abstract"
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
    likes: 278,
    comments: 19,
    author: "Lisa Brown",
    description: "Nature's finest moment",
    category: "Nature"
  }
];

export const BrowsingGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8">
      <div className="space-y-6">
        {photos.map((photo) => (
          <Card 
            key={photo.id} 
            className="overflow-hidden hover-scale glass-card cursor-pointer"
            onClick={() => navigate(`/photographer/${photo.photographerId}`)}
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{photo.author}</h3>
                  <span className="text-sm text-gray-500">{photo.category}</span>
                </div>
              </div>
            </div>
            <div className="aspect-square relative">
              <img
                src={photo.imageUrl}
                alt={photo.description}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                    <Heart className="w-6 h-6" />
                    <span>{photo.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span>{photo.comments}</span>
                  </button>
                </div>
                <button className="text-gray-600 hover:text-primary transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600">
                <span className="font-medium text-gray-900">{photo.author}</span>{" "}
                {photo.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
