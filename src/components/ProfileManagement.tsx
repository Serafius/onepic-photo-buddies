
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Camera, Settings } from "lucide-react";
import { CategoriesManagement } from "./CategoriesManagement";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  profile_picture_url: string;
  location: string;
  profession: string;
}

interface ProfileManagementProps {
  userId: string;
  isPhotographer: boolean;
  onClose: () => void;
}

export const ProfileManagement = ({ userId, isPhotographer, onClose }: ProfileManagementProps) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    bio: "",
    profile_picture_url: "",
    location: "",
    profession: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      const tableName = isPhotographer ? "Photographers" : "Clients";
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", parseInt(userId))
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          profile_picture_url: data.profile_picture_url || "",
          location: data.location || "",
          profession: data.profession || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return null;

    try {
      const fileExt = profileImage.name.split('.').pop();
      const filePath = `profiles/${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, profileImage, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      let imageUrl = profileData.profile_picture_url;
      
      if (profileImage) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const tableName = isPhotographer ? "Photographers" : "Clients";
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        profile_picture_url: imageUrl,
        location: profileData.location,
        ...(isPhotographer && { profession: profileData.profession })
      };

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", parseInt(userId));

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      setProfileImage(null);
      fetchProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">
            <Settings className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          {isPhotographer && (
            <TabsTrigger value="categories">Categories</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={profileData.profile_picture_url || "https://via.placeholder.com/80"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Label>Profile Picture</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                />
              </div>

              {isPhotographer && (
                <div>
                  <Label>Profession</Label>
                  <Input
                    value={profileData.profession}
                    onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <Button onClick={updateProfile} disabled={isLoading} className="w-full">
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isPhotographer && (
          <TabsContent value="categories">
            <CategoriesManagement photographerId={userId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
