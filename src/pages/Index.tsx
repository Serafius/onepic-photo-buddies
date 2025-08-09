import { BrowsingGrid } from "@/components/BrowsingGrid";
import { ClientBookingRequests } from "@/components/ClientBookingRequests";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";
import { PhotographersDrawer } from "@/components/PhotographersDrawer";
import { PhotographerList } from "@/components/PhotographersList";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'client' | 'photographer' | null>(null);
  const [photographerId, setPhotographerId] = useState<string | null>(null);

  type TopPhotographer = {
    id: string;
    name: string;
    image: string;
    rating: number;
    specialty: string;
    location: string;
  };
  const [topPhotographers, setTopPhotographers] = useState<TopPhotographer[]>([]);

  // Use the temporary auth state from Header component
  useEffect(() => {
    const checkAuth = () => {
      const tempAuthState = localStorage.getItem('tempAuthState');
      if (tempAuthState) {
        const { isAuthenticated, role } = JSON.parse(tempAuthState);
        setIsAuthenticated(isAuthenticated);
        setUserRole(role);

        // For testing, set a mock photographer ID when in photographer mode
        if (role === 'photographer') {
          setPhotographerId('mock-photographer-id');
        }
      }
    };

    // Check initial auth state
    checkAuth();

    // Listen for auth state changes
    window.addEventListener('tempAuthStateChange', checkAuth);

    return () => {
      window.removeEventListener('tempAuthStateChange', checkAuth);
    };
  }, []);

  useEffect(() => {
    const loadTop = async () => {
      const { data, error } = await supabase
        .from('Photographers')
        .select('id, name, profile_picture_url, profession, location, rating')
        .order('rating', { ascending: false })
        .limit(5);

      if (!error && data) {
        const mapped = data.map((p: any) => ({
          id: String(p.id),
          name: p.name ?? 'Unknown',
          image: p.profile_picture_url ?? '/placeholder.svg',
          rating: Number(p.rating ?? 0),
          specialty: p.profession ?? 'Photography',
          location: p.location ?? '',
        }));
        setTopPhotographers(mapped);
      }
    };
    loadTop();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20">
        <div className="container mx-auto px-4">
          {isAuthenticated && userRole === 'client' && (
            <div className="mb-8">
              <ClientBookingRequests />
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <BrowsingGrid />
            </div>
            <div className="lg:col-span-4 space-y-8 sticky top-24 h-fit">
              <PhotographerList
                photographers={topPhotographers}
                size="compact"
                title="Photographers"
              />
            </div>
          </div>
        </div>
      </main>
      <PhotographersDrawer />
    </div>
  );
};

export default Index;
