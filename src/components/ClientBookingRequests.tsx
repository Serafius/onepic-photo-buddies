import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, CircleX, Circle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface BookingRequest {
  id: string;
  photographer: {
    name: string;
    hourly_rate: number;
    location: string | null;
  };
  status: string;
  created_at: string;
  message: string | null;
}

export const ClientBookingRequests = () => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('booking_requests')
          .select(`
            id,
            status,
            created_at,
            message,
            photographers (
              name,
              hourly_rate,
              location
            )
          `)
          .eq('client_id', session.user.id);

        if (error) throw error;
        
        // Transform the data to match our interface
        const transformedData: BookingRequest[] = (data || []).map(item => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          message: item.message,
          photographer: item.photographers // Rename photographers to photographer
        }));

        setRequests(transformedData);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: "Error",
          description: "Failed to load booking requests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="text-green-500" />;
      case 'rejected':
        return <CircleX className="text-red-500" />;
      default:
        return <Circle className="text-yellow-500" />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Booking Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No booking requests yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photographer</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.photographer.name}</TableCell>
                <TableCell>${request.photographer.hourly_rate}/hour</TableCell>
                <TableCell>{request.photographer.location || 'N/A'}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};