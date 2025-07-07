
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, Settings, LogOut } from "lucide-react";
import { ProfileManagement } from "./ProfileManagement";

interface ProfileIconProps {
  isAuthenticated: boolean;
  isPhotographer: boolean;
  userId: string;
  onSignOut: () => void;
}

export const ProfileIcon = ({ isAuthenticated, isPhotographer, userId, onSignOut }: ProfileIconProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = () => {
    onSignOut();
    setIsProfileOpen(false);
  };

  return (
    <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Profile</p>
              <p className="text-xs text-gray-500">
                {isPhotographer ? "Photographer" : "Client"}
              </p>
            </div>
          </div>
          
          <ProfileManagement 
            userId={userId} 
            isPhotographer={isPhotographer}
            onClose={() => setIsProfileOpen(false)}
          />
          
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
