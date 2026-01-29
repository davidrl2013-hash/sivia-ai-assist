import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, FileText, Image, X, UserPlus, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExtractedDataEditor } from "./ExtractedDataEditor";

export interface ExtractedData {
  dadosPaciente?: {
    nome?: string;
    idade?: string;
    sexo?: string;
    dataNascimento?: string;
  };
  alergias?: string[];
  medicamentos?: string[];
  condicoessCronicas?: string[];
  historicoPregresso?: string[];
  historicoFamiliar?: string[];
  sinaisVitais?: {
    pa?: string;
    fc?: string;
    fr?: string;
    temp?: string;
    spo2?: string;
  };
  anamnese?: string;
  textoCompleto?: string;
}

interface PatientReceptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataExtracted: (data: {
    iniciais: string;
    idade: string;
    sexo: string;
    anamnese: string;
    extractedData?: ExtractedData;
  }) => void;
}

export function PatientReceptionModal({
  open,
  onOpenChange,
  onDataExtracted,
}: PatientReceptionModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [iniciais, setIniciais] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [comorbidades, setComorbidades] = useState("");
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Envie um PDF ou imagem (JPG, PNG, WebP, GIF).",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setExtractedData(null);
  }, [toast]);

  const processDocument = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);

    try {
      // Convert file to base64
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const { data, error } = await supabase.functions.invoke("document-parser", {
        body: {
          fileBase64: base64,
          fileType: uploadedFile.type,
          fileName: uploadedFile.name,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setExtractedData(data.data);

      // Auto-fill fields from extracted data
      if (data.data.dadosPaciente) {
        if (data.data.dadosPaciente.nome && !iniciais) {
          setIniciais(data.data.dadosPaciente.nome);
        }
        if (data.data.dadosPaciente.idade && !idade) {
          const ageMatch = data.data.dadosPaciente.idade.match(/\d+/);
          if (ageMatch) setIdade(ageMatch[0]);
        }
        if (data.data.dadosPaciente.sexo && !sexo) {
          const s = data.data.dadosPaciente.sexo.toLowerCase();
          if (s.includes("m") || s.includes("masc")) setSexo("masculino");
          else if (s.includes("f") || s.includes("fem")) setSexo("feminino");
        }
      }

      // Build comorbidades from extracted data
      const allConditions = [
        ...(data.data.condicoessCronicas || []),
      ];
      if (allConditions.length > 0 && !comorbidades) {
        setComorbidades(allConditions.join(", "));
      }

      toast({
        title: "Documento processado",
        description: "Os dados foram extraídos com sucesso.",
      });
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        title: "Erro ao processar",
        description: error instanceof Error ? error.message : "Não foi possível processar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReprocess = () => {
    setExtractedData(null);
    if (uploadedFile) {
      processDocument();
    }
  };

  const handleExtractedDataChange = (newData: ExtractedData) => {
    setExtractedData(newData);
  };
  const handleConfirm = () => {
    // Build the anamnese text from all collected data
    let anamneseText = "";
    
    // Patient info
    if (iniciais) anamneseText += `Paciente: ${iniciais}`;
    if (idade) anamneseText += `, ${idade} anos`;
    if (sexo) anamneseText += `, ${sexo}`;
    anamneseText += ".\n\n";

    // If we have extracted data, include it
    if (extractedData) {
      if (extractedData.alergias && extractedData.alergias.length > 0) {
        anamneseText += `ALERGIAS: ${extractedData.alergias.join(", ")}.\n\n`;
      }
      if (extractedData.medicamentos && extractedData.medicamentos.length > 0) {
        anamneseText += `MEDICAMENTOS EM USO: ${extractedData.medicamentos.join("; ")}.\n\n`;
      }
      if (extractedData.condicoessCronicas && extractedData.condicoessCronicas.length > 0) {
        anamneseText += `COMORBIDADES: ${extractedData.condicoessCronicas.join(", ")}.\n\n`;
      } else if (comorbidades) {
        anamneseText += `COMORBIDADES: ${comorbidades}.\n\n`;
      }
      if (extractedData.historicoPregresso && extractedData.historicoPregresso.length > 0) {
        anamneseText += `HISTÓRICO PREGRESSO: ${extractedData.historicoPregresso.join("; ")}.\n\n`;
      }
      if (extractedData.historicoFamiliar && extractedData.historicoFamiliar.length > 0) {
        anamneseText += `HISTÓRICO FAMILIAR: ${extractedData.historicoFamiliar.join("; ")}.\n\n`;
      }
      if (extractedData.sinaisVitais) {
        const sv = extractedData.sinaisVitais;
        const vitals = [];
        if (sv.pa) vitals.push(`PA: ${sv.pa}`);
        if (sv.fc) vitals.push(`FC: ${sv.fc}`);
        if (sv.fr) vitals.push(`FR: ${sv.fr}`);
        if (sv.temp) vitals.push(`Temp: ${sv.temp}`);
        if (sv.spo2) vitals.push(`SpO2: ${sv.spo2}`);
        if (vitals.length > 0) {
          anamneseText += `SINAIS VITAIS: ${vitals.join(", ")}.\n\n`;
        }
      }
      if (extractedData.anamnese) {
        anamneseText += `ANAMNESE/QUEIXA: ${extractedData.anamnese}\n\n`;
      }
      if (extractedData.textoCompleto) {
        anamneseText += `--- DADOS ADICIONAIS DO DOCUMENTO ---\n${extractedData.textoCompleto}`;
      }
    } else if (comorbidades) {
      anamneseText += `COMORBIDADES: ${comorbidades}.\n\n`;
    }

    onDataExtracted({
      iniciais,
      idade,
      sexo,
      anamnese: anamneseText.trim(),
      extractedData: extractedData || undefined,
    });

    // Reset state
    setIniciais("");
    setIdade("");
    setSexo("");
    setComorbidades("");
    setUploadedFile(null);
    setExtractedData(null);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onDataExtracted({
      iniciais,
      idade,
      sexo,
      anamnese: "",
    });
    
    // Reset state
    setIniciais("");
    setIdade("");
    setSexo("");
    setComorbidades("");
    setUploadedFile(null);
    setExtractedData(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Nova Consulta
          </DialogTitle>
          <DialogDescription>
            Insira os dados iniciais do paciente ou importe um prontuário existente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Basic Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="iniciais">Iniciais do Paciente</Label>
              <Input
                id="iniciais"
                value={iniciais}
                onChange={(e) => setIniciais(e.target.value.toUpperCase())}
                placeholder="M.S.L."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="idade">Idade</Label>
              <Input
                id="idade"
                type="number"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="45"
                min="0"
                max="150"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sexo">Sexo</Label>
              <Select value={sexo} onValueChange={setSexo}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="comorbidades">Comorbidades Iniciais (opcional)</Label>
            <Textarea
              id="comorbidades"
              value={comorbidades}
              onChange={(e) => setComorbidades(e.target.value)}
              placeholder="HAS, DM2, hipotireoidismo..."
              className="mt-1 min-h-[60px]"
            />
          </div>

          {/* File Upload Section */}
          <div className="border-t pt-4">
            <Label className="text-base font-medium">Importar Prontuário Existente</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Upload de PDF, foto ou print de tela do prontuário para extração automática.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!uploadedFile ? (
              <Button
                variant="outline"
                className="w-full h-24 border-dashed flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para enviar PDF ou imagem
                </span>
              </Button>
            ) : (
              <div className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {uploadedFile.type.includes("pdf") ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : (
                      <Image className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {uploadedFile.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {!extractedData && (
                  <Button
                    onClick={processDocument}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extraindo dados...
                      </>
                    ) : (
                      "Processar Documento"
                    )}
                  </Button>
                )}

              </div>
            )}
          </div>

          {/* Editor de dados extraídos */}
          {extractedData && (
            <ExtractedDataEditor
              data={extractedData}
              onChange={handleExtractedDataChange}
              onReprocess={handleReprocess}
            />
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Os dados importados serão integrados à consulta para análise. Sempre confirme as informações extraídas.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Pular
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Iniciar Consulta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
