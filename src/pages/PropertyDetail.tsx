import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Bed, Bath, Wifi, Car, Droplets, Zap, Home, Users, Star, MessageSquare, Calendar } from "lucide-react";

const PropertyDetail = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("id", id)
        .single();
      if (data) {
        setProperty(data);
        setImages(
          (data.property_images || []).map((img: any) =>
            supabase.storage.from("property-images").getPublicUrl(img.image_url).data.publicUrl
          )
        );
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleBooking = async () => {
    if (!user || !property) return;
    const { error } = await supabase.from("bookings").insert({
      property_id: property.id,
      tenant_id: user.id,
      owner_id: property.owner_id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Booking Requested", description: "The owner will review your request." });
  };

  if (loading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;
  if (!property) return <DashboardLayout><p>Property not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Image carousel */}
        {images.length > 0 && (
          <div className="px-10">
            <Carousel>
              <CarouselContent>
                {images.map((url, i) => (
                  <CarouselItem key={i}>
                    <img src={url} alt={`Property ${i + 1}`} className="w-full h-64 object-cover rounded-lg" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <p className="text-lg font-bold text-primary mt-1">Rs. {Number(property.rent_amount).toLocaleString()}/month</p>
          </div>
          <Badge variant={property.is_available ? "default" : "secondary"}>
            {property.is_available ? "Available" : "Rented"}
          </Badge>
        </div>

        {property.description && (
          <p className="text-muted-foreground">{property.description}</p>
        )}

        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-3">Property Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2"><Bed className="h-4 w-4 text-muted-foreground" />{property.rooms} Rooms</div>
              <div className="flex items-center gap-2"><Bath className="h-4 w-4 text-muted-foreground" />{property.bathrooms} Bathrooms</div>
              <div className="flex items-center gap-2"><Home className="h-4 w-4 text-muted-foreground" />{property.kitchen} Kitchen</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{Number(property.size_sqft).toLocaleString()} sqft</div>
              <div className="flex items-center gap-2"><Home className="h-4 w-4 text-muted-foreground" />Floor {property.floor_number} {property.is_top_floor ? "(Top)" : ""}</div>
              <div className="flex items-center gap-2"><Home className="h-4 w-4 text-muted-foreground" />{property.furnished}</div>
              <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-muted-foreground" />Water: {property.water}</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-muted-foreground" />{property.electricity ? "Electricity ✓" : "No Electricity"}</div>
              <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-muted-foreground" />{property.wifi ? "WiFi ✓" : "No WiFi"}</div>
              <div className="flex items-center gap-2"><Car className="h-4 w-4 text-muted-foreground" />{property.parking ? "Parking ✓" : "No Parking"}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{Number(property.distance_highway_km)}km from highway</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{property.owner_family_members} family members</div>
              <div className="flex items-center gap-2"><Home className="h-4 w-4 text-muted-foreground" />Owner: {property.owner_living.replace("_", " ")}</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />Preferred: {property.preferred_tenant}</div>
            </div>
          </CardContent>
        </Card>

        {role === "tenant" && property.is_available && (
          <div className="flex gap-3">
            <Button onClick={handleBooking}>
              <Calendar className="h-4 w-4 mr-2" /> Request Booking
            </Button>
            <Button variant="outline" onClick={() => navigate(`/messages?property=${property.id}&owner=${property.owner_id}`)}>
              <MessageSquare className="h-4 w-4 mr-2" /> Contact Owner
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PropertyDetail;
