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
import type { Json } from "@/integrations/supabase/types";

interface Address {
  state?: string;
  city?: string;
  street?: string;
  postal_code?: string;
}

interface AddressSectionProps {
  externalProfileId?: string;
}

export const AddressSection = ({ externalProfileId }: AddressSectionProps) => {
  const { data: ownProfile } = useProfile();
  const { data: externalProfile } = useProfileById(externalProfileId);
  const updateOwnProfile = useUpdateProfile();
  const updateExternalProfile = useUpdateProfileById();
  
  const profile = externalProfileId ? externalProfile : ownProfile;
  const [isEditing, setIsEditing] = useState(false);
  const [sameAsDomicile, setSameAsDomicile] = useState(true);

  const [residence, setResidence] = useState<Address>({});
  const [domicile, setDomicile] = useState<Address>({});

  useEffect(() => {
    if (profile) {
      setResidence((profile.residence_address as Address) || {});
      setDomicile((profile.domicile_address as Address) || {});
      setSameAsDomicile(!profile.domicile_address);
    }
  }, [profile]);

  const handleResidenceChange = (field: keyof Address, value: string) => {
    setResidence({ ...residence, [field]: value });
  };

  const handleDomicileChange = (field: keyof Address, value: string) => {
    setDomicile({ ...domicile, [field]: value });
  };

  const handleSave = async () => {
    try {
      const updates = {
        residence_address: Object.keys(residence).length > 0 ? residence as unknown as Json : null,
        domicile_address: sameAsDomicile ? null : (Object.keys(domicile).length > 0 ? domicile as unknown as Json : null),
      };
      
      if (externalProfileId) {
        await updateExternalProfile.mutateAsync({ profileId: externalProfileId, updates });
      } else {
        await updateOwnProfile.mutateAsync(updates);
      }
      setIsEditing(false);
      toast.success("Indirizzo aggiornato!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setResidence((profile.residence_address as Address) || {});
      setDomicile((profile.domicile_address as Address) || {});
      setSameAsDomicile(!profile.domicile_address);
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalProfile.isPending : updateOwnProfile.isPending;

  const AddressFields = ({ 
    address, 
    onChange, 
    prefix 
  }: { 
    address: Address; 
    onChange: (field: keyof Address, value: string) => void;
    prefix: string;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Stato</Label>
        <Input
          value={address.state || ""}
          onChange={(e) => onChange("state", e.target.value)}
          disabled={!isEditing}
          placeholder="Italia"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Città</Label>
        <Input
          value={address.city || ""}
          onChange={(e) => onChange("city", e.target.value)}
          disabled={!isEditing}
          placeholder="Milano"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Via</Label>
        <Input
          value={address.street || ""}
          onChange={(e) => onChange("street", e.target.value)}
          disabled={!isEditing}
          placeholder="Via Roma 1"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">CAP</Label>
        <Input
          value={address.postal_code || ""}
          onChange={(e) => onChange("postal_code", e.target.value)}
          disabled={!isEditing}
          placeholder="20100"
        />
      </div>
    </div>
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Indirizzo</CardTitle>
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
        <div className="space-y-3">
          <Label className="text-sm font-medium">Residenza</Label>
          <AddressFields address={residence} onChange={handleResidenceChange} prefix="res" />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sameAsDomicile"
            checked={sameAsDomicile}
            onCheckedChange={(checked) => setSameAsDomicile(checked as boolean)}
            disabled={!isEditing}
          />
          <Label htmlFor="sameAsDomicile" className="text-sm font-normal">
            Il domicilio coincide con la residenza
          </Label>
        </div>

        {!sameAsDomicile && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Domicilio</Label>
            <AddressFields address={domicile} onChange={handleDomicileChange} prefix="dom" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
