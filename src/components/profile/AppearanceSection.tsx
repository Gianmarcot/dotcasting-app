import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useTalentAttributes, useUpdateTalentAttributes } from "@/hooks/useTalentAttributes";
import { toast } from "sonner";
import { it } from "@/lib/i18n";

export const AppearanceSection = () => {
  const { data: attributes } = useTalentAttributes();
  const updateAttributes = useUpdateTalentAttributes();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    hairColor: "",
    eyeColor: "",
  });

  useEffect(() => {
    if (attributes) {
      setFormData({
        height: attributes.height?.toString() || "",
        weight: attributes.weight?.toString() || "",
        hairColor: attributes.hair_color || "",
        eyeColor: attributes.eye_color || "",
      });
    }
  }, [attributes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await updateAttributes.mutateAsync({
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        hair_color: formData.hairColor || null,
        eye_color: formData.eyeColor || null,
      });
      setIsEditing(false);
      toast.success("Attributi aggiornati!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (attributes) {
      setFormData({
        height: attributes.height?.toString() || "",
        weight: attributes.weight?.toString() || "",
        hairColor: attributes.hair_color || "",
        eyeColor: attributes.eye_color || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{it.profile.attributes}</CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateAttributes.isPending}>
              {updateAttributes.isPending ? (
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">{it.profile.height} (cm)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="175"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">{it.profile.weight} (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hairColor">{it.profile.hairColor}</Label>
            <Input
              id="hairColor"
              name="hairColor"
              value={formData.hairColor}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Castano"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eyeColor">{it.profile.eyeColor}</Label>
            <Input
              id="eyeColor"
              name="eyeColor"
              value={formData.eyeColor}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Marroni"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
