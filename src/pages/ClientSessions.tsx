import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, User, Clock } from "lucide-react";

interface BookingRequest {
  id: string;
  status: string;
  message: string;
  created_at: string;
  photographer: {
    name: string;
    location: string;
  };
  category: {
    name: string;
    price: number;
  };
}

export const ClientSessions = () => {
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
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          id,
          status,
          message,
          created_at,
          photographer:photographers (
            name,
            location
          ),
          category:photographer_categories (
            name,
            price
          )
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });

      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
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
      <h1 className="text-3xl font-bold mb-8">My Sessions</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No sessions found</p>
          <p className="text-sm text-gray-400">Book a photographer to see your sessions here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {booking.photographer?.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {booking.photographer?.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {booking.category?.name}
                    </span>
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
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  ${booking.category?.price}/hour
                </span>
                
                {booking.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => cancelBooking(booking.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};