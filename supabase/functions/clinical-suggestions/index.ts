import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const analyzePrompt = `Você é um assistente clínico. Analise a anamnese fornecida e verifique se há dados essenciais faltando para uma avaliação clínica precisa.

Dados essenciais a verificar:
- Idade do paciente
- Sexo do paciente  
- Queixa principal clara
- Duração dos sintomas
- Sinais vitais (se aplicável ao caso)
- Alergias medicamentosas
- Medicamentos em uso
- Comorbidades relevantes
- Sinais de alarme específicos para a queixa

Se faltar dados importantes, gere de 3 a 5 perguntas CLARAS e ESPECÍFICAS para esclarecer.

RESPONDA APENAS em JSON válido:
{
  "needsClarification": true/false,
  "questions": ["Pergunta 1?", "Pergunta 2?", ...]
}

Se todos os dados essenciais estiverem presentes, retorne:
{"needsClarification": false, "questions": []}`;

const generatePrompt = `Você é um assistente clínico especializado em medicina baseada em evidências. Analise o caso clínico apresentado e forneça sugestões estruturadas.

EXTRAÇÃO DE DADOS: O texto fornecido contém a anamnese completa. Você DEVE extrair automaticamente:
- Alergias mencionadas no texto
- Medicamentos em uso mencionados no texto  
- Condições crônicas/comorbidades mencionadas no texto
Use essas informações extraídas para personalizar diagnósticos, condutas e prescrições.

IMPORTANTE: Responda APENAS em formato JSON válido, sem markdown, seguindo exatamente esta estrutura:
{
  "diagnosticos": [
    {"nome": "Nome do diagnóstico", "probabilidade": "Alta/Média/Baixa"}
  ],
  "condutas": ["Conduta 1", "Conduta 2"],
  "exames": ["Exame 1", "Exame 2"],
  "prescricoes": [
    {
      "medicamento": "Nome do medicamento",
      "apresentacao": "Comprimido 500mg, Xarope 100mg/5ml, etc.",
      "posologia": "1 comprimido de 8/8 horas",
      "duracao": "5 dias",
      "orientacoes": "Tomar após as refeições. Evitar bebidas alcoólicas."
    }
  ],
  "referencias": ["Referência 1", "Referência 2"]
}

Regras:
- Máximo 5 diagnósticos diferenciais, ordenados por probabilidade
- Condutas imediatas e práticas
- Exames complementares relevantes
- Prescrições: inclua medicamentos sintomáticos apropriados para a queixa principal
- EVITE medicamentos que conflitem com alergias ou medicamentos em uso
- Referências de diretrizes brasileiras (MS Brasil, SBC, SBEM, SBD, SBPT, etc.)
- Seja objetivo e clínico`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Autenticação necessária" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { patientData, phase, clarificationAnswers } = await req.json();

    if (!patientData) {
      return new Response(
        JSON.stringify({ error: "Dados do paciente são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine which prompt to use based on phase
    const isAnalyzePhase = phase === "analyze";
    const systemPrompt = isAnalyzePhase ? analyzePrompt : generatePrompt;
    
    // Build the user content
    let userContent = patientData;
    if (!isAnalyzePhase && clarificationAnswers && clarificationAnswers.length > 0) {
      userContent += "\n\nRESPOSTAS ADICIONAIS DO MÉDICO:\n" + clarificationAnswers.map((a: {question: string, answer: string}, i: number) => 
        `${i + 1}. ${a.question}\nResposta: ${a.answer}`
      ).join("\n\n");
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("LOVABLE_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.3,
        max_tokens: isAnalyzePhase ? 500 : 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde um momento e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos ao seu workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Resposta vazia da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean markdown formatting if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    const parsed = JSON.parse(cleanContent);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
