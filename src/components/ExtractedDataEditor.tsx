import { useState } from "react";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExtractedData {
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

interface ExtractedDataEditorProps {
  data: ExtractedData;
  onChange: (data: ExtractedData) => void;
  onReprocess: () => void;
}

function EditableChipList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 border rounded-md bg-muted/30">
        {items.map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 pr-1"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground">Nenhum item</span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newItem.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ExtractedDataEditor({
  data,
  onChange,
  onReprocess,
}: ExtractedDataEditorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showFullText, setShowFullText] = useState(false);

  const updateField = <K extends keyof ExtractedData>(
    field: K,
    value: ExtractedData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateVitals = (key: keyof NonNullable<ExtractedData["sinaisVitais"]>, value: string) => {
    onChange({
      ...data,
      sinaisVitais: {
        ...data.sinaisVitais,
        [key]: value,
      },
    });
  };

  return (
    <Card className="border-primary/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-primary">✓</span>
                Dados Extraídos – Revise e Edite
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Chips editáveis */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <EditableChipList
                label="Alergias"
                items={data.alergias || []}
                onChange={(items) => updateField("alergias", items)}
                placeholder="Adicionar alergia..."
              />
              <EditableChipList
                label="Medicamentos em Uso"
                items={data.medicamentos || []}
                onChange={(items) => updateField("medicamentos", items)}
                placeholder="Adicionar medicamento..."
              />
              <EditableChipList
                label="Comorbidades"
                items={data.condicoessCronicas || []}
                onChange={(items) => updateField("condicoessCronicas", items)}
                placeholder="Adicionar comorbidade..."
              />
            </div>

            {/* Sinais Vitais */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sinais Vitais</Label>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">PA</Label>
                  <Input
                    value={data.sinaisVitais?.pa || ""}
                    onChange={(e) => updateVitals("pa", e.target.value)}
                    placeholder="120/80"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">FC</Label>
                  <Input
                    value={data.sinaisVitais?.fc || ""}
                    onChange={(e) => updateVitals("fc", e.target.value)}
                    placeholder="80 bpm"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">FR</Label>
                  <Input
                    value={data.sinaisVitais?.fr || ""}
                    onChange={(e) => updateVitals("fr", e.target.value)}
                    placeholder="18 irpm"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Temp</Label>
                  <Input
                    value={data.sinaisVitais?.temp || ""}
                    onChange={(e) => updateVitals("temp", e.target.value)}
                    placeholder="36.5°C"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">SpO2</Label>
                  <Input
                    value={data.sinaisVitais?.spo2 || ""}
                    onChange={(e) => updateVitals("spo2", e.target.value)}
                    placeholder="98%"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Histórico Pregresso */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Histórico Pregresso</Label>
              <Textarea
                value={(data.historicoPregresso || []).join("\n")}
                onChange={(e) =>
                  updateField(
                    "historicoPregresso",
                    e.target.value.split("\n").filter((line) => line.trim())
                  )
                }
                placeholder="Uma linha por item..."
                className="min-h-[60px] text-sm"
              />
            </div>

            {/* Histórico Familiar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Histórico Familiar</Label>
              <Textarea
                value={(data.historicoFamiliar || []).join("\n")}
                onChange={(e) =>
                  updateField(
                    "historicoFamiliar",
                    e.target.value.split("\n").filter((line) => line.trim())
                  )
                }
                placeholder="Uma linha por item..."
                className="min-h-[60px] text-sm"
              />
            </div>

            {/* Anamnese */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Anamnese/Queixa</Label>
              <Textarea
                value={data.anamnese || ""}
                onChange={(e) => updateField("anamnese", e.target.value)}
                placeholder="Queixa principal e história..."
                className="min-h-[80px] text-sm"
              />
            </div>

            {/* Texto Completo (readonly) */}
            {data.textoCompleto && (
              <Collapsible open={showFullText} onOpenChange={setShowFullText}>
                <div className="space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-muted-foreground hover:text-foreground"
                    >
                      <span className="text-sm font-medium">
                        Transcrição completa do documento
                      </span>
                      {showFullText ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Textarea
                      value={data.textoCompleto}
                      readOnly
                      className="min-h-[150px] text-xs bg-muted/50 cursor-default"
                    />
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Botão Reprocessar */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={onReprocess}>
                Reprocessar Documento
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
