
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Heart, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioManagement } from "@/components/PortfolioManagement";
import { getPhotographerUuidFromRouteId } from "@/utils/photographerIdMapping";

interface PortfolioPost {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  created_at: string;
  likes_count: number;
  views_count: number;
  is_featured: boolean;
  images: PostImage[];
}

interface PostImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  order_index: number;
}

export const ManagePortfolio = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolioPosts, setPortfolioPosts] = useState<PortfolioPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Get the actual photographer UUID from the route ID
  const photographerUuid = id ? getPhotographerUuidFromRouteId(id) : null;

  useEffect(() => {
    if (photographerUuid) {
      fetchPortfolioPosts();
    } else {
      console.error('Invalid photographer ID:', id);
      toast({
        title: "Error",
        description: "Invalid photographer ID",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [photographerUuid]);

  const fetchPortfolioPosts = async () => {
    if (!photographerUuid) return;

    try {
      console.log('Fetching portfolio posts for photographer UUID:', photographerUuid);
      
      // Fetch ONLY posts created by this photographer
      const { data: postsData, error: postsError } = await supabase
        .from('portfolio_posts')
        .select('*')
        .eq('photographer_id', photographerUuid)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      console.log('Portfolio posts fetched for current photographer:', postsData);

      if (postsData && postsData.length > 0) {
        // Fetch images for each post
        const postsWithImages = await Promise.all(
          postsData.map(async (post) => {
            const { data: imagesData, error: imagesError } = await supabase
              .from('post_images')
              .select('*')
              .eq('post_id', post.id)
              .order('order_index', { ascending: true });

            if (imagesError) {
              console.error('Error fetching images for post:', post.id, imagesError);
              return { ...post, images: [] };
            }

            return { ...post, images: imagesData || [] };
          })
        );

        setPortfolioPosts(postsWithImages);
      } else {
        setPortfolioPosts([]);
      }
    } catch (error) {
      console.error('Error fetching portfolio posts:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // First delete associated images
      const { error: imagesError } = await supabase
        .from('post_images')
        .delete()
        .eq('post_id', postId);

      if (imagesError) throw imagesError;

      // Then delete the post
      const { error: postError } = await supabase
        .from('portfolio_posts')
        .delete()
        .eq('id', postId);

      if (postError) throw postError;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      // Refresh the posts list
      fetchPortfolioPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!photographerUuid) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-lg text-muted-foreground">Invalid photographer ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Portfolio</h1>
      </div>

      {/* Portfolio Management Component */}
      <PortfolioManagement photographerId={photographerUuid} />

      {/* Portfolio Posts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Your Portfolio Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : portfolioPosts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No portfolio posts found. Create your first post to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {portfolioPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Images Section */}
                    <div className="relative">
                      {post.images.length > 0 ? (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={post.images[0].image_url}
                            alt={post.images[0].alt_text || post.title}
                            className="w-full h-full object-cover"
                          />
                          {post.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                              +{post.images.length - 1} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <p className="text-muted-foreground">No images</p>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-semibold">{post.title}</h3>
                          {post.is_featured && (
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                              Featured
                            </span>
                          )}
                        </div>
                        
                        {post.description && (
                          <p className="text-muted-foreground">{post.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {post.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{post.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes_count} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views_count} views</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
