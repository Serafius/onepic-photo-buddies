import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { PortfolioManagement } from "./PortfolioManagement";

interface BookingRequest {
  id: string;
  client_name: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
}

interface Props {
  photographerId: string;
}

export const PhotographerDashboard = ({ photographerId }: Props) => {
  const [hourlyRate, setHourlyRate] = useState("150");
  const [location, setLocation] = useState("New York, NY");
  const [bio, setBio] = useState("Professional photographer with 10 years of experience");
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [photographerName, setPhotographerName] = useState("Sarah SMITH");
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotographerData();
    fetchBookingRequests();
  }, [photographerId]);

  const fetchPhotographerData = async () => {
    try {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .eq('id', photographerId)
        .single();

      if (error) throw error;

      if (data) {
        setHourlyRate(data.hourly_rate.toString());
        setLocation(data.location || '');
        setBio(data.bio || '');
        setPhotographerName(data.name);
      }
    } catch (error) {
      console.error('Error fetching photographer data:', error);
      toast({
        title: "Error",
        description: "Failed to load photographer data",
        variant: "destructive",
      });
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('photographer_id', photographerId);

      if (error) throw error;

      if (data) {
        const formattedRequests = data.map(request => ({
          id: request.id,
          client_name: 'Client ' + request.id.substring(0, 4),  // Simplified client name
          date: new Date(request.created_at).toLocaleDateString(),
          status: request.status as 'pending' | 'accepted' | 'rejected',
          message: request.message || ''
        }));
        setBookingRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      toast({
        title: "Error",
        description: "Failed to load booking requests",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('photographers')
        .update({
          hourly_rate: parseFloat(hourlyRate),
          location,
          bio
        })
        .eq('id', photographerId);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
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

    try {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${photographerId}/${crypto.randomUUID()}.${fileExt}`;

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
          photographer_id: photographerId,
          image_url: publicUrl,
          title: imageTitle,
          description: imageDescription
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
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleBookingResponse = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: accept ? "Booking Accepted" : "Booking Rejected",
        description: `You have ${accept ? 'accepted' : 'rejected'} the booking request.`,
      });

      // Refresh booking requests
      fetchBookingRequests();
    } catch (error) {
      console.error('Error updating booking request:', error);
      toast({
        title: "Error",
        description: "Failed to update booking request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src="" />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{photographerName}</h1>
          <p className="text-gray-600">{location}</p>
        </div>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={updateProfile}>Update Profile</Button>
        </CardContent>
      </Card>

      {/* Portfolio Management Section */}
      <PortfolioManagement photographerId={photographerId} />

      {/* Booking Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.client_name}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{request.message}</TableCell>
                  <TableCell>{request.status}</TableCell>
                  <TableCell className="space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleBookingResponse(request.id, true)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBookingResponse(request.id, false)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
