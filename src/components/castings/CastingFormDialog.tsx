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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { it } from "@/lib/i18n";
import { useCompanies } from "@/hooks/useCastings";
import type { CastingWithRelations } from "@/hooks/useCastings";

const castingSchema = z.object({
  title: z.string().min(1, it.validation.required),
  description: z.string().optional(),
  category: z.string().optional(),
  company_id: z.string().optional(),
  locations: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  compensation_amount: z.string().optional(),
  compensation_type: z.string().optional(),
  currency: z.string().optional(),
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
  const [step, setStep] = useState<"choose" | "form">(isEdit ? "form" : "choose");

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
            {!isEdit && step === "form" && (
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Indietro"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {isEdit ? "Modifica Casting" : "Nuovo Casting"}
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
                onClick={() => {
                  /* AI panel sotto */
                }}
                className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors"
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
                className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors"
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

            <div className="pt-2">
              <AICastingCreator
                variant="bare"
                onCreated={(id) => {
                  onOpenChange(false);
                  navigate(`/owner/castings/${id}`);
                }}
              />
            </div>
          </div>
        ) : (
          <Form {...form}>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{it.casting.title} *</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Modella per Campagna Beauty" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{it.casting.description}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrivi il casting, i requisiti e le aspettative..."
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{it.casting.category}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Azienda Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona azienda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="locations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{it.casting.locations}</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Milano, Roma (separati da virgola)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Inizio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Fine</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="compensation_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compenso</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compensation_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo compenso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {compensationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valuta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Valuta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
