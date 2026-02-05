import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useTalentAttributes, useUpdateTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentAttributesByProfileId, useUpdateTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { toast } from "sonner";
import { ABILITIES } from "@/lib/profileOptions";

interface AbilitiesSectionProps {
  externalProfileId?: string;
}

export const AbilitiesSection = ({ externalProfileId }: AbilitiesSectionProps) => {
  const { data: ownAttributes } = useTalentAttributes();
  const { data: externalAttributes } = useTalentAttributesByProfileId(externalProfileId);
  const updateOwnAttributes = useUpdateTalentAttributes();
  const updateExternalAttributes = useUpdateTalentAttributesByProfileId();
  
  const attributes = externalProfileId ? externalAttributes : ownAttributes;
  const [isEditing, setIsEditing] = useState(false);

  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);

  useEffect(() => {
    if (attributes) {
      setSelectedAbilities(attributes.abilities || []);
    }
  }, [attributes]);

  const handleAbilityToggle = (ability: string) => {
    setSelectedAbilities(prev =>
      prev.includes(ability)
        ? prev.filter(a => a !== ability)
        : [...prev, ability]
    );
  };

  const handleSave = async () => {
    try {
      const attrs = {
        abilities: selectedAbilities.length > 0 ? selectedAbilities : null,
      };
      
      if (externalProfileId) {
        await updateExternalAttributes.mutateAsync({ profileId: externalProfileId, attributes: attrs });
      } else {
        await updateOwnAttributes.mutateAsync(attrs);
      }
      setIsEditing(false);
      toast.success("Abilità aggiornate!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (attributes) {
      setSelectedAbilities(attributes.abilities || []);
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalAttributes.isPending : updateOwnAttributes.isPending;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Abilità Speciali</CardTitle>
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
        {isEditing ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {ABILITIES.map(ability => (
              <div key={ability} className="flex items-center space-x-2">
                <Checkbox
                  id={ability}
                  checked={selectedAbilities.includes(ability)}
                  onCheckedChange={() => handleAbilityToggle(ability)}
                />
                <Label htmlFor={ability} className="text-sm font-normal cursor-pointer">
                  {ability}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedAbilities.length > 0 ? (
              selectedAbilities.map(ability => (
                <Badge key={ability} variant="secondary">
                  {ability}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Nessuna abilità selezionata</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
