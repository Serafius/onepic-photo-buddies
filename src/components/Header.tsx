import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">OnePic</div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="hover:text-primary/80 transition-colors">Discover</a>
            <a href="#" className="hover:text-primary/80 transition-colors">Categories</a>
            <a href="#" className="hover:text-primary/80 transition-colors">How it Works</a>
            <Button variant="outline" className="hover-scale">Sign In</Button>
            <Button className="hover-scale">Join Now</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-down">
            <a href="#" className="block hover:text-primary/80 transition-colors py-2">Discover</a>
            <a href="#" className="block hover:text-primary/80 transition-colors py-2">Categories</a>
            <a href="#" className="block hover:text-primary/80 transition-colors py-2">How it Works</a>
            <div className="space-y-2 pt-2">
              <Button variant="outline" className="w-full">Sign In</Button>
              <Button className="w-full">Join Now</Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};