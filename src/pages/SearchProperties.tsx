import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { MapPin, Bed, Bath, Wifi, Car, Star, MessageSquare, Calendar } from "lucide-react";

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateMatchScore(property: any, prefs: any): number {
  let score = 0;
  let total = 0;

  if (prefs.rooms) { total++; if (property.rooms >= prefs.rooms) score++; }
  if (prefs.furnished_pref) { total++; if (property.furnished === prefs.furnished_pref) score++; }
  if (prefs.water_req) { total++; if (property.water === prefs.water_req) score++; }
  if (prefs.wifi_req) { total++; if (property.wifi === prefs.wifi_req) score++; }
  if (prefs.parking_req) { total++; if (property.parking === prefs.parking_req) score++; }
  if (prefs.max_rent) { total++; if (Number(property.rent_amount) <= Number(prefs.max_rent)) score++; }
  if (prefs.tenant_type && prefs.tenant_type !== "any") {
    total++;
    if (property.preferred_tenant === "any" || property.preferred_tenant === prefs.tenant_type) score++;
  }

  return total === 0 ? 0 : Math.round((score / total) * 100);
}

const SearchProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [maxRentFilter, setMaxRentFilter] = useState("");
  const [sortBy, setSortBy] = useState("match");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch tenant preferences
      const { data: prefData } = await supabase
        .from("tenant_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setPrefs(prefData);

      // Fetch all available properties
      const { data: propData } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (propData && prefData) {
        const filtered = propData.map((p) => {
          const dist = haversine(Number(prefData.preferred_lat), Number(prefData.preferred_lng), Number(p.latitude), Number(p.longitude));
          const matchScore = calculateMatchScore(p, prefData);
          return { ...p, distance: dist, matchScore };
        });

        // Filter by radius (auto-expand if empty)
        let radius = Number(prefData.search_radius_km) || 3;
        let inRadius = filtered.filter((p) => p.distance <= radius);
        if (inRadius.length === 0) {
          radius = 5;
          inRadius = filtered.filter((p) => p.distance <= radius);
        }
        if (inRadius.length === 0) inRadius = filtered; // show all if still empty

        setProperties(inRadius);
      } else {
        setProperties((propData || []).map((p) => ({ ...p, distance: 0, matchScore: 0 })));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const filtered = properties
    .filter((p) => !maxRentFilter || Number(p.rent_amount) <= Number(maxRentFilter))
    .sort((a, b) => sortBy === "match" ? b.matchScore - a.matchScore : sortBy === "rent" ? Number(a.rent_amount) - Number(b.rent_amount) : a.distance - b.distance);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Find Properties</h1>
          <p className="text-muted-foreground">Browse available rentals in Kathmandu</p>
        </div>

        {!prefs && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-4">
              <p className="text-sm">Set your preferences for better matching.</p>
              <Button size="sm" className="mt-2" onClick={() => navigate("/preferences")}>Set Preferences</Button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Max Rent (Rs.)"
            className="w-40"
            type="number"
            value={maxRentFilter}
            onChange={(e) => setMaxRentFilter(e.target.value)}
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="rent">Lowest Rent</SelectItem>
              <SelectItem value="distance">Nearest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading properties...</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No properties found matching your criteria.</CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((prop) => (
              <Card key={prop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-muted relative">
                  {prop.property_images?.[0] ? (
                    <img
                      src={supabase.storage.from("property-images").getPublicUrl(prop.property_images[0].image_url).data.publicUrl}
                      className="w-full h-full object-cover"
                      alt={prop.title}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full"><MapPin className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                  {prefs && (
                    <Badge className="absolute top-2 right-2 bg-primary">{prop.matchScore}% Match</Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-1">{prop.title}</h3>
                  <p className="text-lg font-bold text-primary">Rs. {Number(prop.rent_amount).toLocaleString()}/mo</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{prop.rooms}</span>
                    <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{prop.bathrooms}</span>
                    {prop.wifi && <Wifi className="h-3 w-3" />}
                    {prop.parking && <Car className="h-3 w-3" />}
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{prop.distance?.toFixed(1)}km</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/property/${prop.id}`)}>
                      View Details
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/messages?property=${prop.id}&owner=${prop.owner_id}`)}>
                      <MessageSquare className="h-3 w-3 mr-1" /> Contact
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

export default SearchProperties;
