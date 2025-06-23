
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Grid3X3, LogIn, Camera, LogOut, Image, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Please fill in all fields",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First check Photographers table
      const { data: photographerData, error: photographerError } = await supabase
        .from("Photographers")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (!photographerError && photographerData) {
        // Found in Photographers table
        setIsAuthenticated(true);
        setIsPhotographer(true);
        setUserId(photographerData.id.toString());
        setIsSignInOpen(false);
        setEmail("");
        setPassword("");
        
        toast({
          title: "Signed in as Photographer",
          description: `Welcome back, ${photographerData.name}!`,
        });
        return;
      }

      // Check Clients table
      const { data: clientData, error: clientError } = await supabase
        .from("Clients")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (!clientError && clientData) {
        // Found in Clients table
        setIsAuthenticated(true);
        setIsPhotographer(false);
        setUserId(clientData.id.toString());
        setIsSignInOpen(false);
        setEmail("");
        setPassword("");
        
        toast({
          title: "Signed in as Client",
          description: `Welcome back, ${clientData.name}!`,
        });
        return;
      }

      // No match found
      toast({
        title: "Invalid credentials",
        description: "Email or password is incorrect",
        variant: "destructive",
      });

    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: "An error occurred during sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsPhotographer(false);
    setUserId("");
    setEmail("");
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
          <div className="flex items-center space-x-2" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
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
                      onClick={() => navigate(`/photographer/${userId}`)}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      My Portfolio
                    </Button>
                    <Button 
                      variant="outline" 
                      className="hover-scale border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => navigate(`/photographer/${userId}/manage`)}
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
              <div className="flex items-center gap-4">
                <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
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
                      <DialogTitle>Sign In</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                        onClick={handleSignIn}
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="default" 
                  className="hover-scale bg-primary text-white hover:bg-primary/90"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </div>
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
            <Link to="/discover" className="flex items-center text-gray-600 hover:text-primary transition-colors py-2">
              <Search className="w-4 h-4 mr-2" />
              Discover
            </Link>
            <Link to="/categories" className="flex items-center text-gray-600 hover:text-primary transition-colors py-2">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Categories
            </Link>
            <Link to="/photographers" className="flex items-center text-gray-600 hover:text-primary transition-colors py-2">
              <Camera className="w-4 h-4 mr-2" />
              Photographers
            </Link>
            {isAuthenticated && isPhotographer && (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate(`/photographer/${userId}`)}
                >
                  <Image className="w-4 h-4 mr-2" />
                  My Portfolio
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate(`/photographer/${userId}/manage`)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Portfolio
                </Button>
              </div>
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
              <div className="space-y-2 pt-2">
                <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
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
                      <DialogTitle>Sign In</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                        onClick={handleSignIn}
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="default" 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
