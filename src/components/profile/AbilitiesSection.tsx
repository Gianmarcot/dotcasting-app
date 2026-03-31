import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useTalentAttributes, useUpdateTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentAttributesByProfileId, useUpdateTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { toast } from "sonner";

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

  const [formData, setFormData] = useState({
    abilityDance: false,
    abilitySing: false,
    abilityInstruments: false,
    abilityInstrumentsDetail: "",
    abilitySports: false,
    abilitySportsDetail: "",
    abilityBartender: false,
    abilityOther: false,
    abilityOtherDetail: "",
  });

  useEffect(() => {
    if (attributes) {
      setFormData({
        abilityDance: attributes.ability_dance || false,
        abilitySing: attributes.ability_sing || false,
        abilityInstruments: attributes.ability_instruments || false,
        abilityInstrumentsDetail: attributes.ability_instruments_detail || "",
        abilitySports: attributes.ability_sports || false,
        abilitySportsDetail: attributes.ability_sports_detail || "",
        abilityBartender: attributes.ability_bartender || false,
        abilityOther: attributes.ability_other || false,
        abilityOtherDetail: attributes.ability_other_detail || "",
      });
    }
  }, [attributes]);

  const handleSave = async () => {
    try {
      const attrs = {
        ability_dance: formData.abilityDance,
        ability_sing: formData.abilitySing,
        ability_instruments: formData.abilityInstruments,
        ability_instruments_detail: formData.abilityInstruments ? formData.abilityInstrumentsDetail || null : null,
        ability_sports: formData.abilitySports,
        ability_sports_detail: formData.abilitySports ? formData.abilitySportsDetail || null : null,
        ability_bartender: formData.abilityBartender,
        ability_other: formData.abilityOther,
        ability_other_detail: formData.abilityOther ? formData.abilityOtherDetail || null : null,
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
      setFormData({
        abilityDance: attributes.ability_dance || false,
        abilitySing: attributes.ability_sing || false,
        abilityInstruments: attributes.ability_instruments || false,
        abilityInstrumentsDetail: attributes.ability_instruments_detail || "",
        abilitySports: attributes.ability_sports || false,
        abilitySportsDetail: attributes.ability_sports_detail || "",
        abilityBartender: attributes.ability_bartender || false,
        abilityOther: attributes.ability_other || false,
        abilityOtherDetail: attributes.ability_other_detail || "",
      });
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalAttributes.isPending : updateOwnAttributes.isPending;

  const abilities = [
    { key: "abilityDance", label: "So ballare" },
    { key: "abilitySing", label: "So cantare" },
    { key: "abilityInstruments", label: "So suonare degli strumenti musicali", detailKey: "abilityInstrumentsDetail", detailLabel: "Quali strumenti musicali sai suonare?" },
    { key: "abilitySports", label: "Pratico degli sport", detailKey: "abilitySportsDetail", detailLabel: "Quali sport pratichi?" },
    { key: "abilityBartender", label: "Ho esperienza come bartender" },
    { key: "abilityOther", label: "Altro", detailKey: "abilityOtherDetail", detailLabel: "Specifica" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Ulteriori abilità</CardTitle>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {abilities.map(ability => (
            <div key={ability.key} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={ability.key}
                  checked={formData[ability.key as keyof typeof formData] as boolean}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, [ability.key]: checked as boolean })
                  }
                  disabled={!isEditing}
                />
                <Label htmlFor={ability.key} className="text-sm font-normal cursor-pointer">
                  {ability.label}
                </Label>
              </div>
              {ability.detailKey && formData[ability.key as keyof typeof formData] && (
                <Textarea
                  placeholder={ability.detailLabel}
                  value={formData[ability.detailKey as keyof typeof formData] as string}
                  onChange={(e) =>
                    setFormData({ ...formData, [ability.detailKey!]: e.target.value })
                  }
                  disabled={!isEditing}
                  className="ml-6"
                  rows={2}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
