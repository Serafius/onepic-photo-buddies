import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  id: string;
  image_url: string;
  title: string;
  description: string;
  photographer: {
    name: string;
  };
  category_name: string;
}

export const BrowsingGrid = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [likedPhotos, setLikedPhotos] = useState<string[]>([]);
  const [photoData, setPhotoData] = useState<Photo[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio_images')
        .select(`
          id,
          image_url,
          title,
          description,
          category_name,
          photographer:photographers (
            name
          )
        `)
        .limit(20);

      if (error) throw error;

      if (data) {
        setPhotoData(data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (photoId: string) => {
    setLikedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      }
      return [...prev, photoId];
    });
  };

  const handleCommentClick = (photoId: string) => {
    setActiveCommentId(activeCommentId === photoId ? null : photoId);
    setCommentText("");
  };

  const handleSubmitComment = (photoId: string) => {
    if (!commentText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Comment added successfully",
    });

    setCommentText("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="space-y-6">
        {photoData.map((photo) => (
          <Card 
            key={photo.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{photo.photographer?.name || 'Unknown Photographer'}</h3>
                  <span className="text-sm text-gray-500 capitalize">{photo.category_name}</span>
                </div>
              </div>
            </div>
            <div className="aspect-square relative">
              <img
                src={photo.image_url}
                alt={photo.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLike(photo.id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      likedPhotos.includes(photo.id) 
                        ? "text-red-500 hover:text-red-600" 
                        : "text-gray-600 hover:text-red-500"
                    }`}
                  >
                    <Heart 
                      className={`w-6 h-6 ${likedPhotos.includes(photo.id) ? "fill-current" : ""}`} 
                    />
                  </button>
                  <button 
                    onClick={() => handleCommentClick(photo.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>
                <button className="text-gray-600 hover:text-primary transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600">
                <span className="font-medium text-gray-900">{photo.photographer?.name}</span>{" "}
                {photo.description}
              </p>
              
              {activeCommentId === photo.id && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleSubmitComment(photo.id)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};