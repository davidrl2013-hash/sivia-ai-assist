-- Create consultations table to store clinical history
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  anamnese TEXT NOT NULL,
  idade TEXT,
  sexo TEXT,
  alergias TEXT[] DEFAULT '{}',
  medicamentos TEXT[] DEFAULT '{}',
  condicoes TEXT[] DEFAULT '{}',
  diagnosticos JSONB NOT NULL DEFAULT '[]',
  condutas TEXT[] DEFAULT '{}',
  exames TEXT[] DEFAULT '{}',
  referencias TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Users can only view their own consultations
CREATE POLICY "Users can view their own consultations"
ON public.consultations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own consultations
CREATE POLICY "Users can insert their own consultations"
ON public.consultations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own consultations
CREATE POLICY "Users can delete their own consultations"
ON public.consultations
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX idx_consultations_created_at ON public.consultations(created_at DESC);