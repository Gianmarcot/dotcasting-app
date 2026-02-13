import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useTalentAttributes, useUpdateTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentAttributesByProfileId, useUpdateTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { toast } from "sonner";
import { it } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/profileOptions";

interface LanguagesSectionProps {
  externalProfileId?: string;
}

export const LanguagesSection = ({ externalProfileId }: LanguagesSectionProps) => {
  const { data: ownAttributes } = useTalentAttributes();
  const { data: externalAttributes } = useTalentAttributesByProfileId(externalProfileId);
  const updateOwnAttributes = useUpdateTalentAttributes();
  const updateExternalAttributes = useUpdateTalentAttributesByProfileId();
  
  const attributes = externalProfileId ? externalAttributes : ownAttributes;
  const [isEditing, setIsEditing] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (attributes) {
      setLanguages(attributes.languages || []);
    }
  }, [attributes]);

  const handleAddLanguage = (lang: string) => {
    if (lang && !languages.includes(lang)) {
      setLanguages([...languages, lang]);
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setLanguages(languages.filter((l) => l !== langToRemove));
  };

  const handleSave = async () => {
    try {
      if (externalProfileId) {
        await updateExternalAttributes.mutateAsync({ profileId: externalProfileId, attributes: { languages } });
      } else {
        await updateOwnAttributes.mutateAsync({ languages });
      }
      setIsEditing(false);
      toast.success("Lingue aggiornate!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    setLanguages(attributes?.languages || []);
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalAttributes.isPending : updateOwnAttributes.isPending;
  const availableLanguages = LANGUAGES.filter((l) => !languages.includes(l));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{it.profile.languages}</CardTitle>
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
        {isEditing && availableLanguages.length > 0 && (
          <div className="mb-4">
            <Select onValueChange={handleAddLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Aggiungi una lingua..." />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {languages.length > 0 ? (
            languages.map((lang) => (
              <Badge
                key={lang}
                variant="secondary"
                className={isEditing ? "cursor-pointer hover:bg-destructive hover:text-destructive-foreground" : ""}
                onClick={() => isEditing && handleRemoveLanguage(lang)}
              >
                {lang}
                {isEditing && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              Non hai ancora aggiunto lingue.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};