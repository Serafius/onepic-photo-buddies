import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, ImagePlus } from "lucide-react";

interface BookingRequest {
  id: string;
  client_id: string;
  status: string;
  message: string | null;
  created_at: string;
}

export const PhotographerDashboard = ({ photographerId }: { photographerId: string }) => {
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [imageTitle, setImageTitle] = useState<string>("");
  const [imageDescription, setImageDescription] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPhotographerData = async () => {
      const { data, error } = await supabase
        .from("photographers")
        .select("*")
        .eq("id", photographerId)
        .single();

      if (error) {
        console.error("Error fetching photographer data:", error);
        return;
      }

      if (data) {
        setHourlyRate(data.hourly_rate.toString());
        setLocation(data.location || "");
        setBio(data.bio || "");
      }
    };

    const fetchBookingRequests = async () => {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .eq("photographer_id", photographerId);

      if (error) {
        console.error("Error fetching booking requests:", error);
        return;
      }

      setBookingRequests(data || []);
    };

    fetchPhotographerData();
    fetchBookingRequests();
  }, [photographerId]);

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from("photographers")
        .update({
          hourly_rate: parseFloat(hourlyRate),
          location,
          bio,
        })
        .eq("id", photographerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const uploadImage = async () => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${photographerId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("portfolio")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("portfolio_images")
        .insert({
          photographer_id: photographerId,
          image_url: publicUrl,
          title: imageTitle,
          description: imageDescription,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      setImageTitle("");
      setImageDescription("");
      setImageFile(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleBookingRequest = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from("booking_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      setBookingRequests(bookingRequests.map(request => 
        request.id === requestId ? { ...request, status } : request
      ));

      toast({
        title: "Success",
        description: `Booking request ${status}`,
      });
    } catch (error) {
      console.error("Error updating booking request:", error);
      toast({
        title: "Error",
        description: "Failed to update booking request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Enter your hourly rate"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about yourself and your photography style"
            />
          </div>
          <Button onClick={updateProfile}>Save Profile</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Add Portfolio Image</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="imageTitle">Image Title</Label>
            <Input
              id="imageTitle"
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="Enter image title"
            />
          </div>
          <div>
            <Label htmlFor="imageDescription">Image Description</Label>
            <Textarea
              id="imageDescription"
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              placeholder="Describe your image"
            />
          </div>
          <div>
            <Label htmlFor="imageFile">Image File</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button onClick={uploadImage}>
            <ImagePlus className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Booking Requests</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{request.message || "No message"}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  {request.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingRequest(request.id, "accepted")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingRequest(request.id, "rejected")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
};