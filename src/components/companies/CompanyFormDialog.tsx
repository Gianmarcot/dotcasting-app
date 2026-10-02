import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { FloatingInput, FloatingSelect, FloatingTextarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { COMPANY_TYPES } from "@/hooks/useCompanies";
import type { Tables } from "@/integrations/supabase/types";

const schema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  type: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  website: z.string().optional(),
  vat_number: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  company: Tables<"companies"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

export const CompanyFormDialog = ({ company, open, onOpenChange, onSubmit, isSubmitting }: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "", location: "", email: "", website: "", vat_number: "", notes: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: company?.name || "",
        type: company?.type || "",
        location: company?.location || "",
        email: (company as any)?.email || "",
        website: company?.website || "",
        vat_number: (company as any)?.vat_number || "",
        notes: company?.notes || "",
      });
    }
  }, [company, open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{company ? "Modifica Azienda" : "Nuova Azienda"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FloatingInput label="Nome *" value={field.value} onChange={field.onChange} error={form.formState.errors.name?.message} maxLength={120} /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FloatingSelect label="Settore" value={field.value ?? ""} onValueChange={field.onChange} options={COMPANY_TYPES} /></FormItem>
              )} />

              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FloatingInput label="Sede" value={field.value ?? ""} onChange={field.onChange} maxLength={120} /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FloatingInput label="Email" type="email" inputMode="email" value={field.value ?? ""} onChange={field.onChange} error={form.formState.errors.email?.message} maxLength={255} /></FormItem>
              )} />

              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem><FloatingInput label="Sito web" inputMode="url" value={field.value ?? ""} onChange={field.onChange} maxLength={500} /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="vat_number" render={({ field }) => (
              <FormItem><FloatingInput label="Partita IVA" value={field.value ?? ""} onChange={field.onChange} maxLength={32} /></FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FloatingTextarea label="Note interne" value={field.value ?? ""} onChange={field.onChange} /></FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
