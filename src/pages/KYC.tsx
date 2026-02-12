import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileCheck, Upload, CheckCircle, XCircle, Clock } from "lucide-react";

const KYC = () => {
  const { user, kycStatus, refreshProfile } = useAuth();
  const [citizenshipFile, setCitizenshipFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from("kyc-documents").upload(path, file);
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !citizenshipFile || !selfieFile) return;
    setLoading(true);

    try {
      const [citizenshipPath, selfiePath] = await Promise.all([
        uploadFile(citizenshipFile, `${user.id}/citizenship-${Date.now()}`),
        uploadFile(selfieFile, `${user.id}/selfie-${Date.now()}`),
      ]);

      const { error } = await supabase.from("kyc").insert({
        user_id: user.id,
        citizenship_url: citizenshipPath,
        selfie_url: selfiePath,
      });

      if (error) throw error;
      await refreshProfile();
      toast({ title: "KYC Submitted", description: "Your documents are under review." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = kycStatus === "verified" ? <CheckCircle className="h-12 w-12 text-accent" />
    : kycStatus === "pending" ? <Clock className="h-12 w-12 text-warning" />
    : kycStatus === "rejected" ? <XCircle className="h-12 w-12 text-destructive" />
    : <FileCheck className="h-12 w-12 text-muted-foreground" />;

  if (kycStatus) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center space-y-4">
              {statusIcon}
              <h2 className="text-xl font-semibold capitalize">KYC {kycStatus}</h2>
              <p className="text-sm text-muted-foreground">
                {kycStatus === "verified" ? "Your identity has been verified. You have full access to the platform."
                  : kycStatus === "pending" ? "Your documents are being reviewed. This usually takes 24-48 hours."
                  : "Your KYC was rejected. Please contact support."}
              </p>
              <Badge className={kycStatus === "verified" ? "bg-accent" : kycStatus === "pending" ? "bg-warning" : "bg-destructive"}>
                {kycStatus}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>KYC Verification</CardTitle>
            <CardDescription>Upload your documents to verify your identity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Citizenship ID Photo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCitizenshipFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Selfie Photo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Upload className="h-4 w-4 mr-2" />
                {loading ? "Uploading..." : "Submit for Verification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KYC;
