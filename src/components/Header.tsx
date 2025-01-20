import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Grid3X3, LogIn, Camera, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/e819116f-5c94-4a36-859f-0b22291310b0.png" 
              alt="OnePic Logo" 
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold text-primary">OnePic</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
                        <a href="#" className="block group">
                          <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                            Trending Photographers
                          </div>
                          <p className="text-sm text-gray-500">
                            Discover top-rated professionals
                          </p>
                        </a>
                        <a href="#" className="block group">
                          <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                            New Arrivals
                          </div>
                          <p className="text-sm text-gray-500">
                            Recently joined photographers
                          </p>
                        </a>
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
                          <a key={category.id} href="#" className="block group">
                            <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                              {category.name}
                            </div>
                            <p className="text-sm text-gray-500">
                              {category.description}
                            </p>
                          </a>
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
                        <a href="#" className="block group">
                          <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                            Featured Photographers
                          </div>
                          <p className="text-sm text-gray-500">
                            Discover our top photographers
                          </p>
                        </a>
                        <a href="#" className="block group">
                          <div className="font-medium mb-1 group-hover:text-primary transition-colors">
                            Browse All
                          </div>
                          <p className="text-sm text-gray-500">
                            Explore our entire photographer community
                          </p>
                        </a>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {isAuthenticated ? (
              <Button 
                variant="outline" 
                className="hover-scale border-primary text-primary hover:bg-primary hover:text-white"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="hover-scale border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Welcome to OnePic</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Auth
                      supabaseClient={supabase}
                      appearance={{ 
                        theme: ThemeSupa,
                        variables: {
                          default: {
                            colors: {
                              brand: 'rgb(var(--primary))',
                              brandAccent: 'rgb(var(--primary))',
                            },
                          },
                        },
                      }}
                      theme="light"
                      providers={[]}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-down">
            <a href="#" className="flex items-center text-gray-600 hover:text-primary transition-colors py-2">
              <Search className="w-4 h-4 mr-2" />
              Discover
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-primary transition-colors py-2">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Categories
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-primary transition-colors py-2">
              <Camera className="w-4 h-4 mr-2" />
              Photographers
            </a>
            <div className="space-y-2 pt-2">
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Welcome to OnePic</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <Auth
                        supabaseClient={supabase}
                        appearance={{ 
                          theme: ThemeSupa,
                          variables: {
                            default: {
                              colors: {
                                brand: 'rgb(var(--primary))',
                                brandAccent: 'rgb(var(--primary))',
                              },
                            },
                          },
                        }}
                        theme="light"
                        providers={[]}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};