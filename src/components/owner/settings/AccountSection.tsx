import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { TeamMembersSection } from "@/components/owner/settings/TeamMembersSection";

const pwdSchema = z
  .object({
    password: z.string().min(8, "La password deve avere almeno 8 caratteri").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Le password non coincidono",
    path: ["confirm"],
  });

const profileSchema = z.object({
  first_name: z.string().trim().max(80, "Massimo 80 caratteri"),
  last_name: z.string().trim().max(80, "Massimo 80 caratteri"),
});

export const AccountSection = () => {
  const { user, userRole } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
  }, [profile?.first_name, profile?.last_name]);

  const initials =
    ((firstName.charAt(0) || "") + (lastName.charAt(0) || "")).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "A";

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    const parsed = profileSchema.safeParse({ first_name: firstName, last_name: lastName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: parsed.data.first_name || null,
          last_name: parsed.data.last_name || null,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profilo aggiornato");
      invalidateProfile();
    } catch (err: any) {
      toast.error(err?.message ?? "Errore durante il salvataggio");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Seleziona un file immagine");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Immagine troppo grande (max 5MB)");
      return;
    }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ profile_photo_url: pub.publicUrl })
        .eq("user_id", user.id);
      if (dbErr) throw dbErr;
      toast.success("Foto profilo aggiornata");
      invalidateProfile();
    } catch (err: any) {
      toast.error(err?.message ?? "Errore durante il caricamento");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAvatarRemove = async () => {
    if (!user?.id) return;
    setUploadingAvatar(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ profile_photo_url: null })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Foto rimossa");
      invalidateProfile();
    } catch (err: any) {
      toast.error(err?.message ?? "Errore durante la rimozione");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = pwdSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password aggiornata");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      toast.error(err?.message ?? "Errore durante l'aggiornamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profilo personale */}
      <form onSubmit={handleSaveProfile} className="dc-card p-6 md:p-8 space-y-6">
        <div>
          <h3 className="font-tenor uppercase tracking-wide text-lg text-foreground">
            Il tuo profilo
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Nome, cognome e foto mostrati nel pannello.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <Avatar size="lg">
            {profile?.profile_photo_url ? (
              <AvatarImage src={profile.profile_photo_url} alt="" />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatarUpload(f);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              iconPosition="left"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Cambia foto
            </Button>
            {profile?.profile_photo_url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconPosition="left"
                disabled={uploadingAvatar}
                onClick={handleAvatarRemove}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Rimuovi
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name">Nome</Label>
            <Input
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={80}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Cognome</Label>
            <Input
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={80}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="md" disabled={savingProfile}>
            {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salva
          </Button>
        </div>
      </form>

      <div className="dc-card p-6 md:p-8 space-y-4">
        <div>
          <h3 className="font-tenor uppercase tracking-wide text-lg text-foreground">
            Email di accesso
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            L'indirizzo email associato al tuo account.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled readOnly />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="dc-card p-6 md:p-8 space-y-5">
        <div>
          <h3 className="font-tenor uppercase tracking-wide text-lg text-foreground">
            Cambia password
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Minimo 8 caratteri.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nuova password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Conferma password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="md" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Aggiorna password
          </Button>
        </div>
      </form>

      {(userRole === "admin" || userRole === "owner") && <TeamMembersSection />}
    </div>
  );
};
