import { z } from "zod";

// NR-7 PCMSO Exam Types
export type OccupationalExamType = 
  | "admissional"
  | "periodico"
  | "demissional"
  | "retorno_trabalho"
  | "mudanca_funcao";

export const examTypeLabels: Record<OccupationalExamType, string> = {
  admissional: "Exame Admissional",
  periodico: "Exame Periódico",
  demissional: "Exame Demissional",
  retorno_trabalho: "Retorno ao Trabalho",
  mudanca_funcao: "Mudança de Função/Risco",
};

// NR Risk Categories
export const nrRisks = [
  { code: "NR-06", label: "EPI - Equipamentos de Proteção Individual" },
  { code: "NR-09", label: "Agentes Ambientais (ruído, calor, químicos)" },
  { code: "NR-15", label: "Atividades Insalubres" },
  { code: "NR-16", label: "Atividades Perigosas" },
  { code: "NR-17", label: "Ergonomia" },
  { code: "NR-32", label: "Saúde em Estabelecimentos de Saúde" },
  { code: "NR-35", label: "Trabalho em Altura" },
] as const;

// Complementary Exams for Occupational Medicine
export const complementaryExams = [
  { code: "audiometria", label: "Audiometria Tonal" },
  { code: "espirometria", label: "Espirometria" },
  { code: "acuidade_visual", label: "Acuidade Visual" },
  { code: "eletrocardiograma", label: "Eletrocardiograma" },
  { code: "hemograma", label: "Hemograma Completo" },
  { code: "glicemia", label: "Glicemia de Jejum" },
  { code: "rx_torax", label: "Raio-X de Tórax" },
  { code: "rx_coluna", label: "Raio-X de Coluna" },
  { code: "eeg", label: "Eletroencefalograma" },
  { code: "toxicologico", label: "Exame Toxicológico" },
] as const;

// Companies for select dropdown
export const empresasFixas = [
  "Interblu",
  "Salvamed", 
  "Outra empresa",
] as const;

// Zod Schema for Occupational Exam Form
export const occupationalExamSchema = z.object({
  // Company Info
  empresaNome: z.string().min(1, "Nome da empresa é obrigatório"),
  empresaCnpj: z.string().optional(),
  setor: z.string().min(1, "Setor é obrigatório"),
  funcao: z.string().min(1, "Função é obrigatória"),
  departamento: z.string().optional(),
  
  // Exam Info
  tipoExame: z.enum(["admissional", "periodico", "demissional", "retorno_trabalho", "mudanca_funcao"]),
  dataExame: z.string().min(1, "Data do exame é obrigatória"),
  
  // Patient Info
  trabalhadorNome: z.string().min(1, "Nome do trabalhador é obrigatório"),
  trabalhadorCpf: z.string().optional(),
  dataNascimento: z.string().optional(),
  idade: z.string().optional(),
  sexo: z.enum(["masculino", "feminino", "outro"]).optional(),
  
  // Occupational History
  historicoOcupacional: z.string().optional(),
  tempoFuncaoAtual: z.string().optional(),
  tempoEmpresa: z.string().optional(),
  afastamentoAnterior: z.boolean().default(false),
  motivoAfastamento: z.string().optional(),
  diasAfastamento: z.string().optional(),
  
  // Risks
  riscosNR: z.array(z.string()).default([]),
  descricaoRiscos: z.string().optional(),
  usaEPI: z.boolean().default(false),
  epiUtilizados: z.string().optional(),
  
  // Health Assessment
  queixasAtuais: z.string().optional(),
  antecedentesPatologicos: z.string().optional(),
  medicamentosUso: z.string().optional(),
  alergias: z.string().optional(),
  habitosVida: z.string().optional(),
  
  // Physical Exam
  pressaoArterial: z.string().optional(),
  frequenciaCardiaca: z.string().optional(),
  peso: z.string().optional(),
  altura: z.string().optional(),
  imc: z.string().optional(),
  exameClinico: z.string().optional(),
  
  // Complementary Exams
  examesComplementares: z.array(z.string()).default([]),
  resultadosExames: z.string().optional(),
  
  // Conclusion
  parecer: z.enum(["apto", "apto_restricao", "inapto_temporario", "inapto"]),
  restricoes: z.string().optional(),
  observacoes: z.string().optional(),
  
  // For return-to-work exams (enhanced for dashboards)
  dataRetornoPrevisto: z.string().optional(),
  documentoINSS: z.string().optional(),
  
  // New fields for dashboard analytics
  cidPrincipal: z.string().optional(),
  queixaErgonomica: z.string().optional(),
});

export type OccupationalExamFormData = z.infer<typeof occupationalExamSchema>;

export const parecerLabels: Record<string, { label: string; color: string }> = {
  apto: { label: "Apto", color: "text-green-600 bg-green-50 border-green-200" },
  apto_restricao: { label: "Apto com Restrição", color: "text-yellow-700 bg-yellow-50 border-yellow-300" },
  inapto_temporario: { label: "Inapto Temporário", color: "text-orange-600 bg-orange-50 border-orange-200" },
  inapto: { label: "Inapto", color: "text-red-600 bg-red-50 border-red-200" },
};
