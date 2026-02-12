import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

const Reviews = () => {
  const { user, role } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch reviews where user is reviewer or reviewee
      const { data: revData } = await supabase
        .from("reviews")
        .select("*, bookings(properties(title))")
        .or(`reviewer_id.eq.${user.id},reviewee_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      setReviews(revData || []);

      // Fetch completed bookings for leaving reviews
      const col = role === "owner" ? "owner_id" : "tenant_id";
      const { data: bookData } = await supabase
        .from("bookings")
        .select("*, properties(title)")
        .eq(col, user.id)
        .eq("status", "completed");

      // Filter out already-reviewed bookings
      const reviewedBookingIds = new Set((revData || []).filter((r) => r.reviewer_id === user.id).map((r) => r.booking_id));
      setCompletedBookings((bookData || []).filter((b) => !reviewedBookingIds.has(b.id)));
    };
    fetchData();
  }, [user, role]);

  const submitReview = async (bookingId: string, revieweeId: string) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId, reviewer_id: user.id, reviewee_id: revieweeId,
      rating, comment,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Review Submitted" });
      setShowForm(null);
      setComment("");
      setRating(5);
      // Refresh
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reviews</h1>

        {completedBookings.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Leave a Review</h2>
            {completedBookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{b.properties?.title || "Booking"}</p>
                    {showForm === b.id ? (
                      <Button size="sm" variant="ghost" onClick={() => setShowForm(null)}>Cancel</Button>
                    ) : (
                      <Button size="sm" onClick={() => setShowForm(b.id)}>Write Review</Button>
                    )}
                  </div>
                  {showForm === b.id && (
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-6 w-6 cursor-pointer ${s <= rating ? "fill-warning text-warning" : "text-muted"}`}
                            onClick={() => setRating(s)}
                          />
                        ))}
                      </div>
                      <Textarea
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button
                        size="sm"
                        disabled={loading}
                        onClick={() => submitReview(b.id, role === "tenant" ? b.owner_id : b.tenant_id)}
                      >
                        Submit Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">All Reviews</h2>
          {reviews.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No reviews yet.</CardContent></Card>
          ) : reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  {r.reviewer_id === user?.id && <span className="text-xs text-primary">(by you)</span>}
                </div>
                <p className="text-sm">{r.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reviews;
