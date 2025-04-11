import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient } from "@/hooks/useSupabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

const ProfilePage = () => {
  const { user, userDetails } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userDetails) {
      // Fix the property name from profileDescription to name:
      const { name, avatarUrl, role, planType } = userDetails;
      setFormData({
        name: name || "",
        email: user?.email || "",
        avatarUrl: avatarUrl || "",
      });
    }
  }, [user, userDetails]);

  const handleInputChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabaseClient
        .from("users")
        .update({
          name: formData.name,
          avatar_url: formData.avatarUrl,
        })
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={formData.avatarUrl} alt={formData.name} />
              <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">{formData.name}</h4>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Your email address"
              value={formData.email}
              disabled
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              placeholder="URL to your avatar image"
              value={formData.avatarUrl}
              onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            {/* And also update the reference later in the code */}
            <Textarea 
              id="description"
              placeholder="Tell us about yourself"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div>
            <Button onClick={handleUpdateProfile} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
