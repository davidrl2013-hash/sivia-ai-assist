import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Building2, User, ClipboardList, Stethoscope, FileCheck, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  occupationalExamSchema,
  OccupationalExamFormData,
  OccupationalExamType,
  examTypeLabels,
  nrRisks,
  complementaryExams,
  parecerLabels,
} from "@/types/occupational";
import { useState } from "react";
import { generateOccupationalPdf } from "@/lib/occupationalPdf";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OccupationalExamFormProps {
  examType: OccupationalExamType;
  onBack: () => void;
}

export function OccupationalExamForm({ examType, onBack }: OccupationalExamFormProps) {
  const { user } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [doctorName, setDoctorName] = useState("Médico");

  // Fetch doctor name
  useState(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) setDoctorName(data.full_name);
      }
    };
    fetchProfile();
  });

  const form = useForm<OccupationalExamFormData>({
    resolver: zodResolver(occupationalExamSchema),
    defaultValues: {
      tipoExame: examType,
      dataExame: new Date().toISOString().split("T")[0],
      riscosNR: [],
      examesComplementares: [],
      afastamentoAnterior: false,
      usaEPI: false,
      parecer: "apto",
    },
  });

  const isRetornoTrabalho = examType === "retorno_trabalho";
  const watchAfastamento = form.watch("afastamentoAnterior");

  const onSubmit = async (data: OccupationalExamFormData) => {
    setIsGeneratingPdf(true);
    try {
      await generateOccupationalPdf(data, doctorName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              {examTypeLabels[examType]}
            </h2>
            <p className="text-sm text-muted-foreground">NR-7 PCMSO</p>
          </div>
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="empresaNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Empresa LTDA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="empresaCnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="setor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor *</FormLabel>
                    <FormControl>
                      <Input placeholder="Administrativo, Produção..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="funcao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função *</FormLabel>
                    <FormControl>
                      <Input placeholder="Operador, Analista..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Worker Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados do Trabalhador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trabalhadorNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do trabalhador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trabalhadorCpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="35" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Occupational History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Histórico Ocupacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="historicoOcupacional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Histórico de Empregos Anteriores</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva empregos anteriores, funções exercidas e exposições ocupacionais..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tempoFuncaoAtual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo na Função Atual</FormLabel>
                    <FormControl>
                      <Input placeholder="2 anos e 3 meses" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tempoEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo na Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="5 anos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isRetornoTrabalho && (
              <>
                <FormField
                  control={form.control}
                  name="afastamentoAnterior"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Afastamento anterior &gt;30 dias</FormLabel>
                    </FormItem>
                  )}
                />
                {watchAfastamento && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
                    <FormField
                      control={form.control}
                      name="motivoAfastamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo do Afastamento</FormLabel>
                          <FormControl>
                            <Input placeholder="CID, descrição..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="diasAfastamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dias de Afastamento</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="45" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="documentoINSS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Documento INSS</FormLabel>
                          <FormControl>
                            <Input placeholder="Número do benefício..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dataRetornoPrevisto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Retorno Previsto</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* NR Risks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Riscos Ocupacionais (NR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="riscosNR"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {nrRisks.map((risk) => (
                      <div key={risk.code} className="flex items-center gap-2">
                        <Checkbox
                          checked={field.value?.includes(risk.code)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, risk.code]);
                            } else {
                              field.onChange(current.filter((v) => v !== risk.code));
                            }
                          }}
                        />
                        <span className="text-sm">
                          <strong>{risk.code}</strong> - {risk.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricaoRiscos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição dos Riscos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente os riscos ocupacionais..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usaEPI"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Utiliza EPI</FormLabel>
                </FormItem>
              )}
            />
            {form.watch("usaEPI") && (
              <FormField
                control={form.control}
                name="epiUtilizados"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EPIs Utilizados</FormLabel>
                    <FormControl>
                      <Input placeholder="Capacete, luvas, protetor auricular..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Health Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Avaliação Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="queixasAtuais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Queixas Atuais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva queixas relatadas pelo trabalhador..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="antecedentesPatologicos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antecedentes Patológicos</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Doenças prévias, cirurgias..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alergias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alergias</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Medicamentos, substâncias..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="medicamentosUso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamentos em Uso</FormLabel>
                  <FormControl>
                    <Input placeholder="Liste medicamentos atuais..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Physical Exam */}
            <div className="pt-2 border-t">
              <h4 className="font-medium mb-3">Exame Físico</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <FormField
                  control={form.control}
                  name="pressaoArterial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">PA (mmHg)</FormLabel>
                      <FormControl>
                        <Input placeholder="120/80" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequenciaCardiaca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">FC (bpm)</FormLabel>
                      <FormControl>
                        <Input placeholder="72" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="peso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Peso (kg)</FormLabel>
                      <FormControl>
                        <Input placeholder="70" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="altura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Altura (m)</FormLabel>
                      <FormControl>
                        <Input placeholder="1.75" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">IMC</FormLabel>
                      <FormControl>
                        <Input placeholder="22.9" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="exameClinico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exame Clínico Detalhado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva achados do exame físico..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Complementary Exams */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Exames Complementares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="examesComplementares"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {complementaryExams.map((exam) => (
                      <div key={exam.code} className="flex items-center gap-2">
                        <Checkbox
                          checked={field.value?.includes(exam.code)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, exam.code]);
                            } else {
                              field.onChange(current.filter((v) => v !== exam.code));
                            }
                          }}
                        />
                        <span className="text-sm">{exam.label}</span>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resultadosExames"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultados dos Exames</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva resultados relevantes..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Conclusão / Parecer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="parecer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parecer *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parecer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(parecerLabels).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <span className={config.color}>{config.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("parecer") === "apto_restricao" && (
              <FormField
                control={form.control}
                name="restricoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restrições</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva as restrições aplicáveis..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais, recomendações..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isGeneratingPdf} className="flex-1 gap-2">
            {isGeneratingPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Gerar ASO (PDF)
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
