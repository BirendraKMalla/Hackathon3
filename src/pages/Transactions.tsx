import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTransactions(data || []);
        setLoading(false);
      });
  }, [user]);

  const typeColors: Record<string, string> = {
    chat_credit: "bg-primary",
    commission: "bg-secondary",
    reward: "bg-accent",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : transactions.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No transactions yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm capitalize">{t.type.replace("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">{t.description || "Transaction"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rs. {Number(t.amount).toLocaleString()}</p>
                    <Badge className={typeColors[t.type] || "bg-muted"} >{t.type.replace("_", " ")}</Badge>
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

export default Transactions;
