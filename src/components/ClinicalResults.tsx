import { AlertTriangle, Stethoscope, Activity, FlaskConical, BookOpen, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Prescricao {
  medicamento: string;
  apresentacao: string;
  posologia: string;
  duracao: string;
  orientacoes: string;
}

interface ClinicalResultsProps {
  results: {
    diagnosticos: Array<{ nome: string; probabilidade: string }>;
    condutas: string[];
    exames: string[];
    prescricoes?: Prescricao[];
    referencias: string[];
  };
}

export function ClinicalResults({ results }: ClinicalResultsProps) {
  const getProbabilityBadge = (prob: string) => {
    const lower = prob.toLowerCase();
    if (lower.includes("alta")) {
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20">
          {prob}
        </Badge>
      );
    }
    if (lower.includes("média") || lower.includes("media") || lower.includes("moderada")) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-300 hover:bg-yellow-500/20">
          {prob}
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">
        {prob}
      </Badge>
    );
  };

  // Helper to extract string from potentially nested object
  const extractString = (item: unknown): string => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null) {
      // Handle objects like {conduta: "..."} or {exame: "..."}
      const values = Object.values(item);
      if (values.length > 0 && typeof values[0] === "string") {
        return values[0];
      }
    }
    return String(item);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-warning-background border border-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-warning-foreground">
          <strong>Atenção:</strong> Estas são sugestões geradas por IA. Não substituem o julgamento clínico do médico. 
          Valide sempre as informações e considere o contexto completo do paciente.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-foreground text-center">Sugestões Clínicas</h2>

      {/* Diagnósticos Diferenciais */}
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
            Diagnósticos Diferenciais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {results.diagnosticos.map((diag, index) => (
              <li key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <span className="font-medium">{diag.nome}</span>
                  {getProbabilityBadge(diag.probabilidade)}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Condutas Sugeridas */}
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-blue-500" />
            Condutas Sugeridas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {results.condutas.map((conduta, index) => (
              <li key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                <span>{extractString(conduta)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Exames Recomendados */}
      <Card className="border-l-4 border-l-emerald-500 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FlaskConical className="h-5 w-5 text-emerald-500" />
            Exames Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {results.exames.map((exame, index) => (
              <li key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                <span>{extractString(exame)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Prescrições Medicamentosas */}
      {results.prescricoes && results.prescricoes.length > 0 && (
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-orange-500" />
              Prescrição Medicamentosa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.prescricoes.map((prescricao, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-orange-500 text-white text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {extractString(prescricao.medicamento)}
                      </h4>
                      <div className="grid gap-1 text-sm">
                        <p>
                          <span className="font-medium text-muted-foreground">Apresentação:</span>{" "}
                          {extractString(prescricao.apresentacao)}
                        </p>
                        <p>
                          <span className="font-medium text-muted-foreground">Posologia:</span>{" "}
                          {extractString(prescricao.posologia)}
                        </p>
                        <p>
                          <span className="font-medium text-muted-foreground">Duração:</span>{" "}
                          {extractString(prescricao.duracao)}
                        </p>
                        <p className="mt-2 p-2 bg-background rounded border border-border/30">
                          <span className="font-medium text-muted-foreground">Orientações:</span>{" "}
                          {extractString(prescricao.orientacoes)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referências */}
      <Card className="border-l-4 border-l-purple-500 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Referências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {results.referencias.map((ref, index) => (
              <li key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0 mt-2" />
                <span className="text-sm text-muted-foreground">{extractString(ref)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
