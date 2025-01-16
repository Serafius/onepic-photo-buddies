import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2 } from "lucide-react";

const photos = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    likes: 234,
    comments: 12,
    author: "Sarah Smith",
    description: "Perfect morning light"
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    likes: 156,
    comments: 8,
    author: "John Doe",
    description: "Tech vibes"
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    likes: 489,
    comments: 23,
    author: "Mike Wilson",
    description: "Working from anywhere"
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    likes: 345,
    comments: 15,
    author: "Emma Davis",
    description: "Code life"
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
    likes: 567,
    comments: 32,
    author: "Alex Johnson",
    description: "Team meeting"
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    likes: 278,
    comments: 19,
    author: "Lisa Brown",
    description: "Remote work setup"
  }
];

export const BrowsingGrid = () => {
  return (
    <section className="py-12">
      <div className="container px-4">
        <h2 className="text-2xl font-bold mb-8 text-primary">Explore Photos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover-scale glass-card">
              <div className="aspect-square relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.description}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{photo.author}</h3>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                      <Heart className="w-5 h-5" />
                      <span>{photo.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span>{photo.comments}</span>
                    </button>
                    <button className="text-gray-600 hover:text-primary transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600">{photo.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};