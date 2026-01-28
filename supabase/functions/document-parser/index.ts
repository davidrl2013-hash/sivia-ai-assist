import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const extractionPrompt = `Você é um especialista em extração de dados de prontuários médicos. Analise o documento/imagem fornecido e extraia as seguintes informações de forma estruturada:

EXTRAIA E ORGANIZE:
1. **Dados do Paciente**: Nome/iniciais, idade, sexo, data de nascimento
2. **Alergias**: Liste todas as alergias mencionadas
3. **Medicamentos em Uso**: Liste todos os medicamentos com posologia
4. **Condições Crônicas/Comorbidades**: Liste todas as doenças crônicas
5. **Histórico Pregresso**: Internações, cirurgias, doenças anteriores
6. **Histórico Familiar**: Doenças na família relevantes
7. **Sinais Vitais**: PA, FC, FR, Temperatura, SpO2 se disponíveis
8. **Queixas/Anamnese**: Resumo das queixas principais

RESPONDA APENAS em JSON válido:
{
  "dadosPaciente": {
    "nome": "iniciais ou nome",
    "idade": "XX anos",
    "sexo": "M/F",
    "dataNascimento": "se disponível"
  },
  "alergias": ["alergia 1", "alergia 2"],
  "medicamentos": ["med1 - posologia", "med2 - posologia"],
  "condicoessCronicas": ["condição 1", "condição 2"],
  "historicoPregresso": ["item 1", "item 2"],
  "historicoFamiliar": ["item 1", "item 2"],
  "sinaisVitais": {
    "pa": "valor",
    "fc": "valor",
    "fr": "valor",
    "temp": "valor",
    "spo2": "valor"
  },
  "anamnese": "Resumo da queixa principal e história",
  "textoCompleto": "Transcrição completa do texto extraído do documento"
}

Se algum campo não estiver disponível, retorne array vazio [] ou null.
Seja preciso e extraia TODOS os dados relevantes do documento.`;

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

    const { fileBase64, fileType, fileName } = await req.json();

    if (!fileBase64) {
      return new Response(
        JSON.stringify({ error: "Arquivo não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("LOVABLE_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine media type for the API
    let mediaType = "image/jpeg";
    if (fileType) {
      if (fileType.includes("pdf")) {
        mediaType = "application/pdf";
      } else if (fileType.includes("png")) {
        mediaType = "image/png";
      } else if (fileType.includes("webp")) {
        mediaType = "image/webp";
      } else if (fileType.includes("gif")) {
        mediaType = "image/gif";
      }
    }

    console.log(`Processing file: ${fileName}, type: ${mediaType}`);

    // Use Gemini's vision capabilities to extract text from images/PDFs
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: extractionPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType};base64,${fileBase64}`,
                },
              },
              {
                type: "text",
                text: "Analise este documento/imagem de prontuário médico e extraia todas as informações relevantes.",
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
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
        JSON.stringify({ error: "Erro ao processar documento com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Não foi possível extrair dados do documento" }),
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

    console.log("Document parsed successfully");

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Document parser error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar documento" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
