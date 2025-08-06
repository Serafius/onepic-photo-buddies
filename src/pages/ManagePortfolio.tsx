import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Images, Upload, Trash2, Edit, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  price: number;
  description: string | null;
}

interface PortfolioImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  category_name: string | null;
  created_at: string;
}

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

interface Photographer {
  id: string;
  name: string;
  specialty: string | null;
  location: string | null;
  bio: string | null;
  hourly_rate: number;
}

export const ManagePortfolio = () => {
  const { id } = useParams<{ id: string }>();
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [portfolioPosts, setPortfolioPosts] = useState<PortfolioPost[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Using the actual photographer ID that exists in the database
  const mockPhotographerId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

  useEffect(() => {
    fetchPhotographerData();
    fetchCategories();
    fetchPortfolioImages();
    fetchPortfolioPosts();
  }, []);

  const fetchPhotographerData = async () => {
    try {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .eq('id', mockPhotographerId)
        .single();

      if (error) throw error;
      setPhotographer(data);
    } catch (error) {
      console.error('Error fetching photographer data:', error);
      // Set mock data if not found
      setPhotographer({
        id: mockPhotographerId,
        name: "Test Photographer",
        specialty: "Portrait Photography",
        location: "New York, NY",
        bio: "Professional photographer",
        hourly_rate: 100
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('photographer_categories')
        .select('*')
        .eq('photographer_id', mockPhotographerId);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchPortfolioImages = async () => {
    try {
      console.log('Fetching portfolio images for photographer:', mockPhotographerId);
      
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('photographer_id', mockPhotographerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Portfolio images fetched:', data);
      setPortfolioImages(data || []);
    } catch (error) {
      console.error('Error fetching portfolio images:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio images",
        variant: "destructive",
      });
    }
  };

  const fetchPortfolioPosts = async () => {
    try {
      console.log('Fetching portfolio posts for photographer:', mockPhotographerId);
      
      // Fetch ONLY posts created by this photographer
      const { data: postsData, error: postsError } = await supabase
        .from('portfolio_posts')
        .select('*')
        .eq('photographer_id', mockPhotographerId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      console.log('Portfolio posts fetched for current photographer:', postsData);

      if (postsData && postsData.length > 0) {
        // Fetch images for each post
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

        // Combine posts with their images
        const postsWithImages: PortfolioPost[] = postsData.map(post => ({
          ...post,
          images: imagesByPost[post.id] || []
        }));

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
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${mockPhotographerId}/${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading to storage path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

      console.log('Inserting to database with photographer_id:', mockPhotographerId);

      const { error: dbError } = await supabase
        .from('portfolio_images')
        .insert({
          photographer_id: mockPhotographerId,
          image_url: publicUrl,
          title: imageTitle || null,
          description: imageDescription || null,
          category_name: selectedCategoryData?.name || null
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      setImageTitle("");
      setImageDescription("");
      setImageFile(null);
      setSelectedCategory("");
      fetchPortfolioImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      console.log('Deleting image:', imageId, imageUrl);
      
      // Extract file path from URL for user-uploaded images
      if (imageUrl.includes('supabase.co/storage')) {
        const url = new URL(imageUrl);
        const filePath = url.pathname.split('/').slice(-2).join('/');

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('portfolio')
          .remove([filePath]);

        if (storageError) console.warn('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });

      fetchPortfolioImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      console.log('Deleting post:', postId);
      
      // First, delete associated images from storage and database
      const postImages = portfolioPosts.find(post => post.id === postId)?.images || [];
      
      for (const image of postImages) {
        // Extract file path from URL for user-uploaded images
        if (image.image_url.includes('supabase.co/storage')) {
          try {
            const url = new URL(image.image_url);
            const filePath = url.pathname.split('/').slice(-2).join('/');
            
            // Delete from storage
            await supabase.storage
              .from('portfolio')
              .remove([filePath]);
          } catch (storageError) {
            console.warn('Storage deletion error:', storageError);
          }
        }
      }

      // Delete post images from database
      const { error: imagesError } = await supabase
        .from('post_images')
        .delete()
        .eq('post_id', postId);

      if (imagesError) console.warn('Error deleting post images:', imagesError);

      // Delete the post
      const { error: postError } = await supabase
        .from('portfolio_posts')
        .delete()
        .eq('id', postId);

      if (postError) throw postError;

      toast({
        title: "Success",
        description: "Portfolio post deleted successfully",
      });

      fetchPortfolioPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio post",
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

  const totalItems = portfolioImages.length + portfolioPosts.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Portfolio</h1>
        <p className="text-muted-foreground">
          {photographer.name} • {photographer.location}
        </p>
        {photographer.specialty && (
          <Badge variant="secondary" className="mt-2">
            {photographer.specialty}
          </Badge>
        )}
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Images className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{totalItems}</p>
            <p className="text-sm text-muted-foreground">Total Portfolio Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Edit className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Service Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">${photographer.hourly_rate}</p>
            <p className="text-sm text-muted-foreground">Hourly Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload New Image */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            <CardTitle>Add New Portfolio Image</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Image Title (Optional)</Label>
            <Input
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="Enter image title"
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              placeholder="Enter image description"
              rows={3}
            />
          </div>
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Service Category (Optional)</Label>
              <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={category.id} id={category.id} />
                      <Label htmlFor={category.id} className="flex-1">
                        {category.name} - ${category.price}
                        {category.description && (
                          <span className="text-sm text-muted-foreground block">
                            {category.description}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
          <div>
            <Label>Upload Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleImageUpload} 
            disabled={!imageFile || isUploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" /> 
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </CardContent>
      </Card>

      {/* Current Portfolio */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Images className="h-6 w-6" />
            <CardTitle>Your Portfolio ({totalItems} items)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {totalItems === 0 ? (
            <div className="text-center py-8">
              <Images className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No portfolio items yet</p>
              <p className="text-sm text-muted-foreground">Upload your first image or create a post to get started</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* User Uploaded Images */}
              {portfolioImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Uploads ({portfolioImages.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioImages.map((image) => (
                      <div key={image.id} className="relative aspect-square group bg-muted rounded-lg overflow-hidden">
                        <img
                          src={image.image_url}
                          alt={image.title || "Portfolio image"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 text-white flex flex-col justify-between">
                          <div>
                            {image.title && <h4 className="font-semibold text-sm">{image.title}</h4>}
                            {image.category_name && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {image.category_name}
                              </Badge>
                            )}
                            {image.description && (
                              <p className="text-xs mt-2 line-clamp-3">{image.description}</p>
                            )}
                            <p className="text-xs text-gray-300 mt-2">
                              {new Date(image.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(image.id, image.image_url)}
                            className="w-full mt-2"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Posts */}
              {portfolioPosts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Portfolio Posts ({portfolioPosts.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioPosts.map((post) => {
                      const mainImage = post.images[0];
                      
                      return (
                        <div key={post.id} className="relative aspect-square group bg-muted rounded-lg overflow-hidden">
                          {mainImage ? (
                            <img
                              src={mainImage.image_url}
                              alt={mainImage.alt_text || post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Images className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          {post.images.length > 1 && (
                            <Badge variant="secondary" className="absolute top-2 right-2">
                              +{post.images.length - 1}
                            </Badge>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 text-white flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-sm mb-1">{post.title}</h4>
                              {post.location && (
                                <p className="text-xs text-gray-300 mb-2">{post.location}</p>
                              )}
                              {post.description && (
                                <p className="text-xs line-clamp-3">{post.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <span>❤️ {post.likes_count}</span>
                                <span>👁️ {post.views_count}</span>
                              </div>
                              <p className="text-xs text-gray-300 mt-1">
                                {new Date(post.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full mt-2"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete Post
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
