-- Create enum for exam types
CREATE TYPE public.occupational_exam_type AS ENUM (
  'admissional',
  'periodico', 
  'demissional',
  'retorno_trabalho',
  'mudanca_funcao'
);

-- Create enum for exam conclusions
CREATE TYPE public.occupational_parecer AS ENUM (
  'apto',
  'apto_restricao',
  'inapto_temporario',
  'inapto'
);

-- Create table for occupational exams
CREATE TABLE public.occupational_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Company Info
  empresa_nome TEXT NOT NULL,
  empresa_cnpj TEXT,
  setor TEXT NOT NULL,
  funcao TEXT NOT NULL,
  departamento TEXT,
  
  -- Exam Info
  tipo_exame occupational_exam_type NOT NULL,
  data_exame DATE NOT NULL,
  
  -- Patient Info
  trabalhador_nome TEXT NOT NULL,
  trabalhador_cpf TEXT,
  data_nascimento DATE,
  idade INTEGER,
  sexo TEXT,
  
  -- Occupational History
  historico_ocupacional TEXT,
  tempo_funcao_atual TEXT,
  tempo_empresa TEXT,
  afastamento_anterior BOOLEAN DEFAULT false,
  motivo_afastamento TEXT,
  dias_afastamento INTEGER,
  
  -- Risks (for epidemiological analysis)
  riscos_nr TEXT[] DEFAULT '{}',
  descricao_riscos TEXT,
  usa_epi BOOLEAN DEFAULT false,
  epi_utilizados TEXT,
  
  -- Health Assessment
  queixas_atuais TEXT,
  antecedentes_patologicos TEXT,
  medicamentos_uso TEXT,
  alergias TEXT,
  habitos_vida TEXT,
  
  -- Physical Exam
  pressao_arterial TEXT,
  frequencia_cardiaca TEXT,
  peso NUMERIC(5,2),
  altura NUMERIC(3,2),
  imc NUMERIC(4,2),
  exame_clinico TEXT,
  
  -- Complementary Exams
  exames_complementares TEXT[] DEFAULT '{}',
  resultados_exames TEXT,
  
  -- Conclusion
  parecer occupational_parecer NOT NULL,
  restricoes TEXT,
  observacoes TEXT,
  
  -- Return to Work specific
  data_retorno_previsto DATE,
  documento_inss TEXT,
  
  -- Dashboard/Epidemiological fields
  cid_principal TEXT,
  queixa_ergonomica TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.occupational_exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own occupational exams"
ON public.occupational_exams
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own occupational exams"
ON public.occupational_exams
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own occupational exams"
ON public.occupational_exams
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own occupational exams"
ON public.occupational_exams
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_occupational_exams_updated_at
BEFORE UPDATE ON public.occupational_exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for common queries and epidemiological analysis
CREATE INDEX idx_occupational_exams_user_id ON public.occupational_exams(user_id);
CREATE INDEX idx_occupational_exams_empresa ON public.occupational_exams(empresa_nome);
CREATE INDEX idx_occupational_exams_tipo ON public.occupational_exams(tipo_exame);
CREATE INDEX idx_occupational_exams_parecer ON public.occupational_exams(parecer);
CREATE INDEX idx_occupational_exams_cid ON public.occupational_exams(cid_principal);
CREATE INDEX idx_occupational_exams_data ON public.occupational_exams(data_exame);
CREATE INDEX idx_occupational_exams_setor ON public.occupational_exams(setor);