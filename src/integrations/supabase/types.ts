export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      consultations: {
        Row: {
          alergias: string[] | null
          anamnese: string
          condicoes: string[] | null
          condutas: string[] | null
          created_at: string
          diagnosticos: Json
          exames: string[] | null
          id: string
          idade: string | null
          medicamentos: string[] | null
          referencias: string[] | null
          sexo: string | null
          user_id: string
        }
        Insert: {
          alergias?: string[] | null
          anamnese: string
          condicoes?: string[] | null
          condutas?: string[] | null
          created_at?: string
          diagnosticos?: Json
          exames?: string[] | null
          id?: string
          idade?: string | null
          medicamentos?: string[] | null
          referencias?: string[] | null
          sexo?: string | null
          user_id: string
        }
        Update: {
          alergias?: string[] | null
          anamnese?: string
          condicoes?: string[] | null
          condutas?: string[] | null
          created_at?: string
          diagnosticos?: Json
          exames?: string[] | null
          id?: string
          idade?: string | null
          medicamentos?: string[] | null
          referencias?: string[] | null
          sexo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      occupational_exams: {
        Row: {
          afastamento_anterior: boolean | null
          alergias: string | null
          altura: number | null
          antecedentes_patologicos: string | null
          cid_principal: string | null
          created_at: string
          data_exame: string
          data_nascimento: string | null
          data_retorno_previsto: string | null
          departamento: string | null
          descricao_riscos: string | null
          dias_afastamento: number | null
          documento_inss: string | null
          empresa_cnpj: string | null
          empresa_nome: string
          epi_utilizados: string | null
          exame_clinico: string | null
          exames_complementares: string[] | null
          frequencia_cardiaca: string | null
          funcao: string
          habitos_vida: string | null
          historico_ocupacional: string | null
          id: string
          idade: number | null
          imc: number | null
          medicamentos_uso: string | null
          motivo_afastamento: string | null
          observacoes: string | null
          parecer: Database["public"]["Enums"]["occupational_parecer"]
          peso: number | null
          pressao_arterial: string | null
          queixa_ergonomica: string | null
          queixas_atuais: string | null
          restricoes: string | null
          resultados_exames: string | null
          riscos_nr: string[] | null
          setor: string
          sexo: string | null
          tempo_empresa: string | null
          tempo_funcao_atual: string | null
          tipo_exame: Database["public"]["Enums"]["occupational_exam_type"]
          trabalhador_cpf: string | null
          trabalhador_nome: string
          updated_at: string
          usa_epi: boolean | null
          user_id: string
        }
        Insert: {
          afastamento_anterior?: boolean | null
          alergias?: string | null
          altura?: number | null
          antecedentes_patologicos?: string | null
          cid_principal?: string | null
          created_at?: string
          data_exame: string
          data_nascimento?: string | null
          data_retorno_previsto?: string | null
          departamento?: string | null
          descricao_riscos?: string | null
          dias_afastamento?: number | null
          documento_inss?: string | null
          empresa_cnpj?: string | null
          empresa_nome: string
          epi_utilizados?: string | null
          exame_clinico?: string | null
          exames_complementares?: string[] | null
          frequencia_cardiaca?: string | null
          funcao: string
          habitos_vida?: string | null
          historico_ocupacional?: string | null
          id?: string
          idade?: number | null
          imc?: number | null
          medicamentos_uso?: string | null
          motivo_afastamento?: string | null
          observacoes?: string | null
          parecer: Database["public"]["Enums"]["occupational_parecer"]
          peso?: number | null
          pressao_arterial?: string | null
          queixa_ergonomica?: string | null
          queixas_atuais?: string | null
          restricoes?: string | null
          resultados_exames?: string | null
          riscos_nr?: string[] | null
          setor: string
          sexo?: string | null
          tempo_empresa?: string | null
          tempo_funcao_atual?: string | null
          tipo_exame: Database["public"]["Enums"]["occupational_exam_type"]
          trabalhador_cpf?: string | null
          trabalhador_nome: string
          updated_at?: string
          usa_epi?: boolean | null
          user_id: string
        }
        Update: {
          afastamento_anterior?: boolean | null
          alergias?: string | null
          altura?: number | null
          antecedentes_patologicos?: string | null
          cid_principal?: string | null
          created_at?: string
          data_exame?: string
          data_nascimento?: string | null
          data_retorno_previsto?: string | null
          departamento?: string | null
          descricao_riscos?: string | null
          dias_afastamento?: number | null
          documento_inss?: string | null
          empresa_cnpj?: string | null
          empresa_nome?: string
          epi_utilizados?: string | null
          exame_clinico?: string | null
          exames_complementares?: string[] | null
          frequencia_cardiaca?: string | null
          funcao?: string
          habitos_vida?: string | null
          historico_ocupacional?: string | null
          id?: string
          idade?: number | null
          imc?: number | null
          medicamentos_uso?: string | null
          motivo_afastamento?: string | null
          observacoes?: string | null
          parecer?: Database["public"]["Enums"]["occupational_parecer"]
          peso?: number | null
          pressao_arterial?: string | null
          queixa_ergonomica?: string | null
          queixas_atuais?: string | null
          restricoes?: string | null
          resultados_exames?: string | null
          riscos_nr?: string[] | null
          setor?: string
          sexo?: string | null
          tempo_empresa?: string | null
          tempo_funcao_atual?: string | null
          tipo_exame?: Database["public"]["Enums"]["occupational_exam_type"]
          trabalhador_cpf?: string | null
          trabalhador_nome?: string
          updated_at?: string
          usa_epi?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      occupational_exam_type:
        | "admissional"
        | "periodico"
        | "demissional"
        | "retorno_trabalho"
        | "mudanca_funcao"
      occupational_parecer:
        | "apto"
        | "apto_restricao"
        | "inapto_temporario"
        | "inapto"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      occupational_exam_type: [
        "admissional",
        "periodico",
        "demissional",
        "retorno_trabalho",
        "mudanca_funcao",
      ],
      occupational_parecer: [
        "apto",
        "apto_restricao",
        "inapto_temporario",
        "inapto",
      ],
    },
  },
} as const
