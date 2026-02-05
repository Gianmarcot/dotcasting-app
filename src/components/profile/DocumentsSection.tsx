import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useProfileById } from "@/hooks/useProfileById";
import { useUpdateProfileById } from "@/hooks/useUpdateProfileById";
import { toast } from "sonner";

interface DocumentsSectionProps {
  externalProfileId?: string;
}

export const DocumentsSection = ({ externalProfileId }: DocumentsSectionProps) => {
  const { data: ownProfile } = useProfile();
  const { data: externalProfile } = useProfileById(externalProfileId);
  const updateOwnProfile = useUpdateProfile();
  const updateExternalProfile = useUpdateProfileById();
  
  const profile = externalProfileId ? externalProfile : ownProfile;
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fiscalCode: "",
    hasPassport: false,
    passportExpiry: "",
    hasVatNumber: false,
    vatNumber: "",
    nationality: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fiscalCode: profile.fiscal_code || "",
        hasPassport: profile.has_passport || false,
        passportExpiry: profile.passport_expiry || "",
        hasVatNumber: profile.has_vat_number || false,
        vatNumber: profile.vat_number || "",
        nationality: profile.nationality || "",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const updates = {
        fiscal_code: formData.fiscalCode || null,
        has_passport: formData.hasPassport,
        passport_expiry: formData.passportExpiry || null,
        has_vat_number: formData.hasVatNumber,
        vat_number: formData.vatNumber || null,
        nationality: formData.nationality || null,
      };
      
      if (externalProfileId) {
        await updateExternalProfile.mutateAsync({ profileId: externalProfileId, updates });
      } else {
        await updateOwnProfile.mutateAsync(updates);
      }
      setIsEditing(false);
      toast.success("Documenti aggiornati!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fiscalCode: profile.fiscal_code || "",
        hasPassport: profile.has_passport || false,
        passportExpiry: profile.passport_expiry || "",
        hasVatNumber: profile.has_vat_number || false,
        vatNumber: profile.vat_number || "",
        nationality: profile.nationality || "",
      });
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalProfile.isPending : updateOwnProfile.isPending;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Documenti e Fiscalità</CardTitle>
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
            <Label htmlFor="nationality">Nazionalità</Label>
            <Input
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Italiana"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fiscalCode">Codice Fiscale</Label>
            <Input
              id="fiscalCode"
              name="fiscalCode"
              value={formData.fiscalCode}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="RSSMRA85M01H501Z"
            />
          </div>
        </div>

        {/* Passport */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasPassport"
              checked={formData.hasPassport}
              onCheckedChange={(checked) => setFormData({...formData, hasPassport: checked as boolean})}
              disabled={!isEditing}
            />
            <Label htmlFor="hasPassport" className="font-normal">Ho un passaporto valido</Label>
          </div>
          {formData.hasPassport && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="passportExpiry">Data scadenza</Label>
              <Input
                id="passportExpiry"
                name="passportExpiry"
                type="date"
                value={formData.passportExpiry}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          )}
        </div>

        {/* VAT */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasVatNumber"
              checked={formData.hasVatNumber}
              onCheckedChange={(checked) => setFormData({...formData, hasVatNumber: checked as boolean})}
              disabled={!isEditing}
            />
            <Label htmlFor="hasVatNumber" className="font-normal">Ho una Partita IVA</Label>
          </div>
          {formData.hasVatNumber && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="vatNumber">Numero P.IVA</Label>
              <Input
                id="vatNumber"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="12345678901"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
