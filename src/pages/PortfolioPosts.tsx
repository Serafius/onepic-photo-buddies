import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit, 
  Heart, 
  Eye, 
  MapPin,
  Upload,
  X 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  created_at: string;
  likes_count: number;
  views_count: number;
  is_featured: boolean;
}

interface PostImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  order_index: number;
}

interface Photographer {
  id: string;
  name: string;
  specialty: string | null;
  location: string | null;
}

export const PortfolioPosts = () => {
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postImages, setPostImages] = useState<{ [postId: string]: PostImage[] }>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Create post form state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDescription, setNewPostDescription] = useState("");
  const [newPostLocation, setNewPostLocation] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotographerData();
    fetchPosts();
  }, []);

  const fetchPhotographerData = async () => {
    try {
      // Using the actual photographer ID that exists in the database
      const mockPhotographer = {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        name: "Test Photographer",
        specialty: "Portrait Photography",
        location: "New York, NY"
      };
      
      setPhotographer(mockPhotographer);
    } catch (error) {
      console.error('Error fetching photographer data:', error);
      toast({
        title: "Error",
        description: "Failed to load photographer data",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async () => {
    try {
      // Using the actual photographer ID that exists in the database
      const mockPhotographerId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

      const { data: postsData, error: postsError } = await supabase
        .from('portfolio_posts')
        .select('*')
        .eq('photographer_id', mockPhotographerId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Fetch images for each post
      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(post => post.id);
        const { data: imagesData, error: imagesError } = await supabase
          .from('post_images')
          .select('*')
          .in('post_id', postIds)
          .order('order_index', { ascending: true });

        if (imagesError) throw imagesError;

        // Group images by post_id
        const imagesByPost: { [postId: string]: PostImage[] } = {};
        imagesData?.forEach(image => {
          if (!imagesByPost[image.post_id]) {
            imagesByPost[image.post_id] = [];
          }
          imagesByPost[image.post_id].push(image);
        });
        setPostImages(imagesByPost);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio posts",
        variant: "destructive",
      });
    }
  };

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const createPost = async () => {
    if (!newPostTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a post title",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Using the actual photographer ID that exists in the database
      const mockPhotographerId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

      console.log('Creating post for photographer:', mockPhotographerId);

      // Create the post first
      const { data: postData, error: postError } = await supabase
        .from('portfolio_posts')
        .insert({
          photographer_id: mockPhotographerId,
          title: newPostTitle,
          description: newPostDescription || null,
          location: newPostLocation || null,
        })
        .select()
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw postError;
      }

      // Upload images and create post_images records
      const imageUploadPromises = selectedImages.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `posts/${postData.id}/${crypto.randomUUID()}.${fileExt}`;

        console.log('Uploading image to:', filePath);

        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(filePath);

        const { error: imageError } = await supabase
          .from('post_images')
          .insert({
            post_id: postData.id,
            image_url: publicUrl,
            order_index: index,
            alt_text: newPostTitle
          });

        if (imageError) {
          console.error('Image record creation error:', imageError);
          throw imageError;
        }
      });

      await Promise.all(imageUploadPromises);

      toast({
        title: "Success",
        description: "Portfolio post created successfully!",
      });

      // Reset form
      setNewPostTitle("");
      setNewPostDescription("");
      setNewPostLocation("");
      setSelectedImages([]);
      setIsCreateDialogOpen(false);
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: `Failed to create portfolio post: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  if (!photographer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading photographer data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Posts</h1>
          <p className="text-muted-foreground">
            {photographer.name} • {photographer.location}
          </p>
          {photographer.specialty && (
            <Badge variant="secondary" className="mt-2">
              {photographer.specialty}
            </Badge>
          )}
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Portfolio Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Post Title</Label>
                <Input
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={newPostDescription}
                  onChange={(e) => setNewPostDescription(e.target.value)}
                  placeholder="Describe your work..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Location (Optional)</Label>
                <Input
                  value={newPostLocation}
                  onChange={(e) => setNewPostLocation(e.target.value)}
                  placeholder="Where was this taken?"
                />
              </div>
              <div>
                <Label>Images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelection}
                  className="mb-2"
                />
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeSelectedImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                onClick={createPost} 
                disabled={isUploading || !newPostTitle.trim() || selectedImages.length === 0}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Creating Post..." : "Create Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first portfolio post to showcase your work
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const images = postImages[post.id] || [];
            const mainImage = images[0];
            
            return (
              <Card key={post.id} className="group overflow-hidden">
                <div className="relative aspect-square">
                  {mainImage ? (
                    <img
                      src={mainImage.image_url}
                      alt={mainImage.alt_text || post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {images.length > 1 && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      +{images.length - 1}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  {post.description && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  {post.location && (
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      {post.location}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views_count}
                      </div>
                    </div>
                    <div className="text-xs">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
