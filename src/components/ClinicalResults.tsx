import { AlertTriangle, Stethoscope, Activity, FlaskConical, BookOpen } from "lucide-react";

interface ClinicalResultsProps {
  results: {
    diagnosticos: Array<{ nome: string; probabilidade: string }>;
    condutas: string[];
    exames: string[];
    referencias: string[];
  };
}

export function ClinicalResults({ results }: ClinicalResultsProps) {
  const getProbabilityColor = (prob: string) => {
    const lower = prob.toLowerCase();
    if (lower.includes("alta")) return "text-primary font-semibold";
    if (lower.includes("média") || lower.includes("media")) return "text-warning-foreground font-medium";
    return "text-muted-foreground";
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
      <div className="results-card">
        <h3 className="section-title">
          <Stethoscope className="h-5 w-5 text-primary" />
          Diagnósticos Diferenciais
        </h3>
        <ol className="space-y-2">
          {results.diagnosticos.map((diag, index) => (
            <li key={index} className="flex items-baseline gap-3">
              <span className="text-primary font-bold text-lg">{index + 1}.</span>
              <div>
                <span className="font-medium">{diag.nome}</span>
                <span className={`ml-2 text-sm ${getProbabilityColor(diag.probabilidade)}`}>
                  ({diag.probabilidade})
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Condutas Sugeridas */}
      <div className="results-card">
        <h3 className="section-title">
          <Activity className="h-5 w-5 text-primary" />
          Condutas Sugeridas
        </h3>
        <ul className="space-y-2">
          {results.condutas.map((conduta, index) => (
            <li key={index} className="flex items-baseline gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <span>{conduta}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exames Recomendados */}
      <div className="results-card">
        <h3 className="section-title">
          <FlaskConical className="h-5 w-5 text-primary" />
          Exames Recomendados
        </h3>
        <ul className="space-y-2">
          {results.exames.map((exame, index) => (
            <li key={index} className="flex items-baseline gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <span>{exame}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Referências */}
      <div className="results-card">
        <h3 className="section-title">
          <BookOpen className="h-5 w-5 text-primary" />
          Referências
        </h3>
        <ul className="space-y-2">
          {results.referencias.map((ref, index) => (
            <li key={index} className="flex items-baseline gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <span className="text-sm text-muted-foreground">{ref}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
