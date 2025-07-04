
import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MobileMenu } from "./MobileMenu";
import { Navigation } from "./Navigation";
import { UserActions } from "./UserActions";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleAuthUser(session.user.id);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await handleAuthUser(session.user.id);
        } else {
          setIsAuthenticated(false);
          setIsPhotographer(false);
          setUserId("");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthUser = async (authUserId: string) => {
    // Check if user is a photographer
    const { data: photographerData } = await supabase
      .from("photographers")
      .select("id")
      .eq("user_id", authUserId)
      .single();

    setIsAuthenticated(true);
    setIsPhotographer(!!photographerData);
    setUserId(authUserId);
  };

  const handleSignIn = async (isPhotographer: boolean, userId: string) => {
    // This will be handled by the auth state change listener
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
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
            <Navigation />
            <UserActions
              isAuthenticated={isAuthenticated}
              isPhotographer={isPhotographer}
              userId={userId}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
            />
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
          <MobileMenu
            isAuthenticated={isAuthenticated}
            isPhotographer={isPhotographer}
            userId={userId}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
          />
        )}
      </nav>
    </header>
  );
};
