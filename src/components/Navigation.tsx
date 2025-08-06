import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Camera, Grid3X3, Search, Calendar, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const categories = [
  {
    id: 1,
    name: "Weddings",
    description: "Capture your special day"
  },
  {
    id: 2,
    name: "Portraits",
    description: "Professional headshots & portraits"
  },
  {
    id: 3,
    name: "Events",
    description: "Corporate & social events"
  },
  {
    id: 4,
    name: "Food",
    description: "Restaurant & culinary photography"
  }
];

export const Navigation = () => {
  const [authData, setAuthData] = useState<{isAuthenticated: boolean, isPhotographer: boolean} | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const stored = localStorage.getItem('authData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthData({
          isAuthenticated: parsed.isAuthenticated,
          isPhotographer: parsed.isPhotographer
        });
      } else {
        setAuthData({ isAuthenticated: false, isPhotographer: false });
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-600 hover:text-primary transition-colors">
            <Search className="w-4 h-4 mr-2" />
            Discover
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px]">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/trending" className="block group">
                  <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                    Trending Photographers
                  </div>
                  <p className="text-sm text-gray-500">
                    Discover top-rated professionals
                  </p>
                </Link>
                <Link to="/new" className="block group">
                  <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                    New Arrivals
                  </div>
                  <p className="text-sm text-gray-500">
                    Recently joined photographers
                  </p>
                </Link>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-600 hover:text-primary transition-colors">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px] md:w-[500px]">
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.name.toLowerCase()}`}
                    className="block group"
                  >
                    <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </div>
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-600 hover:text-primary transition-colors">
            <Camera className="w-4 h-4 mr-2" />
            Photographers
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px]">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/featured" className="block group">
                  <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                    Featured Photographers
                  </div>
                  <p className="text-sm text-gray-500">
                    Discover our top photographers
                  </p>
                </Link>
                <Link to="/photographers" className="block group">
                  <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                    Browse All
                  </div>
                  <p className="text-sm text-gray-500">
                    Explore our entire photographer community
                  </p>
                </Link>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        {/* Conditional navigation items based on auth status */}
        {authData?.isAuthenticated && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-gray-600 hover:text-primary transition-colors">
              {authData.isPhotographer ? (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Bookings
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Sessions
                </>
              )}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-6 w-[300px]">
                {authData.isPhotographer ? (
                  <div className="space-y-2">
                    <Link to="/photographer/bookings" className="block group">
                      <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                        Manage Bookings
                      </div>
                      <p className="text-sm text-gray-500">
                        View and manage client booking requests
                      </p>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/client/sessions" className="block group">
                      <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                        My Sessions
                      </div>
                      <p className="text-sm text-gray-500">
                        View your photography sessions
                      </p>
                    </Link>
                  </div>
                )}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
