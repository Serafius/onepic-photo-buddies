
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Grid3X3, Camera, Image, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SignInDialog } from "./SignInDialog";
import { ProfileIcon } from "./ProfileIcon";

interface MobileMenuProps {
  isAuthenticated: boolean;
  isPhotographer: boolean;
  userId: string;
  onSignIn: (isPhotographer: boolean, userId: string) => void;
  onSignOut: () => void;
}

export const MobileMenu = ({ 
  isAuthenticated, 
  isPhotographer, 
  userId, 
  onSignIn, 
  onSignOut 
}: MobileMenuProps) => {
  const navigate = useNavigate();

  return (
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
        <div className="pt-2">
          <ProfileIcon
            isAuthenticated={isAuthenticated}
            isPhotographer={isPhotographer}
            userId={userId}
            onSignOut={onSignOut}
          />
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          <SignInDialog onSignIn={onSignIn} />
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
  );
};
