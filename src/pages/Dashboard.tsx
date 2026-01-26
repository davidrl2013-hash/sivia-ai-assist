import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, LogOut, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useConsultations } from "@/hooks/useConsultations";
import { ConsultationHistory } from "@/components/ConsultationHistory";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { consultations, loading: loadingConsultations, deleteConsultation } = useConsultations();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      setFullName(data?.full_name ?? null);
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = fullName || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">SIVIA</span>
          </div>
          <div className="flex items-center gap-4">
            {loadingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {displayName}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center space-y-8">
          {/* Welcome */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Bem-vindo, Dr. {displayName.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">
              Cole a anamnese e dados do paciente para gerar sugestões clínicas
              rápidas
            </p>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={() => navigate("/consulta")}
            className="text-lg px-8 py-6 h-auto"
          >
            <Stethoscope className="mr-2 h-5 w-5" />
            Iniciar Nova Consulta
          </Button>

          {/* History Section */}
          <div className="mt-12 text-left">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Histórico de Consultas
              </h2>
            </div>
            <ConsultationHistory
              consultations={consultations}
              onDelete={deleteConsultation}
              loading={loadingConsultations}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
