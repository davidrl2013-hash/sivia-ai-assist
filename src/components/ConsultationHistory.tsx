import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, ChevronDown, ChevronUp, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Consultation {
  id: string;
  anamnese: string;
  idade: string | null;
  sexo: string | null;
  alergias: string[];
  medicamentos: string[];
  condicoes: string[];
  diagnosticos: Array<{ nome: string; probabilidade: string }>;
  condutas: string[];
  exames: string[];
  referencias: string[];
  created_at: string;
}

interface ConsultationHistoryProps {
  consultations: Consultation[];
  onDelete: (id: string) => void;
  loading: boolean;
}

export function ConsultationHistory({ consultations, onDelete, loading }: ConsultationHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("consultations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      onDelete(id);
      toast({
        title: "Consulta excluída",
        description: "A consulta foi removida do histórico.",
      });
    } catch (error) {
      console.error("Error deleting consultation:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a consulta.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getProbabilityBadge = (prob: string) => {
    const lower = prob.toLowerCase();
    if (lower.includes("alta")) {
      return <Badge className="bg-red-500/10 text-red-600 border-red-200 text-xs">{prob}</Badge>;
    }
    if (lower.includes("média") || lower.includes("media") || lower.includes("moderada")) {
      return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-300 text-xs">{prob}</Badge>;
    }
    return <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">{prob}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (consultations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma consulta anterior encontrada.</p>
          <p className="text-sm">Suas consultas aparecerão aqui após serem geradas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {consultations.map((consultation) => {
        const isExpanded = expandedId === consultation.id;
        const firstDiagnosis = consultation.diagnosticos[0];
        
        return (
          <Card key={consultation.id} className="overflow-hidden">
            <CardHeader 
              className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleExpand(consultation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {format(new Date(consultation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    {consultation.idade && (
                      <Badge variant="outline" className="text-xs">
                        {consultation.idade} anos
                      </Badge>
                    )}
                    {consultation.sexo && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {consultation.sexo}
                      </Badge>
                    )}
                  </div>
                  {firstDiagnosis && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground truncate">
                        {firstDiagnosis.nome}
                      </span>
                      {getProbabilityBadge(firstDiagnosis.probabilidade)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                        disabled={deletingId === consultation.id}
                      >
                        {deletingId === consultation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir consulta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A consulta será permanentemente removida do histórico.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(consultation.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0 pb-4 px-4 border-t">
                <div className="space-y-4 mt-4">
                  {/* Anamnese resumida */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Anamnese</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {consultation.anamnese}
                    </p>
                  </div>

                  {/* Diagnósticos */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Diagnósticos</h4>
                    <div className="space-y-1">
                      {consultation.diagnosticos.map((diag, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm">{diag.nome}</span>
                          {getProbabilityBadge(diag.probabilidade)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Condutas */}
                  {consultation.condutas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Condutas</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {consultation.condutas.slice(0, 3).map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                        {consultation.condutas.length > 3 && (
                          <li className="text-xs">+{consultation.condutas.length - 3} mais...</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Exames */}
                  {consultation.exames.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Exames</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {consultation.exames.slice(0, 3).map((e, idx) => (
                          <li key={idx}>{e}</li>
                        ))}
                        {consultation.exames.length > 3 && (
                          <li className="text-xs">+{consultation.exames.length - 3} mais...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
