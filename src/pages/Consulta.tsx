import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Stethoscope, LogOut, ArrowLeft, RotateCcw, HelpCircle, Send } from "lucide-react";
import { ClinicalResults } from "@/components/ClinicalResults";
import { PdfExportButton } from "@/components/PdfExportButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConsultationModeSelector, ConsultationMode } from "@/components/ConsultationModeSelector";
import { OccupationalExamForm } from "@/components/OccupationalExamForm";
import { OccupationalExamType, examTypeLabels } from "@/types/occupational";
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
  prescricoes?: Array<{
    medicamento: string;
    apresentacao: string;
    posologia: string;
    duracao: string;
    orientacoes: string;
  }>;
  referencias: string[];
}

interface ClarificationQuestion {
  question: string;
  answer: string;
}

interface LocationState {
  prefillData?: {
    iniciais: string;
    idade: string;
    sexo: string;
    anamnese: string;
  };
  mode?: ConsultationMode;
}

const Consulta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const { saveConsultation } = useConsultations();
  
  // Get pre-filled data and mode from navigation state
  const locationState = location.state as LocationState | undefined;
  
  const [anamnese, setAnamnese] = useState(locationState?.prefillData?.anamnese || "");
  const [idade, setIdade] = useState(locationState?.prefillData?.idade || "");
  const [sexo, setSexo] = useState(locationState?.prefillData?.sexo || "");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClinicalData | null>(null);
  const [doctorName, setDoctorName] = useState("Médico");
  
  // Consultation mode
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>(
    locationState?.mode || "normal"
  );
  
  // Occupational mode specific state
  const [selectedOccupationalExam, setSelectedOccupationalExam] = useState<OccupationalExamType | null>(null);
  
  // Clarification flow states
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);
  const [showClarification, setShowClarification] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data) {
          setDoctorName(data.full_name);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const buildPatientData = () => {
    return `
ANAMNESE E DADOS CLÍNICOS:
${anamnese}

INFORMAÇÕES ADICIONAIS:
- Idade: ${idade || "Extrair do texto"}
- Sexo: ${sexo || "Extrair do texto"}
    `.trim();
  };

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
    setClarificationQuestions([]);
    setShowClarification(false);

    const patientData = buildPatientData();

    try {
      // Phase 1: Analyze for missing data
      const { data: analyzeData, error: analyzeError } = await supabase.functions.invoke("clinical-suggestions", {
        body: { patientData, phase: "analyze", mode: consultationMode },
      });

      if (analyzeError) {
        throw new Error(analyzeError.message);
      }

      if (analyzeData.error) {
        throw new Error(analyzeData.error);
      }

      // Check if clarification is needed
      if (analyzeData.needsClarification && analyzeData.questions?.length > 0) {
        const questions = analyzeData.questions.map((q: string) => ({
          question: q,
          answer: "",
        }));
        setClarificationQuestions(questions);
        setShowClarification(true);
        setIsLoading(false);
        return;
      }

      // If no clarification needed, generate final results
      await generateFinalResults(patientData, []);
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível analisar o caso clínico. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const generateFinalResults = async (patientData: string, answers: ClarificationQuestion[]) => {
    try {
      const { data, error } = await supabase.functions.invoke("clinical-suggestions", {
        body: { 
          patientData, 
          phase: "generate",
          mode: consultationMode,
          clarificationAnswers: answers.length > 0 ? answers : undefined,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);
      setShowClarification(false);
      setClarificationQuestions([]);

      // Save consultation to history
      await saveConsultation({
        anamnese,
        idade,
        sexo,
        alergias: [],
        medicamentos: [],
        condicoes: [],
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

  const handleContinueWithAnswers = async () => {
    const unanswered = clarificationQuestions.filter(q => !q.answer.trim());
    if (unanswered.length > 0) {
      toast({
        title: "Respostas incompletas",
        description: "Por favor, responda todas as perguntas antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const patientData = buildPatientData();
    await generateFinalResults(patientData, clarificationQuestions);
  };

  const handleSkipClarification = async () => {
    setIsLoading(true);
    const patientData = buildPatientData();
    await generateFinalResults(patientData, []);
  };

  const updateAnswer = (index: number, answer: string) => {
    setClarificationQuestions(prev => 
      prev.map((q, i) => i === index ? { ...q, answer } : q)
    );
  };

  const handleNewConsultation = () => {
    setAnamnese("");
    setIdade("");
    setSexo("");
    setResults(null);
    setClarificationQuestions([]);
    setShowClarification(false);
    setSelectedOccupationalExam(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // If occupational mode with a selected exam type, show the form
  if (consultationMode === "occupational" && selectedOccupationalExam) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">SIVIA</span>
              <span className="text-sm text-muted-foreground">• Medicina Ocupacional</span>
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
        <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
          <OccupationalExamForm
            examType={selectedOccupationalExam}
            onBack={() => setSelectedOccupationalExam(null)}
          />
        </main>
      </div>
    );
  }

  // If occupational mode without selected exam, show exam type selection
  if (consultationMode === "occupational" && !selectedOccupationalExam) {
    return (
      <div className="min-h-screen bg-background">
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
        <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold">Medicina Ocupacional</h1>
            <p className="text-muted-foreground">Selecione o tipo de exame ocupacional</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {(Object.entries(examTypeLabels) as [OccupationalExamType, string][]).map(([type, label]) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-auto py-4 px-6 flex flex-col gap-1"
                  onClick={() => setSelectedOccupationalExam(type)}
                >
                  <span className="font-semibold">{label}</span>
                  <span className="text-xs text-muted-foreground">NR-7 PCMSO</span>
                </Button>
              ))}
            </div>

            <div className="pt-4">
              <ConsultationModeSelector
                mode={consultationMode}
                onModeChange={setConsultationMode}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {/* Mode Selector */}
          <ConsultationModeSelector
            mode={consultationMode}
            onModeChange={setConsultationMode}
            disabled={showClarification || isLoading}
          />

          {/* Textarea principal */}
          <div className="space-y-2">
            <Textarea
              value={anamnese}
              onChange={(e) => setAnamnese(e.target.value)}
              placeholder={
                consultationMode === "emergency" 
                  ? "Descreva a emergência: queixa principal, sinais vitais, nível de consciência, vias aéreas, respiração, circulação (ABCDE). A IA priorizará condutas imediatas."
                  : "Inicie com iniciais e idade do paciente (ex: M.S.L., 61 anos). Depois, cole a anamnese completa, sinais vitais, exame físico, alergias, medicamentos em uso, condições crônicas e outros dados relevantes. A IA extrairá tudo automaticamente."
              }
              className="min-h-[180px] text-base resize-y"
              disabled={showClarification}
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
                disabled={showClarification}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sexo</label>
              <Select value={sexo} onValueChange={setSexo} disabled={showClarification}>
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

          {/* Clarification Questions */}
          {showClarification && clarificationQuestions.length > 0 && (
            <div className="border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">Precisamos de mais informações</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Responda as perguntas abaixo para gerar sugestões mais precisas:
              </p>
              
              <div className="space-y-4">
                {clarificationQuestions.map((q, index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {index + 1}. {q.question}
                    </label>
                    <Input
                      value={q.answer}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                      placeholder="Digite sua resposta..."
                      className="bg-background"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleContinueWithAnswers}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Continuar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkipClarification}
                  disabled={isLoading}
                >
                  Pular
                </Button>
              </div>
            </div>
          )}

          {/* Botão de ação */}
          {!showClarification && (
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
          )}
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
                  alergias: [],
                  medicamentos: [],
                  condicoes: [],
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
