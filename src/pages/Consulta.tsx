import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Stethoscope, LogOut, ArrowLeft, RotateCcw } from "lucide-react";
import { TagInput } from "@/components/TagInput";
import { ClinicalResults } from "@/components/ClinicalResults";
import { PdfExportButton } from "@/components/PdfExportButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useConsultations } from "@/hooks/useConsultations";
import { supabase } from "@/integrations/supabase/client";

interface ClinicalData {
  diagnosticos: Array<{ nome: string; probabilidade: string }>;
  condutas: string[];
  exames: string[];
  referencias: string[];
}

const Consulta = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const { saveConsultation } = useConsultations();
  const [anamnese, setAnamnese] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [alergias, setAlergias] = useState<string[]>([]);
  const [medicamentos, setMedicamentos] = useState<string[]>([]);
  const [condicoes, setCondicoes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClinicalData | null>(null);
  const [doctorName, setDoctorName] = useState("Médico");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setDoctorName(data.full_name);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async () => {
    if (!anamnese.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha a anamnese do paciente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    const patientData = `
ANAMNESE E DADOS CLÍNICOS:
${anamnese}

INFORMAÇÕES ADICIONAIS:
- Idade: ${idade || "Não informada"}
- Sexo: ${sexo || "Não informado"}
- Alergias: ${alergias.length > 0 ? alergias.join(", ") : "Nenhuma informada"}
- Medicamentos em uso: ${medicamentos.length > 0 ? medicamentos.join(", ") : "Nenhum informado"}
- Condições crônicas: ${condicoes.length > 0 ? condicoes.join(", ") : "Nenhuma informada"}
    `.trim();

    try {
      const { data, error } = await supabase.functions.invoke("clinical-suggestions", {
        body: { patientData },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);

      // Save consultation to history
      await saveConsultation({
        anamnese,
        idade,
        sexo,
        alergias,
        medicamentos,
        condicoes,
        diagnosticos: data.diagnosticos,
        condutas: data.condutas,
        exames: data.exames,
        referencias: data.referencias,
      });
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível gerar as sugestões clínicas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConsultation = () => {
    setAnamnese("");
    setIdade("");
    setSexo("");
    setAlergias([]);
    setMedicamentos([]);
    setCondicoes([]);
    setResults(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">SIVIA</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="space-y-6">
          {/* Textarea principal */}
          <div className="space-y-2">
            <Textarea
              value={anamnese}
              onChange={(e) => setAnamnese(e.target.value)}
              placeholder="Cole aqui a anamnese completa, sinais vitais, exame físico, idade, sexo, alergias, medicamentos em uso, condições crônicas e qualquer outro dado relevante do paciente..."
              className="min-h-[180px] text-base resize-y"
            />
          </div>

          {/* Campos adicionais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Idade</label>
              <Input
                type="number"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 45"
                min="0"
                max="150"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sexo</label>
              <Select value={sexo} onValueChange={setSexo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TagInput
            label="Alergias"
            placeholder="Digite uma alergia e pressione Enter"
            tags={alergias}
            onTagsChange={setAlergias}
          />

          <TagInput
            label="Medicamentos em uso"
            placeholder="Digite um medicamento e pressione Enter"
            tags={medicamentos}
            onTagsChange={setMedicamentos}
          />

          <TagInput
            label="Condições crônicas"
            placeholder="Digite uma condição e pressione Enter"
            tags={condicoes}
            onTagsChange={setCondicoes}
          />

          {/* Botão de ação */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="w-full text-base font-semibold py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisando caso clínico...
                </>
              ) : (
                "Gerar Sugestões Clínicas"
              )}
            </Button>
          </div>
        </div>

        {/* Resultados */}
        {results && (
          <div className="mt-10 space-y-6">
            <ClinicalResults results={results} />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <PdfExportButton
                patientData={{
                  anamnese,
                  idade,
                  sexo,
                  alergias,
                  medicamentos,
                  condicoes,
                }}
                results={results}
                doctorName={doctorName}
              />
              <Button
                variant="outline"
                size="lg"
                onClick={handleNewConsultation}
                className="gap-2 text-base font-semibold"
              >
                <RotateCcw className="h-5 w-5" />
                Nova Consulta
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Consulta;
