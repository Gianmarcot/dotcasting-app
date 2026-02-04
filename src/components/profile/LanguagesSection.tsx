import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X, Loader2, Plus } from "lucide-react";
import { useTalentAttributes, useUpdateTalentAttributes } from "@/hooks/useTalentAttributes";
import { toast } from "sonner";
import { it } from "@/lib/i18n";

export const LanguagesSection = () => {
  const { data: attributes } = useTalentAttributes();
  const updateAttributes = useUpdateTalentAttributes();
  const [isEditing, setIsEditing] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    if (attributes) {
      setLanguages(attributes.languages || []);
    }
  }, [attributes]);

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setLanguages(languages.filter((l) => l !== langToRemove));
  };

  const handleSave = async () => {
    try {
      await updateAttributes.mutateAsync({ languages });
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

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{it.profile.languages}</CardTitle>
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
      <CardContent>
        {isEditing && (
          <div className="flex gap-2 mb-4">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Aggiungi una lingua..."
              onKeyDown={(e) => e.key === "Enter" && handleAddLanguage()}
            />
            <Button size="sm" onClick={handleAddLanguage}>
              <Plus className="h-4 w-4" />
            </Button>
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
