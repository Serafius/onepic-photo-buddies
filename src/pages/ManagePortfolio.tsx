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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPhotographerData();
      fetchCategories();
      fetchPortfolioImages();
    }
  }, [id]);

  const fetchPhotographerData = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPhotographer(data);
    } catch (error) {
      console.error('Error fetching photographer data:', error);
      toast({
        title: "Error",
        description: "Failed to load photographer data",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('photographer_categories')
        .select('*')
        .eq('photographer_id', id);

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
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('photographer_id', id)
        .order('created_at', { ascending: false });

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
    if (!imageFile || !id) {
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
      const filePath = `${id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

      const { error: dbError } = await supabase
        .from('portfolio_images')
        .insert({
          photographer_id: id,
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
      // Extract file path from URL
      const url = new URL(imageUrl);
      const filePath = url.pathname.split('/').slice(-2).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('portfolio')
        .remove([filePath]);

      if (storageError) console.warn('Storage deletion error:', storageError);

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
            <p className="text-2xl font-bold">{portfolioImages.length}</p>
            <p className="text-sm text-muted-foreground">Portfolio Images</p>
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
            <CardTitle>Current Portfolio ({portfolioImages.length} images)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {portfolioImages.length === 0 ? (
            <div className="text-center py-8">
              <Images className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No portfolio images yet</p>
              <p className="text-sm text-muted-foreground">Upload your first image to get started</p>
            </div>
          ) : (
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
                      {image.title && <h3 className="font-semibold text-sm">{image.title}</h3>}
                      {image.category_name && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {image.category_name}
                        </Badge>
                      )}
                      {image.description && (
                        <p className="text-xs mt-2 line-clamp-3">{image.description}</p>
                      )}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};