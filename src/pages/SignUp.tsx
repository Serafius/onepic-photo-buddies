
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const SignUp = () => {
  const [userType, setUserType] = useState<"photographer" | "client" | "">("");
  const [formData, setFormData] = useState({
    country: "",
    city: "",
    location: "",
    password: "",
    profession: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast({
        title: "Please select a user type",
        description: "Choose whether you want to sign up as a photographer or client.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.country || !formData.city || !formData.location || !formData.password) {
      toast({
        title: "Please fill all required fields",
        description: "All fields are required to create your account.",
        variant: "destructive",
      });
      return;
    }

    if (userType === "photographer" && !formData.profession) {
      toast({
        title: "Please enter your profession",
        description: "Profession is required for photographer accounts.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (userType === "photographer") {
        const { error } = await supabase
          .from("Photographers")
          .insert([{
            country: formData.country,
            city: formData.city,
            location: formData.location,
            password: formData.password,
            profession: formData.profession
          }]);

        if (error) throw error;

        toast({
          title: "Photographer account created!",
          description: "Your photographer account has been successfully created.",
        });
      } else {
        const { error } = await supabase
          .from("Clients")
          .insert([{
            country: formData.country,
            city: formData.city,
            location: formData.location,
            password: formData.password
          }]);

        if (error) throw error;

        toast({
          title: "Client account created!",
          description: "Your client account has been successfully created.",
        });
      }

      // Redirect to login page after successful registration
      navigate("/");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Error creating account",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/lovable-uploads/e819116f-5c94-4a36-859f-0b22291310b0.png" 
              alt="OnePic Logo" 
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold text-primary">OnePic</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join OnePic today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">I want to sign up as:</Label>
            <RadioGroup value={userType} onValueChange={(value) => setUserType(value as "photographer" | "client")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="photographer" id="photographer" />
                <Label htmlFor="photographer">Photographer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" />
                <Label htmlFor="client">Client</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Dynamic Form Fields */}
          {userType && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="Enter your country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter your specific location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>

                {userType === "photographer" && (
                  <div>
                    <Label htmlFor="profession" className="text-sm font-medium text-gray-700">Profession</Label>
                    <Input
                      id="profession"
                      type="text"
                      placeholder="e.g., Wedding Photographer, Portrait Photographer"
                      value={formData.profession}
                      onChange={(e) => handleInputChange("profession", e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : `Create ${userType} Account`}
              </Button>
            </>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
