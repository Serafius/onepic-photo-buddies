import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Grid3X3 } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Define categories data within the Header component
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
              </NavigationMenuList>
            </NavigationMenu>

            <Button variant="outline" className="hover-scale border-primary text-primary hover:bg-primary hover:text-white">
              Sign In
            </Button>
            <Button className="hover-scale bg-primary hover:bg-primary/90">Join Now</Button>
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
            <div className="space-y-2 pt-2">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                Sign In
              </Button>
              <Button className="w-full bg-primary hover:bg-primary/90">Join Now</Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};