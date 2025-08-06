import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, Upload } from "lucide-react";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (photographerId) {
      fetchCategories();
      fetchPortfolioImages();
    }
  }, [photographerId]);

  const fetchCategories = async () => {
    try {
      // Get current photographer UUID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: photographer } = await supabase
        .from('photographers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!photographer) return;

      const { data, error } = await supabase
        .from('photographer_categories')
        .select('*')
        .eq('photographer_id', photographer.id);

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
      // Get current photographer UUID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: photographer } = await supabase
        .from('photographers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!photographer) return;

      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('photographer_id', photographer.id);

      if (error) throw error;
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
      // Get current photographer UUID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload images",
          variant: "destructive",
        });
        return;
      }

      const { data: photographer } = await supabase
        .from('photographers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!photographer) {
        toast({
          title: "Error",
          description: "Photographer profile not found",
          variant: "destructive",
        });
        return;
      }

      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${photographer.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('portfolio_images')
        .insert({
          photographer_id: photographer.id,
          image_url: publicUrl,
          title: imageTitle || null,
          description: imageDescription || null
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      setImageTitle("");
      setImageDescription("");
      setImageFile(null);
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
              <Label>Category (Optional)</Label>
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