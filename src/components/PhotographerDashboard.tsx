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
import { supabase } from "@/integrations/supabase/client";

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
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: '1',
      client_name: 'John Doe',
      date: '2024-02-01',
      status: 'pending',
      message: 'Wedding photography request'
    },
    // Add more mock booking requests as needed
  ]);
  const { toast } = useToast();

  const updateProfile = async () => {
    // For now, just show a success toast
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
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

    // For now, just show a success toast
    toast({
      title: "Image Uploaded",
      description: "Your image has been successfully uploaded.",
    });

    // Clear form
    setImageTitle("");
    setImageDescription("");
    setImageFile(null);
  };

  const handleBookingResponse = (requestId: string, accept: boolean) => {
    setBookingRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: accept ? 'accepted' : 'rejected' }
          : request
      )
    );

    toast({
      title: accept ? "Booking Accepted" : "Booking Rejected",
      description: `You have ${accept ? 'accepted' : 'rejected'} the booking request.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Section */}
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

      {/* Portfolio Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add to Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image Title</label>
            <Input
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button onClick={handleImageUpload}>Upload Image</Button>
        </CardContent>
      </Card>

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