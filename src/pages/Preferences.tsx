import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Preferences = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(false);
  const [form, setForm] = useState({
    preferred_lat: 27.7172, preferred_lng: 85.3240, search_radius_km: 3,
    rooms: 1, furnished_pref: "" as "" | "furnished" | "semi-furnished" | "unfurnished", water_req: "" as "" | "24hr" | "limited" | "tanker",
    wifi_req: false, parking_req: false, max_rent: 50000, tenant_type: "any" as "family" | "bachelor" | "female" | "married" | "any",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("tenant_preferences").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setExisting(true);
        setForm({
          preferred_lat: Number(data.preferred_lat), preferred_lng: Number(data.preferred_lng),
          search_radius_km: Number(data.search_radius_km), rooms: data.rooms || 1,
          furnished_pref: data.furnished_pref || "", water_req: data.water_req || "",
          wifi_req: data.wifi_req || false, parking_req: data.parking_req || false,
          max_rent: Number(data.max_rent), tenant_type: data.tenant_type || "any",
        });
      }
    });
  }, [user]);

  const set = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const payload: any = {
      ...form,
      user_id: user.id,
      furnished_pref: form.furnished_pref || null,
      water_req: form.water_req || null,
    };

    const { error } = existing
      ? await supabase.from("tenant_preferences").update(payload).eq("user_id", user.id)
      : await supabase.from("tenant_preferences").insert(payload);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setExisting(true);
      toast({ title: "Preferences Saved" });
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>My Preferences</CardTitle>
            <CardDescription>Set your ideal rental requirements for better AI matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Preferred Latitude</label>
                <Input type="number" step="0.0001" value={form.preferred_lat} onChange={(e) => set("preferred_lat", +e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Preferred Longitude</label>
                <Input type="number" step="0.0001" value={form.preferred_lng} onChange={(e) => set("preferred_lng", +e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Search Radius (km)</label>
                <Input type="number" value={form.search_radius_km} onChange={(e) => set("search_radius_km", +e.target.value)} min={1} max={20} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Min Rooms</label>
                <Input type="number" value={form.rooms} onChange={(e) => set("rooms", +e.target.value)} min={1} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Furnished Preference</label>
              <Select value={form.furnished_pref} onValueChange={(v) => set("furnished_pref", v)}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="furnished">Furnished</SelectItem>
                  <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                  <SelectItem value="unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Water Requirement</label>
              <Select value={form.water_req} onValueChange={(v) => set("water_req", v)}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hr">24 Hour</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="tanker">Tanker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.wifi_req} onCheckedChange={(v) => set("wifi_req", v)} /><label className="text-sm">WiFi Required</label></div>
              <div className="flex items-center gap-2"><Switch checked={form.parking_req} onCheckedChange={(v) => set("parking_req", v)} /><label className="text-sm">Parking Required</label></div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Maximum Rent (Rs.)</label>
              <Input type="number" value={form.max_rent} onChange={(e) => set("max_rent", +e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tenant Type</label>
              <Select value={form.tenant_type} onValueChange={(v) => set("tenant_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="bachelor">Bachelor</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Saving..." : existing ? "Update Preferences" : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Preferences;
