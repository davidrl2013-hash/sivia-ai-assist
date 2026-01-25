import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas são diferentes.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Termos obrigatórios",
        description: "Aceite os termos para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setIsLoading(false);
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: fullName.trim(),
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    }

    setIsLoading(false);

    toast({
      title: "Conta criada!",
      description: "Você já pode fazer login.",
    });

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">SIVIA</h1>
          </div>
          <p className="text-muted-foreground">Criar nova conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nome completo
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. João Silva"
              autoComplete="name"
            />
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Confirmar senha
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-tight cursor-pointer"
            >
              Aceito os termos de uso e a política de privacidade (LGPD)
            </label>
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
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        {/* Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Já tem conta? <span className="text-primary">Entrar</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
