import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useProfileById } from "@/hooks/useProfileById";
import { useUpdateProfileById } from "@/hooks/useUpdateProfileById";
import { toast } from "sonner";
import { it } from "@/lib/i18n";
import { GENDERS, ETHNICITIES, COUNTRIES } from "@/lib/profileOptions";

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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    ethnicity: "",
    birthDate: "",
    city: "",
    country: "Italia",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        gender: profile.gender || "",
        ethnicity: profile.ethnicity || "",
        birthDate: profile.birth_date || "",
        city: profile.city || "",
        country: profile.country || "Italia",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const updates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
        ethnicity: formData.ethnicity,
        birth_date: formData.birthDate || null,
        city: formData.city,
        country: formData.country,
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
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        gender: profile.gender || "",
        ethnicity: profile.ethnicity || "",
        birthDate: profile.birth_date || "",
        city: profile.city || "",
        country: profile.country || "Italia",
      });
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalProfile.isPending : updateOwnProfile.isPending;

  const genderLabel = GENDERS.find(g => g.value === formData.gender)?.label || formData.gender;

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
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{it.profile.firstName}</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{it.profile.lastName}</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{it.profile.gender}</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange("gender", value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona genere">{genderLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{it.profile.ethnicity}</Label>
            <Select
              value={formData.ethnicity}
              onValueChange={(value) => handleSelectChange("ethnicity", value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona etnia" />
              </SelectTrigger>
              <SelectContent>
                {ETHNICITIES.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">{it.profile.birthDate}</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">{it.profile.city}</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>{it.profile.country}</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleSelectChange("country", value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona paese" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};