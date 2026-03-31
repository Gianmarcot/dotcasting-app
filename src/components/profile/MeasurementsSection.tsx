import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useTalentAttributes, useUpdateTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentAttributesByProfileId, useUpdateTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { toast } from "sonner";
import { JACKET_SIZES, SHIRT_SIZES, PANTS_SIZES, SHOE_SIZES, HAIR_COLORS, HAIR_TYPES, HAIR_LENGTHS, EYE_COLORS } from "@/lib/profileOptions";

interface MeasurementsSectionProps {
  externalProfileId?: string;
}

export const MeasurementsSection = ({ externalProfileId }: MeasurementsSectionProps) => {
  const { data: ownAttributes } = useTalentAttributes();
  const { data: externalAttributes } = useTalentAttributesByProfileId(externalProfileId);
  const updateOwnAttributes = useUpdateTalentAttributes();
  const updateExternalAttributes = useUpdateTalentAttributesByProfileId();
  
  const attributes = externalProfileId ? externalAttributes : ownAttributes;
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    shoulderWidth: "",
    neckSize: "",
    jacketSize: "",
    shirtSize: "",
    pantsSize: "",
    shoeSize: "",
    hairColor: "",
    hairType: "",
    hairLength: "",
    eyeColor: "",
  });

  useEffect(() => {
    if (attributes) {
      setFormData({
        height: attributes.height?.toString() || "",
        weight: attributes.weight?.toString() || "",
        chest: attributes.chest?.toString() || "",
        waist: attributes.waist?.toString() || "",
        hips: attributes.hips?.toString() || "",
        shoulderWidth: attributes.shoulder_width?.toString() || "",
        neckSize: attributes.neck_size?.toString() || "",
        jacketSize: attributes.jacket_size || "",
        shirtSize: (attributes as any).shirt_size || "",
        pantsSize: attributes.pants_size || "",
        shoeSize: attributes.shoe_size || "",
        hairColor: attributes.hair_color || "",
        hairType: attributes.hair_type || "",
        hairLength: attributes.hair_length || "",
        eyeColor: attributes.eye_color || "",
      });
    }
  }, [attributes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const attrs = {
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        chest: formData.chest ? parseInt(formData.chest) : null,
        waist: formData.waist ? parseInt(formData.waist) : null,
        hips: formData.hips ? parseInt(formData.hips) : null,
        shoulder_width: formData.shoulderWidth ? parseInt(formData.shoulderWidth) : null,
        neck_size: formData.neckSize ? parseInt(formData.neckSize) : null,
        jacket_size: formData.jacketSize || null,
        shirt_size: formData.shirtSize || null,
        pants_size: formData.pantsSize || null,
        shoe_size: formData.shoeSize || null,
        hair_color: formData.hairColor || null,
        hair_type: formData.hairType || null,
        hair_length: formData.hairLength || null,
        eye_color: formData.eyeColor || null,
      };
      
      if (externalProfileId) {
        await updateExternalAttributes.mutateAsync({ profileId: externalProfileId, attributes: attrs });
      } else {
        await updateOwnAttributes.mutateAsync(attrs);
      }
      setIsEditing(false);
      toast.success("Misure aggiornate!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (attributes) {
      setFormData({
        height: attributes.height?.toString() || "",
        weight: attributes.weight?.toString() || "",
        chest: attributes.chest?.toString() || "",
        waist: attributes.waist?.toString() || "",
        hips: attributes.hips?.toString() || "",
        shoulderWidth: attributes.shoulder_width?.toString() || "",
        neckSize: attributes.neck_size?.toString() || "",
        jacketSize: attributes.jacket_size || "",
        shirtSize: (attributes as any).shirt_size || "",
        pantsSize: attributes.pants_size || "",
        shoeSize: attributes.shoe_size || "",
        hairColor: attributes.hair_color || "",
        hairType: attributes.hair_type || "",
        hairLength: attributes.hair_length || "",
        eyeColor: attributes.eye_color || "",
      });
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalAttributes.isPending : updateOwnAttributes.isPending;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Misure e Aspetto</CardTitle>
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
      <CardContent className="space-y-6">
        {/* Misure corporee */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">Corporatura</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Altezza (cm)</Label>
              <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} disabled={!isEditing} placeholder="175" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleChange} disabled={!isEditing} placeholder="70" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chest">Petto (cm)</Label>
              <Input id="chest" name="chest" type="number" value={formData.chest} onChange={handleChange} disabled={!isEditing} placeholder="95" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waist">Vita (cm)</Label>
              <Input id="waist" name="waist" type="number" value={formData.waist} onChange={handleChange} disabled={!isEditing} placeholder="80" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="hips">Fianchi (cm)</Label>
              <Input id="hips" name="hips" type="number" value={formData.hips} onChange={handleChange} disabled={!isEditing} placeholder="95" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shoulderWidth">Larghezza spalle (cm)</Label>
              <Input id="shoulderWidth" name="shoulderWidth" type="number" value={formData.shoulderWidth} onChange={handleChange} disabled={!isEditing} placeholder="45" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neckSize">Misura collo camicia (cm)</Label>
              <Input id="neckSize" name="neckSize" type="number" value={formData.neckSize} onChange={handleChange} disabled={!isEditing} placeholder="40" />
            </div>
          </div>
        </div>

        {/* Taglie */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">Taglie</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Taglia giacca</Label>
              <Select value={formData.jacketSize} onValueChange={(v) => handleSelectChange("jacketSize", v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {JACKET_SIZES.map(size => (<SelectItem key={size} value={size}>{size}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Taglia maglia</Label>
              <Select value={formData.shirtSize} onValueChange={(v) => handleSelectChange("shirtSize", v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {SHIRT_SIZES.map(size => (<SelectItem key={size} value={size}>{size}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Taglia pantaloni</Label>
              <Select value={formData.pantsSize} onValueChange={(v) => handleSelectChange("pantsSize", v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {PANTS_SIZES.map(size => (<SelectItem key={size} value={size}>{size}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Numero scarpe</Label>
              <Select value={formData.shoeSize} onValueChange={(v) => handleSelectChange("shoeSize", v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {SHOE_SIZES.map(size => (<SelectItem key={size} value={size}>{size}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Capelli e Occhi */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">Capelli e Occhi</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Colore capelli</Label>
              <Select value={formData.hairColor} onValueChange={(v) => handleSelectChange("hairColor", v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {HAIR_COLORS.map(color => (<SelectItem key={color} value={color}>{color}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Colore occhi</Label>
              <Select value={formData.eyeColor} onValueChange={(v) => handleSelectChange("eyeColor", v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {EYE_COLORS.map(color => (<SelectItem key={color} value={color}>{color}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lunghezza capelli</Label>
              <Select value={formData.hairLength} onValueChange={(v) => handleSelectChange("hairLength", v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {HAIR_LENGTHS.map(length => (<SelectItem key={length} value={length}>{length}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipologia capelli</Label>
              <Select value={formData.hairType} onValueChange={(v) => handleSelectChange("hairType", v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {HAIR_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
