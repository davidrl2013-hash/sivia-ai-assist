import { useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha seu email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">SIVIA</h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Email enviado!</h2>
            <p className="text-muted-foreground">
              Verifique sua caixa de entrada para redefinir sua senha.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">SIVIA</h1>
          </div>
          <p className="text-muted-foreground">Recuperar senha</p>
        </div>

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>
        </form>

        {/* Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
