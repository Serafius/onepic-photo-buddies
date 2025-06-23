
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

interface Category {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface CategoriesManagementProps {
  photographerId: string;
}

export const CategoriesManagement = ({ photographerId }: CategoriesManagementProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    price: "",
    description: ""
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, [photographerId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("photographer_categories")
        .select("*")
        .eq("photographer_id", photographerId);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const addCategory = async () => {
    if (!newCategory.name || !newCategory.price) {
      toast({
        title: "Error",
        description: "Please fill in name and price",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("photographer_categories")
        .insert({
          photographer_id: photographerId,
          name: newCategory.name,
          price: parseFloat(newCategory.price),
          description: newCategory.description
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category added successfully",
      });

      setNewCategory({ name: "", price: "", description: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("photographer_categories")
        .update({
          name: editingCategory.name,
          price: editingCategory.price,
          description: editingCategory.description
        })
        .eq("id", editingCategory.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("photographer_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Service Categories & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Category */}
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Add New Category</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Category Name</Label>
                <Input
                  placeholder="e.g., Weddings, Events"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Price per Hour ($)</Label>
                <Input
                  type="number"
                  placeholder="150"
                  value={newCategory.price}
                  onChange={(e) => setNewCategory({ ...newCategory, price: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this service"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                rows={2}
              />
            </div>
            <Button onClick={addCategory} disabled={isLoading} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Existing Categories */}
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="p-4 border rounded-lg">
                {editingCategory?.id === category.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Category Name</Label>
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Price per Hour ($)</Label>
                        <Input
                          type="number"
                          value={editingCategory.price}
                          onChange={(e) => setEditingCategory({ ...editingCategory, price: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={updateCategory} disabled={isLoading}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingCategory(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{category.name}</h5>
                      <p className="text-sm text-gray-600">${category.price}/hour</p>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
