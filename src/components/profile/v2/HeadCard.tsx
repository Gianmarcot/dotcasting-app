import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { compressImage } from "@/lib/media/compressImage";
import { GENDER_IDENTITIES, MONTHS, REPRESENTATION_TYPES } from "@/lib/profileOptions";
import {
  FieldCluster,
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  GroupLabel,
  ProfileCheckbox,
  ProfileRadioGroup,
  RadioField,
  SectionCard,
  SectionDivider,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { GeoFields, type AddressValue } from "@/components/profile/fields/AddressFields";
import { FieldSlot, useProfileForm } from "./ProfileFormContext";

const YEARS = Array.from({ length: 80 }, (_, i) => String(new Date().getFullYear() - 16 - i));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

export const HeadCard = () => {
  const { user } = useAuth();
  const { str, bool, set, setMany, saveNow, profileRow } = useProfileForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const birthDate = str("p", "birth_date");
  const birth = useMemo(() => {
    const [y = "", m = "", d = ""] = birthDate.split("-");
    return { day: d, month: m, year: y };
  }, [birthDate]);

  const setBirthPart = (part: "day" | "month" | "year", value: string) => {
    const next = { ...birth, [part]: value };
    set("p", "birth_date", next.day && next.month && next.year
      ? `${next.year}-${next.month}-${next.day}`
      : null);
  };

  const birthPlace: AddressValue = {
    state: str("p", "birth_country"),
    region: str("p", "birth_region"),
    province: str("p", "birth_province"),
    city: str("p", "birth_city"),
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user?.id) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Il file è troppo grande. Massimo 5MB.");
      return;
    }
    setIsUploading(true);
    try {
      const compressed = await compressImage(file, "avatar");
      const ext = compressed.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { upsert: true });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      saveNow("p", { profile_photo_url: `${publicUrl}?v=${Date.now()}` });
      toast.success("Foto profilo aggiornata!");
    } catch {
      toast.error("Errore durante il caricamento della foto");
    } finally {
      setIsUploading(false);
    }
  };

  const displayName = [str("p", "first_name"), str("p", "last_name")].filter(Boolean).join(" ");
  const location = [str("p", "city"), str("p", "country")].filter(Boolean).join(", ");

  return (
    <SectionCard>
      {/* Photo stack header */}
      <div className="mb-16 flex flex-col items-center">
        <div className="relative h-[220px] w-[168px]">
          <div className="absolute inset-0 -rotate-6 rounded-2xl bg-field" />
          <div className="absolute inset-0 rotate-3 rounded-2xl bg-field/80" />
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-muted">
            {profileRow?.profile_photo_url ? (
              <img
                src={profileRow.profile_photo_url}
                alt={displayName || "Foto profilo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-4xl text-field-label">
                {(str("p", "first_name")[0] ?? "?").toUpperCase()}
              </div>
            )}
          </div>
          <Button
            type="button"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
            Le mie foto
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <h2 className="mt-10 font-display text-xl uppercase text-foreground">
          {displayName || "Il tuo nome"}
        </h2>
        {location && <p className="mt-1 text-[15px] text-field-label">{location}</p>}
      </div>

      <div className="space-y-8">
        <FieldGrid cols={2}>
          <FloatingInput
            label="Nome"
            value={str("p", "first_name")}
            onChange={(v) => set("p", "first_name", v)}
          />
          <FloatingInput
            label="Cognome"
            value={str("p", "last_name")}
            onChange={(v) => set("p", "last_name", v)}
          />
        </FieldGrid>

        <FloatingInput
          label="Nome d'arte"
          value={str("p", "stage_name")}
          onChange={(v) => set("p", "stage_name", v)}
        />

        <FieldSlot name="birth_date">
          <GroupLabel>Data di nascita</GroupLabel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <FieldCluster className="w-full max-w-[420px]">
              <FloatingSelect
                label="Giorno"
                className="flex-1"
                value={birth.day}
                onValueChange={(v) => setBirthPart("day", v)}
                options={toOptions(DAYS)}
              />
              <FloatingSelect
                label="Mese"
                className="flex-1"
                value={birth.month}
                onValueChange={(v) => setBirthPart("month", v)}
                options={MONTHS.map((m, i) => ({
                  value: String(i + 1).padStart(2, "0"),
                  label: m,
                }))}
              />
              <FloatingSelect
                label="Anno"
                className="flex-1"
                value={birth.year}
                onValueChange={(v) => setBirthPart("year", v)}
                options={toOptions(YEARS)}
              />
            </FieldCluster>
            <ProfileCheckbox
              checked={isAdult}
              disabled
              onCheckedChange={() => {}}
              label="Confermo di aver compiuto 18 anni"
              className="shrink-0"
            />
          </div>
        </FieldSlot>


        <FieldGrid cols={4}>
          <GeoFields
            value={birthPlace}
            onChange={(next) =>
              setMany("p", {
                birth_country: next.state || null,
                birth_region: next.region || null,
                birth_province: next.province || null,
                birth_city: next.city || null,
              })
            }
            labels={{ state: "Stato di nascita" }}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <RadioField label="Sesso">
            <ProfileRadioGroup
              value={str("p", "gender")}
              onValueChange={(v) => set("p", "gender", v)}
              options={[
                { value: "M", label: "M" },
                { value: "F", label: "F" },
              ]}
            />
          </RadioField>
          <FloatingSelect
            label="Identità di genere"
            value={str("p", "gender_identity")}
            onValueChange={(v) => set("p", "gender_identity", v)}
            options={toOptions(GENDER_IDENTITIES)}
          />
        </FieldGrid>

        <SectionDivider />

        <RadioField label="Rappresentanza">
          <ProfileRadioGroup
            value={str("p", "representation_type")}
            onValueChange={(v) => set("p", "representation_type", v)}
            options={REPRESENTATION_TYPES}
          />
        </RadioField>
      </div>
    </SectionCard>
  );
};
