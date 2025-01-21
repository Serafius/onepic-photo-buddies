import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedPhotographers } from "@/components/FeaturedPhotographers";
import { BrowsingGrid } from "@/components/BrowsingGrid";
import { PhotographersDrawer } from "@/components/PhotographersDrawer";
import { ClientBookingRequests } from "@/components/ClientBookingRequests";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4">
          {isAuthenticated && (
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