import jsPDF from "jspdf";
import {
  OccupationalExamFormData,
  examTypeLabels,
  parecerLabels,
  nrRisks,
  complementaryExams,
} from "@/types/occupational";

export async function generateOccupationalPdf(
  data: OccupationalExamFormData,
  doctorName: string
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  const checkPageOverflow = () => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ATESTADO DE SAÚDE OCUPACIONAL - ASO", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(examTypeLabels[data.tipoExame], pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 6;
  doc.setFontSize(10);
  doc.text("NR-7 PCMSO", pageWidth / 2, yPosition, { align: "center" });
  
  // Separator
  yPosition += 8;
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Company Info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DA EMPRESA", margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Empresa: ${data.empresaNome}`, margin, yPosition);
  yPosition += 5;
  if (data.empresaCnpj) {
    doc.text(`CNPJ: ${data.empresaCnpj}`, margin, yPosition);
    yPosition += 5;
  }
  doc.text(`Setor: ${data.setor} | Função: ${data.funcao}`, margin, yPosition);
  yPosition += 10;

  checkPageOverflow();

  // Worker Info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO TRABALHADOR", margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${data.trabalhadorNome}`, margin, yPosition);
  yPosition += 5;
  if (data.trabalhadorCpf) {
    doc.text(`CPF: ${data.trabalhadorCpf}`, margin, yPosition);
    yPosition += 5;
  }
  const workerInfo = [];
  if (data.dataNascimento) workerInfo.push(`Nascimento: ${data.dataNascimento}`);
  if (data.idade) workerInfo.push(`Idade: ${data.idade} anos`);
  if (data.sexo) workerInfo.push(`Sexo: ${data.sexo}`);
  if (workerInfo.length > 0) {
    doc.text(workerInfo.join(" | "), margin, yPosition);
    yPosition += 5;
  }
  yPosition += 5;

  checkPageOverflow();

  // Occupational Risks
  if (data.riscosNR && data.riscosNR.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("RISCOS OCUPACIONAIS", margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const riskLabels = data.riscosNR.map((code) => {
      const risk = nrRisks.find((r) => r.code === code);
      return risk ? `${risk.code} - ${risk.label}` : code;
    });
    const riskText = doc.splitTextToSize(riskLabels.join("; "), contentWidth);
    doc.text(riskText, margin, yPosition);
    yPosition += riskText.length * 5 + 3;

    if (data.descricaoRiscos) {
      const descLines = doc.splitTextToSize(`Descrição: ${data.descricaoRiscos}`, contentWidth);
      doc.text(descLines, margin, yPosition);
      yPosition += descLines.length * 5 + 3;
    }

    if (data.usaEPI && data.epiUtilizados) {
      doc.text(`EPIs: ${data.epiUtilizados}`, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 5;
  }

  checkPageOverflow();

  // Physical Exam
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("EXAME CLÍNICO", margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Vital signs
  const vitals = [];
  if (data.pressaoArterial) vitals.push(`PA: ${data.pressaoArterial} mmHg`);
  if (data.frequenciaCardiaca) vitals.push(`FC: ${data.frequenciaCardiaca} bpm`);
  if (data.peso) vitals.push(`Peso: ${data.peso} kg`);
  if (data.altura) vitals.push(`Altura: ${data.altura} m`);
  if (data.imc) vitals.push(`IMC: ${data.imc}`);
  if (vitals.length > 0) {
    doc.text(vitals.join(" | "), margin, yPosition);
    yPosition += 5;
  }

  if (data.exameClinico) {
    const examLines = doc.splitTextToSize(data.exameClinico, contentWidth);
    doc.text(examLines, margin, yPosition);
    yPosition += examLines.length * 5 + 3;
  }
  yPosition += 5;

  checkPageOverflow();

  // Complementary Exams
  if (data.examesComplementares && data.examesComplementares.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("EXAMES COMPLEMENTARES", margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const examLabels = data.examesComplementares.map((code) => {
      const exam = complementaryExams.find((e) => e.code === code);
      return exam ? exam.label : code;
    });
    const examText = doc.splitTextToSize(examLabels.join("; "), contentWidth);
    doc.text(examText, margin, yPosition);
    yPosition += examText.length * 5 + 3;

    if (data.resultadosExames) {
      const resultLines = doc.splitTextToSize(`Resultados: ${data.resultadosExames}`, contentWidth);
      doc.text(resultLines, margin, yPosition);
      yPosition += resultLines.length * 5 + 3;
    }
    yPosition += 5;
  }

  checkPageOverflow();

  // Return to Work specific
  if (data.tipoExame === "retorno_trabalho" && data.afastamentoAnterior) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO AFASTAMENTO", margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (data.motivoAfastamento) {
      doc.text(`Motivo: ${data.motivoAfastamento}`, margin, yPosition);
      yPosition += 5;
    }
    if (data.diasAfastamento) {
      doc.text(`Dias de afastamento: ${data.diasAfastamento}`, margin, yPosition);
      yPosition += 5;
    }
    if (data.documentoINSS) {
      doc.text(`Documento INSS: ${data.documentoINSS}`, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 5;
  }

  checkPageOverflow();

  // Conclusion
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PARECER", margin, yPosition);
  yPosition += 7;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const parecerConfig = parecerLabels[data.parecer];
  doc.text(parecerConfig.label.toUpperCase(), margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (data.parecer === "apto_restricao" && data.restricoes) {
    const restricLines = doc.splitTextToSize(`Restrições: ${data.restricoes}`, contentWidth);
    doc.text(restricLines, margin, yPosition);
    yPosition += restricLines.length * 5 + 3;
  }

  if (data.observacoes) {
    const obsLines = doc.splitTextToSize(`Observações: ${data.observacoes}`, contentWidth);
    doc.text(obsLines, margin, yPosition);
    yPosition += obsLines.length * 5 + 3;
  }
  yPosition += 10;

  checkPageOverflow();

  // Signature
  doc.setDrawColor(100);
  doc.line(margin, yPosition, margin + 80, yPosition);
  yPosition += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Dr(a). ${doctorName}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Data: ${data.dataExame}`, margin, yPosition);
  yPosition += 15;

  checkPageOverflow();

  // Footer disclaimer
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const disclaimer = "Este documento foi gerado pelo sistema SIVIA. O médico é responsável por validar todas as informações antes de assinar.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, yPosition);

  // Save
  const fileName = `ASO_${data.trabalhadorNome.replace(/\s+/g, "_")}_${data.dataExame}.pdf`;
  doc.save(fileName);
}
