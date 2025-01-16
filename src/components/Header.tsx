import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

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
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Discover</a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Categories</a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">How it Works</a>
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
            <a href="#" className="block text-gray-600 hover:text-primary transition-colors py-2">
              Discover
            </a>
            <a href="#" className="block text-gray-600 hover:text-primary transition-colors py-2">
              Categories
            </a>
            <a href="#" className="block text-gray-600 hover:text-primary transition-colors py-2">
              How it Works
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