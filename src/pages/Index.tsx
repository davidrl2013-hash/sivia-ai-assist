import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { TagInput } from "@/components/TagInput";
import { ClinicalResults } from "@/components/ClinicalResults";
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
import { supabase } from "@/integrations/supabase/client";

interface ClinicalData {
  diagnosticos: Array<{ nome: string; probabilidade: string }>;
  condutas: string[];
  exames: string[];
  referencias: string[];
}

const Index = () => {
  const { toast } = useToast();
  const [anamnese, setAnamnese] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [alergias, setAlergias] = useState<string[]>([]);
  const [medicamentos, setMedicamentos] = useState<string[]>([]);
  const [condicoes, setCondicoes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClinicalData | null>(null);

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

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Header />

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
          <div className="mt-10">
            <ClinicalResults results={results} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
