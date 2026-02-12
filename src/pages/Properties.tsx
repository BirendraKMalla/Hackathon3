import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, MapPin, Bed, Bath, Wifi, Car } from "lucide-react";

const Properties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProperties = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("properties")
      .select("*, property_images(*)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchProperties();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Properties</h1>
            <p className="text-muted-foreground">Manage your rental listings</p>
          </div>
          <Button onClick={() => navigate("/properties/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add Property
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <p>No properties yet. Add your first listing!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => (
              <Card key={prop.id} className="overflow-hidden">
                <div className="h-40 bg-muted flex items-center justify-center">
                  {prop.property_images?.[0] ? (
                    <img
                      src={supabase.storage.from("property-images").getPublicUrl(prop.property_images[0].image_url).data.publicUrl}
                      className="w-full h-full object-cover"
                      alt={prop.title}
                    />
                  ) : (
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm">{prop.title}</h3>
                    <Badge variant={prop.is_available ? "default" : "secondary"}>
                      {prop.is_available ? "Available" : "Rented"}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-primary">Rs. {Number(prop.rent_amount).toLocaleString()}/mo</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{prop.rooms}</span>
                    <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{prop.bathrooms}</span>
                    {prop.wifi && <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /></span>}
                    {prop.parking && <span className="flex items-center gap-1"><Car className="h-3 w-3" /></span>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/properties/edit/${prop.id}`)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(prop.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Properties;
