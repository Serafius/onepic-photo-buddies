import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSessionContext } from "@supabase/auth-helpers-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useSessionContext();

  useEffect(() => {
    if (session) {
      navigate("/");
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }
  }, [session, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center space-y-2">
          <img 
            src="/lovable-uploads/e819116f-5c94-4a36-859f-0b22291310b0.png" 
            alt="OnePic Logo" 
            className="h-12 mx-auto"
          />
          <h1 className="text-2xl font-bold text-gray-900">Welcome to OnePic</h1>
          <p className="text-gray-500">Sign in to connect with photographers</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--primary))',
                  brandAccent: 'rgb(var(--primary))',
                },
              },
            },
          }}
          providers={["google"]}
        />
      </div>
    </div>
  );
};

export default Login;