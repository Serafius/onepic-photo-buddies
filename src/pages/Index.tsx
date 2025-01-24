import { Header } from "@/components/Header";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedPhotographers } from "@/components/FeaturedPhotographers";
import { BrowsingGrid } from "@/components/BrowsingGrid";
import { PhotographersDrawer } from "@/components/PhotographersDrawer";
import { ClientBookingRequests } from "@/components/ClientBookingRequests";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";
import { useEffect, useState } from "react";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'client' | 'photographer' | null>(null);
  const [photographerId, setPhotographerId] = useState<string | null>(null);

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
            <div className="lg:col-span-4 space-y-8 sticky top-24 h-fit">
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
