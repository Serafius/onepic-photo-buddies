
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SignInDialogProps {
  onSignIn: (isPhotographer: boolean, userId: string) => void;
}

export const SignInDialog = ({ onSignIn }: SignInDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      // First, try to find user in Photographers table
      const { data: photographerData, error: photographerError } = await supabase
        .from("Photographers")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (photographerData && !photographerError) {
        // Found photographer
        onSignIn(true, photographerData.id.toString());
        setIsSignInOpen(false);
        setEmail("");
        setPassword("");
        
        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${photographerData.name}!`,
        });
        return;
      }

      // If not found in Photographers, try Clients table
      const { data: clientData, error: clientError } = await supabase
        .from("Clients")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (clientData && !clientError) {
        // Found client
        onSignIn(false, clientData.id.toString());
        setIsSignInOpen(false);
        setEmail("");
        setPassword("");
        
        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${clientData.name}!`,
        });
        return;
      }

      // No user found in either table
      toast({
        title: "Sign in failed",
        description: "Invalid email or password",
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

  return (
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
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSignIn();
                }
              }}
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
  );
};
