import { AlertTriangle, Stethoscope, Activity, FlaskConical, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClinicalResultsProps {
  results: {
    diagnosticos: Array<{ nome: string; probabilidade: string }>;
    condutas: string[];
    exames: string[];
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">
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
                <span>{conduta}</span>
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
                <span>{exame}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

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
                <span className="text-sm text-muted-foreground">{ref}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
