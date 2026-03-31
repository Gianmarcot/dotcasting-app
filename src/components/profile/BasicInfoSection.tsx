import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useProfileById } from "@/hooks/useProfileById";
import { useUpdateProfileById } from "@/hooks/useUpdateProfileById";
import { toast } from "sonner";
import { it } from "@/lib/i18n";
import { COUNTRIES, MONTHS, GENDER_IDENTITIES, REPRESENTATION_TYPES, ITALIAN_REGIONS, ITALIAN_PROVINCES } from "@/lib/profileOptions";

interface BasicInfoSectionProps {
  externalProfileId?: string;
}

export const BasicInfoSection = ({ externalProfileId }: BasicInfoSectionProps) => {
  const { data: ownProfile } = useProfile();
  const { data: externalProfile } = useProfileById(externalProfileId);
  const updateOwnProfile = useUpdateProfile();
  const updateExternalProfile = useUpdateProfileById();
  
  const profile = externalProfileId ? externalProfile : ownProfile;
  const [isEditing, setIsEditing] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    stageName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    birthCountry: "",
    birthRegion: "",
    birthProvince: "",
    birthCity: "",
    gender: "",
    genderIdentity: "",
    representationType: "",
  });

  useEffect(() => {
    if (profile) {
      const bd = profile.birth_date ? new Date(profile.birth_date) : null;
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        stageName: (profile as any).stage_name || "",
        birthDay: bd ? String(bd.getDate()) : "",
        birthMonth: bd ? String(bd.getMonth()) : "",
        birthYear: bd ? String(bd.getFullYear()) : "",
        birthCountry: (profile as any).birth_country || "",
        birthRegion: (profile as any).birth_region || "",
        birthProvince: (profile as any).birth_province || "",
        birthCity: (profile as any).birth_city || "",
        gender: profile.gender || "",
        genderIdentity: (profile as any).gender_identity || "",
        representationType: profile.representation_type || "",
      });
      if (bd) setAgeConfirmed(true);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      let birthDate: string | null = null;
      if (formData.birthYear && formData.birthMonth !== "" && formData.birthDay) {
        const m = String(Number(formData.birthMonth) + 1).padStart(2, "0");
        const d = formData.birthDay.padStart(2, "0");
        birthDate = `${formData.birthYear}-${m}-${d}`;
      }

      const updates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        stage_name: formData.stageName || null,
        birth_date: birthDate,
        birth_country: formData.birthCountry || null,
        birth_region: formData.birthRegion || null,
        birth_province: formData.birthProvince || null,
        birth_city: formData.birthCity || null,
        gender: formData.gender || null,
        gender_identity: formData.genderIdentity || null,
        representation_type: formData.representationType || null,
      };

      if (externalProfileId) {
        await updateExternalProfile.mutateAsync({ profileId: externalProfileId, updates });
      } else {
        await updateOwnProfile.mutateAsync(updates);
      }
      setIsEditing(false);
      toast.success("Informazioni aggiornate!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (profile) {
      const bd = profile.birth_date ? new Date(profile.birth_date) : null;
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        stageName: (profile as any).stage_name || "",
        birthDay: bd ? String(bd.getDate()) : "",
        birthMonth: bd ? String(bd.getMonth()) : "",
        birthYear: bd ? String(bd.getFullYear()) : "",
        birthCountry: (profile as any).birth_country || "",
        birthRegion: (profile as any).birth_region || "",
        birthProvince: (profile as any).birth_province || "",
        birthCity: (profile as any).birth_city || "",
        gender: profile.gender || "",
        genderIdentity: (profile as any).gender_identity || "",
        representationType: profile.representation_type || "",
      });
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalProfile.isPending : updateOwnProfile.isPending;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Informazioni personali</CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nome / Cognome */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{it.profile.firstName}</Label>
            <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{it.profile.lastName}</Label>
            <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} />
          </div>
        </div>

        {/* Nome d'arte */}
        <div className="space-y-2">
          <Label htmlFor="stageName">Nome d'arte</Label>
          <Input id="stageName" name="stageName" value={formData.stageName} onChange={handleChange} disabled={!isEditing} />
        </div>

        {/* Data di nascita */}
        <div className="space-y-2">
          <Label>Data di nascita</Label>
          <div className="grid grid-cols-3 gap-2">
            <Select value={formData.birthDay} onValueChange={(v) => handleSelect("birthDay", v)} disabled={!isEditing}>
              <SelectTrigger><SelectValue placeholder="Giorno" /></SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formData.birthMonth} onValueChange={(v) => handleSelect("birthMonth", v)} disabled={!isEditing}>
              <SelectTrigger><SelectValue placeholder="Mese" /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formData.birthYear} onValueChange={(v) => handleSelect("birthYear", v)} disabled={!isEditing}>
              <SelectTrigger><SelectValue placeholder="Anno" /></SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Checkbox
              id="ageConfirm"
              checked={ageConfirmed}
              onCheckedChange={(checked) => setAgeConfirmed(!!checked)}
              disabled={!isEditing}
            />
            <Label htmlFor="ageConfirm" className="text-sm font-normal text-muted-foreground">
              Confermo di aver compiuto 18 anni
            </Label>
          </div>
        </div>

        {/* Luogo di nascita */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Stato di nascita</Label>
            <Select value={formData.birthCountry} onValueChange={(v) => handleSelect("birthCountry", v)} disabled={!isEditing}>
              <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthRegion">Regione</Label>
            <Input id="birthRegion" name="birthRegion" value={formData.birthRegion} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthProvince">Provincia</Label>
            <Input id="birthProvince" name="birthProvince" value={formData.birthProvince} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthCity">Città</Label>
            <Input id="birthCity" name="birthCity" value={formData.birthCity} onChange={handleChange} disabled={!isEditing} />
          </div>
        </div>

        {/* Sesso */}
        <div className="space-y-2">
          <Label>Sesso</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(v) => handleSelect("gender", v)}
            disabled={!isEditing}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="M" id="gender-m" />
              <Label htmlFor="gender-m" className="font-normal">M</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="F" id="gender-f" />
              <Label htmlFor="gender-f" className="font-normal">F</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Identità di genere */}
        <div className="space-y-2">
          <Label>Identità di genere</Label>
          <Select value={formData.genderIdentity} onValueChange={(v) => handleSelect("genderIdentity", v)} disabled={!isEditing}>
            <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
            <SelectContent>
              {GENDER_IDENTITIES.map((gi) => (
                <SelectItem key={gi} value={gi}>{gi}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rappresentanza */}
        <div className="space-y-2">
          <Label>Rappresentanza</Label>
          <RadioGroup
            value={formData.representationType}
            onValueChange={(v) => handleSelect("representationType", v)}
            disabled={!isEditing}
            className="flex gap-6"
          >
            {REPRESENTATION_TYPES.map((rt) => (
              <div key={rt.value} className="flex items-center gap-2">
                <RadioGroupItem value={rt.value} id={`rep-${rt.value}`} />
                <Label htmlFor={`rep-${rt.value}`} className="font-normal">{rt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};
