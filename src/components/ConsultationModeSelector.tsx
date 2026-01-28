import { Stethoscope, AlertCircle, Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ConsultationMode = "normal" | "emergency" | "occupational";

interface ConsultationModeSelectorProps {
  mode: ConsultationMode;
  onModeChange: (mode: ConsultationMode) => void;
  disabled?: boolean;
}

const modeConfig = {
  normal: {
    label: "Consulta Normal",
    icon: Stethoscope,
    description: "Análise clínica padrão com diagnósticos, condutas e prescrições",
    color: "text-primary",
  },
  emergency: {
    label: "Emergência/Urgência",
    icon: AlertCircle,
    description: "Prioriza condutas rápidas e protocolos de emergência (ABCDE)",
    color: "text-red-500",
  },
  occupational: {
    label: "Medicina Ocupacional",
    icon: Briefcase,
    description: "Exames NR-7 PCMSO, formulários e laudos ocupacionais",
    color: "text-blue-500",
  },
};

export function ConsultationModeSelector({
  mode,
  onModeChange,
  disabled = false,
}: ConsultationModeSelectorProps) {
  const currentConfig = modeConfig[mode];
  const Icon = currentConfig.icon;

  return (
    <div className="space-y-2">
      <Select value={mode} onValueChange={(v) => onModeChange(v as ConsultationMode)} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${currentConfig.color}`} />
              <span>{currentConfig.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(modeConfig).map(([key, config]) => {
            const ModeIcon = config.icon;
            return (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <ModeIcon className={`h-4 w-4 ${config.color}`} />
                  <div>
                    <span className="font-medium">{config.label}</span>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{currentConfig.description}</p>
    </div>
  );
}
