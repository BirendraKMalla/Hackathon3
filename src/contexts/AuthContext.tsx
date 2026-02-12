import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "owner" | "tenant" | null;
type KycStatus = "pending" | "verified" | "rejected" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole;
  kycStatus: KycStatus;
  consentAgreed: boolean;
  profile: any;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus>(null);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchUserData = async (userId: string) => {
    const [rolesRes, profilesRes, kycRowsRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
      supabase.from("profiles").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
      supabase.from("kyc").select("status").eq("user_id", userId).order("submitted_at", { ascending: false }).limit(1),
    ]);

    const roleRow = rolesRes.data?.[0];
    const profileRow = profilesRes.data?.[0];
    const kycRow = kycRowsRes.data?.[0];

    if (roleRow) setRole(roleRow.role as AppRole);
    else setRole(null);

    if (profileRow) {
      setProfile(profileRow);
      setConsentAgreed(profileRow.consent_agreed);
    }

    if (kycRow) setKycStatus(kycRow.status as KycStatus);
    else setKycStatus(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchUserData(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setRole(null);
        setKycStatus(null);
        setConsentAgreed(false);
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, kycStatus, consentAgreed, profile, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
