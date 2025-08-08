
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

interface Photo {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
  category_name: string | null;
  photographer_id: string | null;
  photographer_int_id: number | null;
  photographer_name: string | null;
  photographer_profile_url: string | null;
}

const categoryOrder = ["events", "portraits", "food", "weddings"];

export const BrowsingGrid = ({ photographerId }: { photographerId?: string }) => {
  const { category } = useParams();
  const { toast } = useToast();
  const [likedPhotos, setLikedPhotos] = useState<string[]>([]);
  const [photoData, setPhotoData] = useState<Photo[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from localStorage 
    const authData = localStorage.getItem('authData');
    if (authData) {
      const { userId } = JSON.parse(authData);
      setAuthUserId(userId);
    }
    
    fetchPhotos();
    if (authUserId) {
      fetchUserLikes();
    }
    console.log("Current category:", category);
  }, [category, authUserId, photographerId]);

  const fetchUserLikes = async () => {
    if (!authUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('image_id')
        .eq('user_id', authUserId);

      if (error) throw error;
      
      if (data) {
        setLikedPhotos(data.map(like => like.image_id));
      }
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('v_portfolio_images')
        .select(`
          id,
          image_url,
          title,
          description,
          category_name,
          photographer_id,
          photographer_int_id,
          photographer_name,
          photographer_profile_url,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.ilike('category_name', `%${category}%`);
      }
      if (photographerId) {
        const isUuid = photographerId.includes('-');
        query = isUuid
          ? query.eq('photographer_id', photographerId)
          : query.eq('photographer_int_id', Number(photographerId));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        console.log('Fetched data:', data);
        
        // Group photos by category
        // Safely group photos by known categories (ignore null/unknown)
        const photosByCategory: { [key: string]: Photo[] } = {};
        const categorized: Photo[] = data.filter(photo => {
          const cat = (photo.category_name || '').toLowerCase();
          return categoryOrder.includes(cat);
        });
        const uncategorized: Photo[] = data.filter(photo => {
          const cat = (photo.category_name || '').toLowerCase();
          return !categoryOrder.includes(cat);
        });
        categoryOrder.forEach(cat => {
          photosByCategory[cat] = categorized.filter(photo => (photo.category_name || '').toLowerCase() === cat);
        });

        // Interleave photos from different categories, then append the rest
        const interleaved: Photo[] = [];
        const maxLength = Math.max(0, ...Object.values(photosByCategory).map(arr => arr.length));
        for (let i = 0; i < maxLength; i++) {
          for (const cat of categoryOrder) {
            if (photosByCategory[cat][i]) {
              interleaved.push(photosByCategory[cat][i]);
            }
          }
        }

        const finalData = interleaved.length ? [...interleaved, ...uncategorized] : data;
        setPhotoData(finalData);
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

  const handleLike = async (photoId: string) => {
    if (!authUserId) {
      toast({
        title: "Error",
        description: "Please sign in to like photos",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (likedPhotos.includes(photoId)) {
        // Remove like
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', authUserId)
          .eq('image_id', photoId);
        
        setLikedPhotos(prev => prev.filter(id => id !== photoId));
        toast({
          title: "Success",
          description: "Photo unliked",
        });
      } else {
        // Add like
        await supabase
          .from('user_likes')
          .insert({
            user_id: authUserId,
            image_id: photoId
          });
        
        setLikedPhotos(prev => [...prev, photoId]);
        toast({
          title: "Success", 
          description: "Photo liked",
        });
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
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

  if (!isLoading && photoData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">No photos found{category ? ` in ${category} category` : ''}.</p>
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
{(photo.photographer_name || photo.photographer_profile_url) && (
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  {photo.photographer_profile_url && (
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={photo.photographer_profile_url}
                        alt={photo.photographer_name || 'Photographer profile'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div>
                    {photo.photographer_name && (
                      <h3 className="font-medium">{photo.photographer_name}</h3>
                    )}
                    <span className="text-sm text-gray-500 capitalize">{(photo.category_name || 'uncategorized')}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="aspect-square relative">
              <img
                src={photo.image_url}
                alt={photo.title || 'Portfolio image'}
                className="object-cover w-full h-full"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                }}
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
                {photo.photographer_name && (
                  <>
                    <span className="font-medium text-gray-900">{photo.photographer_name}</span>{" "}
                  </>
                )}
                {!photo.photographer_name && photo.title && (
                  <>
                    <span className="font-medium text-gray-900">{photo.title}</span>{" "}
                  </>
                )}
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
