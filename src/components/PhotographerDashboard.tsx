
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { resolvePhotographerUuid } from "@/utils/resolvePhotographerId";

interface BookingRequest {
  id: string;
  client_name: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
}

interface Props {
  photographerId?: string;
}

export const PhotographerDashboard = ({ photographerId: propPhotographerId }: Props = {}) => {
  const { id } = useParams<{ id: string }>();
  const routeParam = propPhotographerId || id || "1";
  const [resolvedUuid, setResolvedUuid] = useState<string | null>(null);
  const photographerNumericId = /^\d+$/.test(routeParam) ? parseInt(routeParam) : null;
  const [hourlyRate, setHourlyRate] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [photographerName, setPhotographerName] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotographerData();
    (async () => {
      const uuid = await resolvePhotographerUuid(routeParam);
      setResolvedUuid(uuid);
      if (uuid) {
        await fetchBookingRequests();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParam]);

  const fetchPhotographerData = async () => {
    try {
      if (!photographerNumericId) {
        console.warn('No numeric photographer ID; skipping legacy Photographers fetch.');
        return;
      }
      const { data, error } = await supabase
        .from('Photographers')
        .select('*')
        .eq('id', photographerNumericId)
        .single();

      if (error) throw error;

      if (data) {
        setPhotographerName(data.name || '');
        setLocation(data.location || '');
        setBio(data.bio || '');
        setSpecialty(data.profession || '');
        setProfilePictureUrl(data.profile_picture_url || '');
        // Note: Photographers table doesn't have hourly_rate, you may need to add it or use a default
        setHourlyRate('150'); // Default for now
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
      if (!resolvedUuid) return;
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('photographer_id', resolvedUuid);

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
      if (!photographerNumericId) {
        toast({ title: "Error", description: "Invalid photographer ID", variant: "destructive" });
        return;
      }
      const { error } = await supabase
        .from('Photographers')
        .update({
          name: photographerName,
          location,
          bio,
          profession: specialty
        })
        .eq('id', photographerNumericId);

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

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile) {
      toast({
        title: "Error",
        description: "Please select a profile picture to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prefer the resolved UUID; fallback to numeric legacy id if present
      const fileExt = profilePictureFile.name.split('.').pop();
      const targetId = resolvedUuid || (photographerNumericId ? String(photographerNumericId) : null);

      if (!targetId) {
        toast({ title: "Error", description: "Invalid photographer ID", variant: "destructive" });
        return;
      }

      const filePath = `profiles/${targetId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, profilePictureFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      // Update modern UUID-based photographers table (avatar_url)
      if (resolvedUuid) {
        const { error: modernUpdateError } = await supabase
          .from('photographers')
          .update({ avatar_url: publicUrl })
          .eq('id', resolvedUuid);

        if (modernUpdateError) throw modernUpdateError;
      }

      // Also update legacy Photographers table if we have a numeric id
      if (photographerNumericId) {
        const { error: legacyUpdateError } = await supabase
          .from('Photographers')
          .update({ profile_picture_url: publicUrl })
          .eq('id', photographerNumericId);

        if (legacyUpdateError) {
          // Non-fatal: log and continue (legacy table may not always be used)
          console.warn('Legacy Photographers update warning:', legacyUpdateError);
        }
      }

      setProfilePictureUrl(publicUrl);
      setProfilePictureFile(null);

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
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
      if (!resolvedUuid) {
        toast({ title: "Error", description: "Invalid photographer ID", variant: "destructive" });
        return;
      }
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${resolvedUuid}/${crypto.randomUUID()}.${fileExt}`;

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
          photographer_id: resolvedUuid,
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
          <AvatarImage src={profilePictureUrl} />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{photographerName || 'Loading...'}</h1>
          <p className="text-gray-600">{location}</p>
          {specialty && <p className="text-sm text-gray-500">{specialty}</p>}
        </div>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profile Picture</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)}
              className="mb-2"
            />
            <Button onClick={handleProfilePictureUpload} disabled={!profilePictureFile} size="sm">
              Upload Profile Picture
            </Button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={photographerName}
              onChange={(e) => setPhotographerName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialty/Profession</label>
            <Input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g., Wedding Photographer, Portrait Photographer"
            />
          </div>
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
{resolvedUuid ? (
        <PortfolioManagement photographerId={resolvedUuid} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invalid photographer ID</CardTitle>
          </CardHeader>
          <CardContent>
            Please sign in or use a valid photographer link.
          </CardContent>
        </Card>
      )}

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
