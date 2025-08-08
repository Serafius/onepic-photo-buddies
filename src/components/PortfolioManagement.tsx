
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Category {
  id: string;
  name: string;
  price: number;
}

interface PortfolioImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

export const PortfolioManagement = ({ photographerId }: { photographerId: string }) => {
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoryText, setCategoryText] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchPortfolioImages();
  }, [photographerId]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories for photographer:', photographerId);
      
      const { data, error } = await supabase
        .from('photographer_categories')
        .select('*')
        .eq('photographer_id', photographerId);

      if (error) throw error;
      console.log('Categories fetched:', data);
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
      console.log('Fetching portfolio images for photographer:', photographerId);
      
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('id, image_url, title, description, photographer_id, created_at')
        .eq('photographer_id', photographerId)
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
      const filePath = `${photographerId}/${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading to storage path:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      // Resolve author using legacy Photographers table via mapping
      let authorName: string | null = null;
      let authorAvatarUrl: string | null = null;

      const { data: mapping, error: mappingError } = await supabase
        .from('photographer_mappings')
        .select('new_int')
        .eq('old_uuid', photographerId)
        .single();
      if (mappingError) {
        console.warn('Could not fetch photographer mapping:', mappingError);
      }

      if (mapping?.new_int != null) {
        const { data: legacyPhotographer, error: legacyError } = await supabase
          .from('Photographers')
          .select('name, profile_picture_url')
          .eq('id', mapping.new_int)
          .single();
        if (legacyError) {
          console.warn('Could not fetch legacy Photographers row:', legacyError);
        }
        authorName = legacyPhotographer?.name || null;
        authorAvatarUrl = legacyPhotographer?.profile_picture_url || null;
      }

      if (!authorName) {
        authorName = 'Photographer';
      }
      if (!authorAvatarUrl) {
        authorAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;
      }

      console.log('Inserting to database with photographer_id and author fields:', photographerId, authorName, authorAvatarUrl);

      const categoryNameToSave =
        (categoryText && categoryText.trim().length > 0 ? categoryText.trim() : null) ||
        (selectedCategory
          ? (categories.find(c => c.id === selectedCategory)?.name ?? null)
          : null);

      const { error: dbError } = await supabase
        .from('portfolio_images')
        .insert({
          photographer_id: photographerId,
          image_url: publicUrl,
          title: imageTitle || null,
          description: imageDescription || null,
          category_name: categoryNameToSave,
          author_name: authorName,
          author_avatar_url: authorAvatarUrl
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      setImageTitle("");
      setImageDescription("");
      setImageFile(null);
      setCategoryText("");
      fetchPortfolioImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (image: PortfolioImage) => {
    try {
      // Try to delete from storage if it's in our bucket
      const match = image.image_url.match(/\/storage\/v1\/object\/public\/portfolio\/(.+)$/);
      const storagePath = match?.[1];
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('portfolio')
          .remove([storagePath]);
        if (storageError) {
          console.warn('Storage delete warning (continuing):', storageError);
        }
      }

      // Delete DB record
      const { error: dbError } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', image.id)
        .eq('photographer_id', photographerId);

      if (dbError) throw dbError;

      toast({
        title: 'Deleted',
        description: 'Image removed from your portfolio',
      });

      // Refresh
      fetchPortfolioImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Images className="h-6 w-6" />
            <CardTitle>Portfolio Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Image Title</Label>
            <Input
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="Enter image title"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              placeholder="Enter image description"
              rows={3}
            />
          </div>
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Category (Choose from your list)</Label>
              <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={category.id} id={category.id} />
                    <Label htmlFor={category.id}>{category.name} - ${category.price}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
          <div className="space-y-2">
            <Label>Category (Text Optional)</Label>
            <Input
              value={categoryText}
              onChange={(e) => setCategoryText(e.target.value)}
              placeholder="e.g., Wedding, Portraits, Landscapes"
            />
          </div>
          <div>
            <Label>Upload Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>
          <Button onClick={handleImageUpload} disabled={isUploading} className="w-full">
            <Upload className="mr-2 h-4 w-4" /> 
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Images className="h-6 w-6" />
            <CardTitle>Current Portfolio</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioImages.map((image) => (
              <div key={image.id} className="relative aspect-square group">
                <img
                  src={image.image_url}
                  alt={image.title || "Portfolio image"}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 text-white rounded-lg">
                  <div className="absolute top-2 right-2">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => handleDeleteImage(image)}
                      aria-label="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {image.title && <h3 className="font-semibold">{image.title}</h3>}
                  {image.description && <p className="text-sm mt-1">{image.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
