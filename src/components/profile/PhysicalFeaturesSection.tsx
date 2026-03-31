import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useTalentAttributes, useUpdateTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentAttributesByProfileId, useUpdateTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { toast } from "sonner";

interface PhysicalFeaturesSectionProps {
  externalProfileId?: string;
}

export const PhysicalFeaturesSection = ({ externalProfileId }: PhysicalFeaturesSectionProps) => {
  const { data: ownAttributes } = useTalentAttributes();
  const { data: externalAttributes } = useTalentAttributesByProfileId(externalProfileId);
  const updateOwnAttributes = useUpdateTalentAttributes();
  const updateExternalAttributes = useUpdateTalentAttributesByProfileId();
  
  const attributes = externalProfileId ? externalAttributes : ownAttributes;
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    hasFreckles: false,
    hasDiastema: false,
    hasPiercings: false,
    hasTattoos: false,
    hasVitiligo: false,
    hasAlbinism: false,
    hasDwarfism: false,
  });

  useEffect(() => {
    if (attributes) {
      setFormData({
        hasFreckles: attributes.has_freckles || false,
        hasDiastema: attributes.has_diastema || false,
        hasPiercings: attributes.has_piercings || false,
        hasTattoos: attributes.has_tattoos || false,
        hasVitiligo: attributes.has_vitiligo || false,
        hasAlbinism: attributes.has_albinism || false,
        hasDwarfism: attributes.has_dwarfism || false,
      });
    }
  }, [attributes]);

  const handleSave = async () => {
    try {
      const attrs = {
        has_freckles: formData.hasFreckles,
        has_diastema: formData.hasDiastema,
        has_piercings: formData.hasPiercings,
        has_tattoos: formData.hasTattoos,
        has_vitiligo: formData.hasVitiligo,
        has_albinism: formData.hasAlbinism,
        has_dwarfism: formData.hasDwarfism,
      };
      
      if (externalProfileId) {
        await updateExternalAttributes.mutateAsync({ profileId: externalProfileId, attributes: attrs });
      } else {
        await updateOwnAttributes.mutateAsync(attrs);
      }
      setIsEditing(false);
      toast.success("Segni particolari aggiornati!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (attributes) {
      setFormData({
        hasFreckles: attributes.has_freckles || false,
        hasDiastema: attributes.has_diastema || false,
        hasPiercings: attributes.has_piercings || false,
        hasTattoos: attributes.has_tattoos || false,
        hasVitiligo: attributes.has_vitiligo || false,
        hasAlbinism: attributes.has_albinism || false,
        hasDwarfism: attributes.has_dwarfism || false,
      });
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalAttributes.isPending : updateOwnAttributes.isPending;

  const features = [
    { key: "hasVitiligo", label: "Vitiligine" },
    { key: "hasFreckles", label: "Lentiggini" },
    { key: "hasDiastema", label: "Diastema" },
    { key: "hasAlbinism", label: "Albinismo" },
    { key: "hasDwarfism", label: "Nanismo" },
    { key: "hasTattoos", label: "Tatuaggi" },
    { key: "hasPiercings", label: "Piercing" },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Segni particolari</CardTitle>
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
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {features.map(feature => (
            <div key={feature.key} className="flex items-center space-x-2">
              <Checkbox
                id={feature.key}
                checked={formData[feature.key as keyof typeof formData]}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, [feature.key]: checked as boolean })
                }
                disabled={!isEditing}
              />
              <Label htmlFor={feature.key} className="text-sm font-normal cursor-pointer">
                {feature.label}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
