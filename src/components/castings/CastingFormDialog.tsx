import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, FilePlus, ArrowLeft } from "lucide-react";
import { AICastingCreator } from "@/components/castings/AICastingCreator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FloatingInput, FloatingSelect, FloatingTextarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { it } from "@/lib/i18n";
import { useCompanies } from "@/hooks/useCastings";
import type { CastingWithRelations } from "@/hooks/useCastings";

const castingSchema = z.object({
  title: z.string().trim().min(1, it.validation.required).max(160, "Massimo 160 caratteri"),
  description: z.string().max(4000, "Massimo 4000 caratteri").optional(),
  category: z.string().optional(),
  company_id: z.string().optional(),
  locations: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  compensation_amount: z.string().optional(),
  compensation_type: z.string().optional(),
  currency: z.string().optional(),
  call_datetime: z.string().optional(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  talent_instructions: z.string().optional(),
  show_client_to_talent: z.boolean().optional(),
});

type CastingFormValues = z.infer<typeof castingSchema>;

const categories = [
  { value: "film", label: "Film" },
  { value: "spot", label: "Spot Pubblicitario" },
  { value: "moda", label: "Moda" },
  { value: "teatro", label: "Teatro" },
  { value: "evento", label: "Evento" },
  { value: "tv", label: "TV" },
  { value: "altro", label: "Altro" },
];

const compensationTypes = [
  { value: "daily", label: "Giornaliero" },
  { value: "total", label: "Totale" },
  { value: "hourly", label: "Orario" },
];

interface CastingFormDialogProps {
  casting: CastingWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CastingFormValues) => void;
  isSubmitting: boolean;
  defaultCompanyId?: string;
}

export const CastingFormDialog = ({
  casting,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultCompanyId,
}: CastingFormDialogProps) => {
  const { data: companies } = useCompanies();
  const navigate = useNavigate();
  const isEdit = !!casting;
  const [step, setStep] = useState<"choose" | "ai" | "form">(isEdit ? "form" : "choose");

  useEffect(() => {
    if (open) setStep(isEdit ? "form" : "choose");
  }, [open, isEdit]);


  const form = useForm<CastingFormValues>({
    resolver: zodResolver(castingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      company_id: "",
      locations: "",
      start_date: "",
      end_date: "",
      compensation_amount: "",
      compensation_type: "",
      currency: "EUR",
      call_datetime: "",
      venue_name: "",
      venue_address: "",
      talent_instructions: "",
      show_client_to_talent: false,
    },
  });

  useEffect(() => {
    if (casting) {
      form.reset({
        title: casting.title || "",
        description: casting.description || "",
        category: casting.category || "",
        company_id: casting.company_id || "",
        locations: casting.locations?.join(", ") || "",
        start_date: casting.start_date || "",
        end_date: casting.end_date || "",
        compensation_amount: casting.compensation_amount?.toString() || "",
        compensation_type: casting.compensation_type || "",
        currency: casting.currency || "EUR",
        call_datetime: (casting as any).call_datetime
          ? new Date((casting as any).call_datetime).toISOString().slice(0, 16)
          : "",
        venue_name: (casting as any).venue_name || "",
        venue_address: (casting as any).venue_address || "",
        talent_instructions: (casting as any).talent_instructions || "",
        show_client_to_talent: !!(casting as any).show_client_to_talent,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        category: "",
        company_id: defaultCompanyId || "",
        locations: "",
        start_date: "",
        end_date: "",
        compensation_amount: "",
        compensation_type: "",
        currency: "EUR",
        call_datetime: "",
        venue_name: "",
        venue_address: "",
        talent_instructions: "",
        show_client_to_talent: false,
      });
    }
  }, [casting, form, open]);

  const handleSubmit = (values: CastingFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {!isEdit && step !== "choose" && (
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Indietro"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {isEdit
              ? "Modifica Casting"
              : step === "ai"
              ? "Crea con AI"
              : "Nuovo Casting"}
          </DialogTitle>
        </DialogHeader>

        {step === "choose" && !isEdit ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Come vuoi creare questo casting?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStep("ai")}
                className="text-left rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">Descrivi con AI</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scrivi o detta una breve descrizione: l'AI prepara titolo, ruoli e requisiti.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-left rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FilePlus className="h-4 w-4 text-primary" />
                  <span className="font-medium">Parti da zero</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compila il form manualmente con i dati del casting.
                </p>
              </button>
            </div>
          </div>
        ) : step === "ai" && !isEdit ? (
          <div className="pt-2">
            <AICastingCreator
              variant="bare"
              onCreated={(id) => {
                onOpenChange(false);
                navigate(`/owner/castings/${id}`);
              }}
            />
          </div>
        ) : (
          <Form {...form}>


          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem><FloatingInput label={`${it.casting.title} *`} value={field.value} onChange={field.onChange} error={form.formState.errors.title?.message} maxLength={160} /></FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem><FloatingTextarea label={it.casting.description} value={field.value ?? ""} onChange={field.onChange} /></FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem><FloatingSelect label={it.casting.category} value={field.value ?? ""} onValueChange={field.onChange} options={categories} /></FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem><FloatingSelect label="Azienda cliente" value={field.value ?? ""} onValueChange={field.onChange} options={(companies ?? []).map((company) => ({ value: company.id, label: company.name }))} /></FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="locations"
              render={({ field }) => (
                <FormItem><FloatingInput label={it.casting.locations} value={field.value ?? ""} onChange={field.onChange} maxLength={500} /></FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem><FloatingInput label="Data inizio" type="date" value={field.value ?? ""} onChange={field.onChange} /></FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem><FloatingInput label="Data fine" type="date" value={field.value ?? ""} onChange={field.onChange} /></FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="compensation_amount"
                render={({ field }) => (
                  <FormItem><FloatingInput label="Compenso" type="number" inputMode="decimal" value={field.value ?? ""} onChange={field.onChange} /></FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compensation_type"
                render={({ field }) => (
                  <FormItem><FloatingSelect label="Tipo compenso" value={field.value ?? ""} onValueChange={field.onChange} options={compensationTypes} /></FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem><FloatingSelect label="Valuta" value={field.value ?? ""} onValueChange={field.onChange} options={[{ value: "EUR", label: "EUR" }, { value: "USD", label: "USD" }, { value: "GBP", label: "GBP" }]} /></FormItem>
                )}
              />
            </div>

            <div className="border-t border-divider pt-4 space-y-4">
              <p className="text-sm font-medium text-foreground">Convocazione (visibile ai talent pubblicati)</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="call_datetime"
                  render={({ field }) => (
                    <FormItem><FloatingInput label="Data e ora convocazione" type="datetime-local" value={field.value ?? ""} onChange={field.onChange} /></FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venue_name"
                  render={({ field }) => (
                    <FormItem><FloatingInput label="Nome location" value={field.value ?? ""} onChange={field.onChange} maxLength={160} /></FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="venue_address"
                render={({ field }) => (
                  <FormItem><FloatingInput label="Indirizzo completo" value={field.value ?? ""} onChange={field.onChange} maxLength={300} /></FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="talent_instructions"
                render={({ field }) => (
                  <FormItem><FloatingTextarea label="Istruzioni per il talent" value={field.value ?? ""} onChange={field.onChange} /></FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_client_to_talent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4">
                    <div>
                      <FormLabel>Mostra il nome del cliente ai talent</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Disattivato: i talent vedono solo il titolo del progetto.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>


            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {it.common.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? it.common.loading : it.common.save}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
