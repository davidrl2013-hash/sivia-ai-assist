import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import jsPDF from "jspdf";

interface PatientData {
  anamnese: string;
  idade: string;
  sexo: string;
  alergias: string[];
  medicamentos: string[];
  condicoes: string[];
}

interface Prescricao {
  medicamento: string;
  apresentacao: string;
  posologia: string;
  duracao: string;
  orientacoes: string;
}

interface ClinicalData {
  diagnosticos: Array<{ nome: string; probabilidade: string }>;
  condutas: string[];
  exames: string[];
  prescricoes?: Prescricao[];
  referencias: string[];
}

interface PdfExportButtonProps {
  patientData: PatientData;
  results: ClinicalData;
  doctorName: string;
}

export function PdfExportButton({ patientData, results, doctorName }: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = 20;

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("SIVIA - Assistente Clínico Rápido", pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const now = new Date();
      const dateStr = now.toLocaleDateString("pt-BR") + " às " + now.toLocaleTimeString("pt-BR");
      doc.text(`Gerado em: ${dateStr}`, pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 6;
      doc.text(`Médico: ${doctorName}`, pageWidth / 2, yPosition, { align: "center" });
      
      // Separator
      yPosition += 8;
      doc.setDrawColor(200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Patient Data Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DADOS DO PACIENTE", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Anamnese
      const anamneseLines = doc.splitTextToSize(`Anamnese: ${patientData.anamnese || "Não informada"}`, contentWidth);
      doc.text(anamneseLines, margin, yPosition);
      yPosition += anamneseLines.length * 5 + 4;

      // Check page overflow
      const checkPageOverflow = () => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      };

      checkPageOverflow();
      doc.text(`Idade: ${patientData.idade || "Não informada"}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Sexo: ${patientData.sexo || "Não informado"}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Alergias: ${patientData.alergias.length > 0 ? patientData.alergias.join(", ") : "Nenhuma informada"}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Medicamentos: ${patientData.medicamentos.length > 0 ? patientData.medicamentos.join(", ") : "Nenhum informado"}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Condições crônicas: ${patientData.condicoes.length > 0 ? patientData.condicoes.join(", ") : "Nenhuma informada"}`, margin, yPosition);
      yPosition += 12;

      checkPageOverflow();

      // Diagnósticos Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DIAGNÓSTICOS DIFERENCIAIS", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      results.diagnosticos.forEach((diag, index) => {
        checkPageOverflow();
        doc.text(`${index + 1}. ${diag.nome} (${diag.probabilidade})`, margin + 4, yPosition);
        yPosition += 6;
      });
      yPosition += 6;

      checkPageOverflow();

      // Condutas Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CONDUTAS SUGERIDAS", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      results.condutas.forEach((conduta) => {
        checkPageOverflow();
        const lines = doc.splitTextToSize(`• ${conduta}`, contentWidth - 4);
        doc.text(lines, margin + 4, yPosition);
        yPosition += lines.length * 5 + 2;
      });
      yPosition += 6;

      checkPageOverflow();

      // Exames Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("EXAMES RECOMENDADOS", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      results.exames.forEach((exame) => {
        checkPageOverflow();
        const lines = doc.splitTextToSize(`• ${exame}`, contentWidth - 4);
        doc.text(lines, margin + 4, yPosition);
        yPosition += lines.length * 5 + 2;
      });
      yPosition += 6;

      checkPageOverflow();

      // Prescrições Section
      if (results.prescricoes && results.prescricoes.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PRESCRIÇÃO MEDICAMENTOSA", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        results.prescricoes.forEach((prescricao, index) => {
          checkPageOverflow();
          
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${prescricao.medicamento}`, margin + 4, yPosition);
          yPosition += 6;
          
          doc.setFont("helvetica", "normal");
          doc.text(`   Apresentação: ${prescricao.apresentacao}`, margin + 4, yPosition);
          yPosition += 5;
          doc.text(`   Posologia: ${prescricao.posologia}`, margin + 4, yPosition);
          yPosition += 5;
          doc.text(`   Duração: ${prescricao.duracao}`, margin + 4, yPosition);
          yPosition += 5;
          
          const orientLines = doc.splitTextToSize(`   Orientações: ${prescricao.orientacoes}`, contentWidth - 8);
          doc.text(orientLines, margin + 4, yPosition);
          yPosition += orientLines.length * 5 + 4;
        });
        yPosition += 6;

        checkPageOverflow();
      }

      // Referências Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("REFERÊNCIAS", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      results.referencias.forEach((ref) => {
        checkPageOverflow();
        const lines = doc.splitTextToSize(`• ${ref}`, contentWidth - 4);
        doc.text(lines, margin + 4, yPosition);
        yPosition += lines.length * 5 + 2;
      });
      yPosition += 10;

      checkPageOverflow();

      // Disclaimer
      doc.setDrawColor(200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      const disclaimer = "ATENÇÃO: Estas são sugestões geradas por IA. Não substituem o julgamento clínico do médico. Valide sempre as informações e considere o contexto completo do paciente.";
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
      doc.text(disclaimerLines, margin, yPosition);

      // Save
      const fileName = `SIVIA_Consulta_${now.toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePdf}
      disabled={isGenerating}
      size="lg"
      className="w-full gap-2 text-base font-semibold"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="h-5 w-5" />
          Exportar como PDF
        </>
      )}
    </Button>
  );
}
