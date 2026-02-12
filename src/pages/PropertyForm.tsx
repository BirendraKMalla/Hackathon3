import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";

const steps = ["Basic Info", "Features", "Location & Rent", "Images"];

const PropertyForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const [form, setForm] = useState({
    title: "", description: "", rooms: 1, bathrooms: 1, kitchen: 1,
    size_sqft: 0, floor_number: 0, is_top_floor: false,
    furnished: "unfurnished" as "furnished" | "semi-furnished" | "unfurnished",
    water: "limited" as "24hr" | "limited" | "tanker",
    electricity: true, wifi: false, parking: false,
    distance_highway_km: 0, owner_family_members: 0,
    owner_living: "not_living_there" as "living_there" | "not_living_there",
    preferred_tenant: "any" as "family" | "bachelor" | "female" | "married" | "any",
    rent_amount: 0, latitude: 27.7172, longitude: 85.3240,
  });

  useEffect(() => {
    if (isEdit) {
      supabase.from("properties").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({
          title: data.title, description: data.description || "", rooms: data.rooms,
          bathrooms: data.bathrooms, kitchen: data.kitchen, size_sqft: Number(data.size_sqft),
          floor_number: data.floor_number, is_top_floor: data.is_top_floor || false,
          furnished: data.furnished, water: data.water, electricity: data.electricity,
          wifi: data.wifi, parking: data.parking, distance_highway_km: Number(data.distance_highway_km),
          owner_family_members: data.owner_family_members || 0, owner_living: data.owner_living,
          preferred_tenant: data.preferred_tenant, rent_amount: Number(data.rent_amount),
          latitude: Number(data.latitude), longitude: Number(data.longitude),
        });
      });
    }
  }, [id, isEdit]);

  const set = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const payload = { ...form, owner_id: user.id };

      let propertyId = id;
      if (isEdit) {
        const { error } = await supabase.from("properties").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("properties").insert(payload).select("id").single();
        if (error) throw error;
        propertyId = data.id;
      }

      // Upload images
      for (const file of images) {
        const path = `${user.id}/${propertyId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage.from("property-images").upload(path, file);
        if (!uploadErr) {
          await supabase.from("property_images").insert({ property_id: propertyId, image_url: path });
        }
      }

      toast({ title: isEdit ? "Property Updated" : "Property Created" });
      navigate("/properties");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">{isEdit ? "Edit Property" : "Add New Property"}</h1>

        {/* Step indicator */}
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Step {step + 1}: {steps[step]}</p>

        <Card>
          <CardContent className="py-6 space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Spacious 2BHK in Thamel" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Rooms</label>
                    <Input type="number" value={form.rooms} onChange={(e) => set("rooms", +e.target.value)} min={1} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <Input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", +e.target.value)} min={1} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Kitchen</label>
                    <Input type="number" value={form.kitchen} onChange={(e) => set("kitchen", +e.target.value)} min={0} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Size (sqft)</label>
                    <Input type="number" value={form.size_sqft} onChange={(e) => set("size_sqft", +e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Floor Number</label>
                    <Input type="number" value={form.floor_number} onChange={(e) => set("floor_number", +e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_top_floor} onCheckedChange={(v) => set("is_top_floor", v)} />
                  <label className="text-sm">Top Floor</label>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Furnished Status</label>
                  <Select value={form.furnished} onValueChange={(v) => set("furnished", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Water Facility</label>
                  <Select value={form.water} onValueChange={(v) => set("water", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24hr">24 Hour</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="tanker">Tanker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Switch checked={form.electricity} onCheckedChange={(v) => set("electricity", v)} /><label className="text-sm">Electricity</label></div>
                  <div className="flex items-center gap-2"><Switch checked={form.wifi} onCheckedChange={(v) => set("wifi", v)} /><label className="text-sm">WiFi</label></div>
                  <div className="flex items-center gap-2"><Switch checked={form.parking} onCheckedChange={(v) => set("parking", v)} /><label className="text-sm">Parking</label></div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Distance from Highway (km)</label>
                  <Input type="number" value={form.distance_highway_km} onChange={(e) => set("distance_highway_km", +e.target.value)} step="0.1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Owner Family Members</label>
                    <Input type="number" value={form.owner_family_members} onChange={(e) => set("owner_family_members", +e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Owner Living Status</label>
                    <Select value={form.owner_living} onValueChange={(v) => set("owner_living", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="living_there">Living There</SelectItem>
                        <SelectItem value="not_living_there">Not Living There</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Preferred Tenant</label>
                  <Select value={form.preferred_tenant} onValueChange={(v) => set("preferred_tenant", v)}>
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
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Monthly Rent (Rs.)</label>
                  <Input type="number" value={form.rent_amount} onChange={(e) => set("rent_amount", +e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Latitude</label>
                    <Input type="number" step="0.0001" value={form.latitude} onChange={(e) => set("latitude", +e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Longitude</label>
                    <Input type="number" step="0.0001" value={form.longitude} onChange={(e) => set("longitude", +e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Tip: Use Google Maps to find your property's exact coordinates.</p>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Images</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                  />
                  <p className="text-xs text-muted-foreground">{images.length} image(s) selected</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Property" : "Create Property"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertyForm;
