import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileMenu } from "./MobileMenu";
import { Navigation } from "./Navigation";
import { UserActions } from "./UserActions";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/utils/authCleanup";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async (email?: string, uid?: string) => {
      if (!email && !uid) {
        setIsPhotographer(false);
        return;
      }
      try {
        const emailLc = email?.toLowerCase();
        const [legacyRes, modernRes] = await Promise.all([
          emailLc
            ? supabase.from('Photographers').select('id').eq('email', emailLc).maybeSingle()
            : Promise.resolve({ data: null }),
          uid
            ? supabase.from('photographers').select('id').eq('user_id', uid).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);
        const legacy = (legacyRes as any)?.data;
        const modern = (modernRes as any)?.data;
        setIsPhotographer(!!(legacy?.id || modern?.id));
      } catch {
        setIsPhotographer(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? "";
      const email = session?.user?.email ?? undefined;
      setIsAuthenticated(!!session);
      setUserId(uid);
      // Defer any Supabase reads to avoid potential deadlocks
      setTimeout(() => checkRole(email, uid), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? "";
      const email = session?.user?.email ?? undefined;
      setIsAuthenticated(!!session);
      setUserId(uid);
      setTimeout(() => checkRole(email, uid), 0);
    });

    // Backward compatibility: fall back to legacy localStorage state if no Supabase session
    const authData = localStorage.getItem('authUser');
    if (authData) {
      try {
        const { isPhotographer: storedIsPhotographer, userId: storedUserId } = JSON.parse(authData);
        if (!isAuthenticated) {
          setIsAuthenticated(true);
        }
        setIsPhotographer(!!storedIsPhotographer);
        setUserId(storedUserId || "");
      } catch {}
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (isPhotographer: boolean, userId: string) => {
    // Keep quick UI feedback, but source of truth is Supabase session
    setIsAuthenticated(true);
    setIsPhotographer(isPhotographer);
    setUserId(userId);
  };

  const handleSignOut = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {}
    } finally {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      // Full reload to ensure a clean state
      window.location.href = "/";
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
