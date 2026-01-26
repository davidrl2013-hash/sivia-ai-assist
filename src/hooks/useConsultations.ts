import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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

interface SaveConsultationParams {
  anamnese: string;
  idade: string;
  sexo: string;
  alergias: string[];
  medicamentos: string[];
  condicoes: string[];
  diagnosticos: Array<{ nome: string; probabilidade: string }>;
  condutas: string[];
  exames: string[];
  referencias: string[];
}

export function useConsultations() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = useCallback(async () => {
    if (!user) {
      setConsultations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Parse diagnosticos from JSONB
      const parsed = (data || []).map((item) => ({
        ...item,
        diagnosticos: Array.isArray(item.diagnosticos) 
          ? item.diagnosticos as Array<{ nome: string; probabilidade: string }>
          : [],
      }));

      setConsultations(parsed);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const saveConsultation = async (params: SaveConsultationParams) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("consultations")
        .insert({
          user_id: user.id,
          anamnese: params.anamnese,
          idade: params.idade || null,
          sexo: params.sexo || null,
          alergias: params.alergias,
          medicamentos: params.medicamentos,
          condicoes: params.condicoes,
          diagnosticos: params.diagnosticos,
          condutas: params.condutas,
          exames: params.exames,
          referencias: params.referencias,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newConsultation = {
        ...data,
        diagnosticos: Array.isArray(data.diagnosticos)
          ? data.diagnosticos as Array<{ nome: string; probabilidade: string }>
          : [],
      };
      
      setConsultations((prev) => [newConsultation, ...prev]);
      
      return newConsultation;
    } catch (error) {
      console.error("Error saving consultation:", error);
      return null;
    }
  };

  const deleteConsultation = (id: string) => {
    setConsultations((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    consultations,
    loading,
    saveConsultation,
    deleteConsultation,
    refetch: fetchConsultations,
  };
}
