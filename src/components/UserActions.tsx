
import { Button } from "@/components/ui/button";
import { Image, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SignInDialog } from "./SignInDialog";
import { ProfileIcon } from "./ProfileIcon";

interface UserActionsProps {
  isAuthenticated: boolean;
  isPhotographer: boolean;
  userId: string;
  onSignIn: (isPhotographer: boolean, userId: string, displayName?: string, avatarUrl?: string) => void;
  onSignOut: () => void;
}

export const UserActions = ({ 
  isAuthenticated, 
  isPhotographer, 
  userId, 
  onSignIn, 
  onSignOut 
}: UserActionsProps) => {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return (
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
        <ProfileIcon
          isAuthenticated={isAuthenticated}
          isPhotographer={isPhotographer}
          userId={userId}
          onSignOut={onSignOut}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <SignInDialog onSignIn={onSignIn} />
      <Button 
        variant="default" 
        className="hover-scale bg-primary text-white hover:bg-primary/90"
        onClick={() => navigate("/signup")}
      >
        Sign Up
      </Button>
    </div>
  );
};
