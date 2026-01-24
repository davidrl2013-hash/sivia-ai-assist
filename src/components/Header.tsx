import { Stethoscope } from "lucide-react";

export function Header() {
  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Stethoscope className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">SIVIA</h1>
      </div>
      <p className="text-muted-foreground text-lg">Assistente Clínico Rápido</p>
    </div>
  );
}
