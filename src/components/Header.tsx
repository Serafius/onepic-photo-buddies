import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Grid3X3, LogIn, Camera, LogOut, Image, Settings } from "lucide-react";
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
import { Input } from "@/components/ui/input";

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
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Temporary login function for testing
  const handleTestLogin = () => {
    if (username === "photo" && password === "photo") {
      setIsAuthenticated(true);
      setIsPhotographer(true);
      toast({
        title: "Logged in as Photographer",
        description: "Welcome to the photographer view!",
      });
    } else if (username === "client" && password === "client") {
      setIsAuthenticated(true);
      setIsPhotographer(false);
      toast({
        title: "Logged in as Client",
        description: "Welcome to the client view!",
      });
    } else {
      toast({
        title: "Invalid credentials",
        description: "Please use the test credentials provided",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsPhotographer(false);
    setUsername("");
    setPassword("");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

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
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Logged in as: {isPhotographer ? "Photographer" : "Client"}
                </span>
                {isPhotographer && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="hover-scale border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => navigate(`/photographer/${user?.id}`)}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      My Portfolio
                    </Button>
                    <Button 
                      variant="outline" 
                      className="hover-scale border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => navigate(`/photographer/${user?.id}/manage`)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Portfolio
                    </Button>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="hover-scale border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
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
                    <DialogTitle>Test Login</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleTestLogin}
                    >
                      Login
                    </Button>
                    <div className="text-sm text-gray-500">
                      Test credentials:<br />
                      Photographer: username="photo" password="photo"<br />
                      Client: username="client" password="client"
                    </div>
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
            {isAuthenticated && isPhotographer && (
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate(`/photographer/${user?.id}`)}
              >
                <Image className="w-4 h-4 mr-2" />
                My Portfolio
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate(`/photographer/${user?.id}/manage`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Portfolio
              </Button>
            )}
            {isAuthenticated ? (
              <div className="space-y-2 pt-2">
                <div className="text-sm text-gray-600 py-2">
                  Logged in as: {isPhotographer ? "Photographer" : "Client"}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
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
                    <DialogTitle>Test Login</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleTestLogin}
                    >
                      Login
                    </Button>
                    <div className="text-sm text-gray-500">
                      Test credentials:<br />
                      Photographer: username="photo" password="photo"<br />
                      Client: username="client" password="client"
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
