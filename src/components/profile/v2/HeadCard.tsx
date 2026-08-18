import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { compressImage } from "@/lib/media/compressImage";
import { GENDER_IDENTITIES, MONTHS, REPRESENTATION_TYPES } from "@/lib/profileOptions";
import {
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  GroupLabel,
  ProfileCheckbox,
  ProfileRadioGroup,
  SectionCard,
  SectionDivider,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { GeoFields, type AddressValue } from "@/components/profile/fields/AddressFields";
import { calcAge, useProfileAutoSave } from "./useProfileAutoSave";

const YEARS = Array.from({ length: 80 }, (_, i) => String(new Date().getFullYear() - 16 - i));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

export const HeadCard = () => {
  const { user } = useAuth();
  const { profile, save } = useProfileAutoSave();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [stageName, setStageName] = useState("");
  const [birth, setBirth] = useState({ day: "", month: "", year: "" });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [birthPlace, setBirthPlace] = useState<AddressValue>({});
  const [gender, setGender] = useState("");
  const [genderIdentity, setGenderIdentity] = useState("");
  const [representation, setRepresentation] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name ?? "");
    setLastName(profile.last_name ?? "");
    setStageName(profile.stage_name ?? "");
    if (profile.birth_date) {
      const [y, m, d] = profile.birth_date.split("-");
      setBirth({ day: d ?? "", month: m ?? "", year: y ?? "" });
    }
    setAgeConfirmed(!!profile.age_confirmed);
    setBirthPlace({
      state: profile.birth_country ?? "",
      region: profile.birth_region ?? "",
      province: profile.birth_province ?? "",
      city: profile.birth_city ?? "",
    });
    setGender(profile.gender ?? "");
    setGenderIdentity(profile.gender_identity ?? "");
    setRepresentation(profile.representation_type ?? "");
  }, [profile]);

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
      save({ profile_photo_url: `${publicUrl}?v=${Date.now()}` });
      toast.success("Foto profilo aggiornata!");
    } catch {
      toast.error("Errore durante il caricamento della foto");
    } finally {
      setIsUploading(false);
    }
  };

  const commitBirth = (next: { day: string; month: string; year: string }) => {
    setBirth(next);
    if (next.day && next.month && next.year) {
      const value = `${next.year}-${next.month}-${next.day}`;
      const age = calcAge(value);
      if (age !== null && age < 18) {
        toast.error("Devi avere almeno 18 anni per usare la piattaforma");
        return;
      }
      save({ birth_date: value });
    }
  };

  const commitBirthPlace = (next: AddressValue) => {
    setBirthPlace(next);
    save({
      birth_country: next.state || null,
      birth_region: next.region || null,
      birth_province: next.province || null,
      birth_city: next.city || null,
    });
  };

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");

  return (
    <SectionCard>
      {/* Photo stack */}
      <div className="flex flex-col items-center">
        <div className="relative h-[220px] w-[168px]">
          <div className="absolute inset-0 -rotate-6 rounded-2xl bg-field" />
          <div className="absolute inset-0 rotate-3 rounded-2xl bg-field/80" />
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-muted">
            {profile?.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={displayName || "Foto profilo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-display text-field-label">
                {(profile?.first_name?.[0] ?? "?").toUpperCase()}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-5 left-1/2 flex h-12 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-[15px] text-primary-foreground disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
            Le mie foto
          </button>
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

      <div className="mt-10 space-y-6 sm:space-y-8">
        <FieldGrid cols={2}>
          <FloatingInput
            label="Nome"
            value={firstName}
            onChange={setFirstName}
            onBlur={() => save({ first_name: firstName || null })}
          />
          <FloatingInput
            label="Cognome"
            value={lastName}
            onChange={setLastName}
            onBlur={() => save({ last_name: lastName || null })}
          />
        </FieldGrid>

        <FloatingInput
          label="Nome d'arte"
          value={stageName}
          onChange={setStageName}
          onBlur={() => save({ stage_name: stageName || null })}
        />

        <div>
          <GroupLabel>Data di nascita</GroupLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8 lg:max-w-[calc(190px*3+64px)]">
            <FloatingSelect
              label="Giorno"
              value={birth.day}
              onValueChange={(v) => commitBirth({ ...birth, day: v })}
              options={toOptions(DAYS)}
            />
            <FloatingSelect
              label="Mese"
              value={birth.month}
              onValueChange={(v) => commitBirth({ ...birth, month: v })}
              options={MONTHS.map((m, i) => ({
                value: String(i + 1).padStart(2, "0"),
                label: m,
              }))}
            />
            <FloatingSelect
              label="Anno"
              value={birth.year}
              onValueChange={(v) => commitBirth({ ...birth, year: v })}
              options={toOptions(YEARS)}
            />
          </div>
        </div>

        <ProfileCheckbox
          checked={ageConfirmed}
          onCheckedChange={(checked) => {
            setAgeConfirmed(checked);
            save({ age_confirmed: checked });
          }}
          label="Confermo di aver compiuto 18 anni *"
        />

        <FieldGrid cols={4}>
          <GeoFields
            value={birthPlace}
            onChange={commitBirthPlace}
            labels={{ state: "Stato di nascita" }}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <div>
            <GroupLabel>Sesso</GroupLabel>
            <div className="flex min-h-16 items-center">
              <ProfileRadioGroup
                value={gender}
                onValueChange={(v) => {
                  setGender(v);
                  save({ gender: v });
                }}
                options={[
                  { value: "M", label: "M" },
                  { value: "F", label: "F" },
                ]}
              />
            </div>
          </div>
          <FloatingSelect
            label="Identità di genere"
            value={genderIdentity}
            onValueChange={(v) => {
              setGenderIdentity(v);
              save({ gender_identity: v });
            }}
            options={toOptions(GENDER_IDENTITIES)}
          />
        </FieldGrid>

        <SectionDivider />

        <div>
          <GroupLabel>Rappresentanza</GroupLabel>
          <ProfileRadioGroup
            value={representation}
            onValueChange={(v) => {
              setRepresentation(v);
              save({ representation_type: v });
            }}
            options={REPRESENTATION_TYPES}
          />
        </div>
      </div>
    </SectionCard>
  );
};
