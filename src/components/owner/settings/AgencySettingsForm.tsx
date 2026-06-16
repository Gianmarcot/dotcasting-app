import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings, useUpdateAppSettings, type AppSettingsInput } from "@/hooks/useAppSettings";
import { compressImage } from "@/lib/media/compressImage";

const schema = z.object({
  agency_name: z.string().trim().max(120, "Massimo 120 caratteri").optional().or(z.literal("")),
  contact_email: z
    .string()
    .trim()
    .max(255)
    .email("Email non valida")
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().trim().max(40).optional().or(z.literal("")),
  website_url: z
    .string()
    .trim()
    .max(255)
    .url("URL non valido (includi https://)")
    .optional()
    .or(z.literal("")),
});

const LOGO_PREFIX = "branding";

export const AgencySettingsForm = () => {
  const { data, isLoading } = useAppSettings();
  const update = useUpdateAppSettings();
  const [form, setForm] = useState<AppSettingsInput>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) {
      setForm({
        agency_name: data.agency_name ?? "",
        agency_logo_url: data.agency_logo_url ?? "",
        contact_email: data.contact_email ?? "",
        contact_phone: data.contact_phone ?? "",
        website_url: data.website_url ?? "",
      });
    }
  }, [data]);

  const set = <K extends keyof AppSettingsInput>(k: K, v: AppSettingsInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      agency_name: form.agency_name ?? "",
      contact_email: form.contact_email ?? "",
      contact_phone: form.contact_phone ?? "",
      website_url: form.website_url ?? "",
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first.message);
      return;
    }

    try {
      await update.mutateAsync({
        agency_name: form.agency_name?.toString().trim() || null,
        agency_logo_url: form.agency_logo_url || null,
        contact_email: form.contact_email?.toString().trim() || null,
        contact_phone: form.contact_phone?.toString().trim() || null,
        website_url: form.website_url?.toString().trim() || null,
      });
      toast.success("Impostazioni salvate");
    } catch (err: any) {
      toast.error(err?.message ?? "Errore durante il salvataggio");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Seleziona un'immagine");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file, "avatar");
      const ext = compressed.name.split(".").pop() || "jpg";
      const path = `${LOGO_PREFIX}/agency-logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

      // Delete previous logo (best-effort)
      const prev = form.agency_logo_url;
      if (prev) {
        const marker = "/avatars/";
        const idx = prev.indexOf(marker);
        if (idx >= 0) {
          const oldPath = prev.substring(idx + marker.length);
          await supabase.storage.from("avatars").remove([oldPath]).catch(() => {});
        }
      }

      set("agency_logo_url", urlData.publicUrl);
      await update.mutateAsync({ agency_logo_url: urlData.publicUrl });
      toast.success("Logo aggiornato");
    } catch (err: any) {
      toast.error(err?.message ?? "Errore durante l'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleLogoRemove = async () => {
    const prev = form.agency_logo_url;
    if (!prev) return;
    try {
      const marker = "/avatars/";
      const idx = prev.indexOf(marker);
      if (idx >= 0) {
        const oldPath = prev.substring(idx + marker.length);
        await supabase.storage.from("avatars").remove([oldPath]).catch(() => {});
      }
      set("agency_logo_url", null);
      await update.mutateAsync({ agency_logo_url: null });
      toast.success("Logo rimosso");
    } catch (err: any) {
      toast.error(err?.message ?? "Errore");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="dc-card p-6 md:p-8 space-y-6">
      <div className="space-y-3">
        <Label>Logo agenzia</Label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border">
            {form.agency_logo_url ? (
              <img src={form.agency_logo_url} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">Nessuno</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Carica logo
            </Button>
            {form.agency_logo_url && (
              <Button type="button" variant="ghost" size="sm" onClick={handleLogoRemove}>
                <Trash2 className="h-4 w-4 mr-2" />
                Rimuovi
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="agency_name">Nome agenzia</Label>
          <Input
            id="agency_name"
            value={form.agency_name ?? ""}
            onChange={(e) => set("agency_name", e.target.value)}
            placeholder="es. dotCasting"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website_url">Sito web</Label>
          <Input
            id="website_url"
            type="url"
            value={form.website_url ?? ""}
            onChange={(e) => set("website_url", e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email">Email di contatto</Label>
          <Input
            id="contact_email"
            type="email"
            value={form.contact_email ?? ""}
            onChange={(e) => set("contact_email", e.target.value)}
            placeholder="info@agenzia.it"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Telefono</Label>
          <Input
            id="contact_phone"
            value={form.contact_phone ?? ""}
            onChange={(e) => set("contact_phone", e.target.value)}
            placeholder="+39 ..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={update.isPending} className="rounded-full">
          {update.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salva modifiche
        </Button>
      </div>
    </form>
  );
};
