import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const Consent = () => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConsent = async () => {
    if (!user || !agreed) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ consent_agreed: true })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      navigate("/select-role");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle>Terms & Consent</CardTitle>
          <CardDescription>Please review and accept our terms before continuing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 max-h-60 overflow-y-auto text-sm text-muted-foreground space-y-2">
            <p><strong>GharSewa Platform Terms of Use</strong></p>
            <p>By using GharSewa, you agree to provide accurate personal information for KYC verification. All listings must be truthful and represent actual rental properties in the Kathmandu Valley area.</p>
            <p>Messaging between tenants and owners is a paid feature. AI-powered content moderation is active to protect personal information. Phone numbers, emails, and other personal data shared in messages will be automatically masked.</p>
            <p>Trust scores are calculated based on verified reviews and booking history. All users must complete KYC verification before accessing messaging, booking, or property listing features.</p>
            <p>Commission fees apply to property owners on successful bookings. Reward credits may be earned through platform activity.</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
            />
            <label htmlFor="consent" className="text-sm">
              I agree to the Terms of Use and Privacy Policy
            </label>
          </div>
          <Button onClick={handleConsent} disabled={!agreed || loading} className="w-full">
            {loading ? "Processing..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Consent;
