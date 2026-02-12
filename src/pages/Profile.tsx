import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Upload } from "lucide-react";

const Profile = () => {
  const { user, profile, kycStatus, role, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile Updated" });
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/avatar-${Date.now()}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
    if (uploadError) {
      toast({ title: "Error", description: uploadError.message, variant: "destructive" });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    await refreshProfile();
    toast({ title: "Avatar Updated" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{fullName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-full cursor-pointer">
                  <Upload className="h-3 w-3 text-primary-foreground" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <h3 className="font-semibold">{profile?.full_name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">{role}</Badge>
                  <Badge className={kycStatus === "verified" ? "bg-accent" : "bg-warning"}>
                    KYC: {kycStatus || "None"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <Star className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">Trust Score:</span>
              <span className="text-lg font-bold">{profile?.trust_score || "0.0"}</span>
              <span className="text-xs text-muted-foreground">/ 5.0</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977..." />
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
