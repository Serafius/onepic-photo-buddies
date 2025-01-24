import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedPhotographers } from "@/components/FeaturedPhotographers";
import { BrowsingGrid } from "@/components/BrowsingGrid";
import { PhotographersDrawer } from "@/components/PhotographersDrawer";
import { ClientBookingRequests } from "@/components/ClientBookingRequests";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'client' | 'photographer' | null>(null);
  const [photographerId, setPhotographerId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        // For testing purposes, hardcode roles based on email
        if (session.user.email === 'photo@example.com') {
          setUserRole('photographer');
          // Fetch photographer ID
          const { data } = await supabase
            .from('photographers')
            .select('id')
            .eq('user_id', session.user.id)
            .single();
          if (data) {
            setPhotographerId(data.id);
          }
        } else if (session.user.email === 'client@example.com') {
          setUserRole('client');
        }
      } else {
        setUserRole(null);
        setPhotographerId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // For testing purposes
  useEffect(() => {
    // Simulate login for testing
    const email = 'photo@example.com'; // or 'client@example.com'
    const password = 'testpassword123';
    
    const loginUser = async () => {
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    };

    loginUser();
  }, []);

  if (userRole === 'photographer' && photographerId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <PhotographerDashboard photographerId={photographerId} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
            <div className="lg:col-span-4 space-y-8">
              <CategorySection />
              <FeaturedPhotographers />
            </div>
          </div>
        </div>
      </main>
      <PhotographersDrawer />
    </div>
  );
};

export default Index;