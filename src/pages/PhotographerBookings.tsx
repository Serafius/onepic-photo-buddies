import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, User, Clock, Check, X } from "lucide-react";

interface BookingRequest {
  id: string;
  status: string;
  message: string;
  created_at: string;
  client: {
    name: string;
  };
  category?: {
    name: string;
    price: number;
  };
}

export const PhotographerBookings = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const authData = localStorage.getItem('authData');
    if (!authData) return;

    const { userId } = JSON.parse(authData);

    try {
      // Get photographer ID from the photographers table using user_id
      const { data: photographerData, error: photographerError } = await supabase
        .from('photographers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (photographerError) throw photographerError;

      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          id,
          status,
          message,
          created_at,
          client_id
        `)
        .eq('photographer_id', photographerData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Now fetch client names for each booking
      const bookingsWithClients = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: clientData } = await supabase
            .from('Clients')
            .select('name')
            .eq('id', parseInt(booking.client_id))
            .single();

          return {
            ...booking,
            client: { name: clientData?.name || 'Unknown Client' }
          };
        })
      );

      setBookings(bookingsWithClients);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load booking requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });

      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Booking Requests</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No booking requests found</p>
          <p className="text-sm text-gray-400">New booking requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {booking.client?.name || 'Anonymous Client'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              
              {booking.message && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Message:</span> {booking.message}
                  </p>
                </div>
              )}
              
              {booking.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateBookingStatus(booking.id, 'accepted')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateBookingStatus(booking.id, 'rejected')}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};