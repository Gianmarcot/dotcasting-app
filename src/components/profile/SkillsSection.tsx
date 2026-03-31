import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X, Loader2, Plus } from "lucide-react";
import { useTalentAttributes, useUpdateTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentAttributesByProfileId, useUpdateTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { toast } from "sonner";
import { it } from "@/lib/i18n";

interface SkillsSectionProps {
  externalProfileId?: string;
}

export const SkillsSection = ({ externalProfileId }: SkillsSectionProps) => {
  const { data: ownAttributes } = useTalentAttributes();
  const { data: externalAttributes } = useTalentAttributesByProfileId(externalProfileId);
  const updateOwnAttributes = useUpdateTalentAttributes();
  const updateExternalAttributes = useUpdateTalentAttributesByProfileId();
  
  const attributes = externalProfileId ? externalAttributes : ownAttributes;
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (attributes) {
      setSkills(attributes.skills || []);
    }
  }, [attributes]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    try {
      if (externalProfileId) {
        await updateExternalAttributes.mutateAsync({ profileId: externalProfileId, attributes: { skills } });
      } else {
        await updateOwnAttributes.mutateAsync({ skills });
      }
      setIsEditing(false);
      toast.success("Competenze aggiornate!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    setSkills(attributes?.skills || []);
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalAttributes.isPending : updateOwnAttributes.isPending;

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{it.profile.skills}</CardTitle>
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
        {isEditing && (
          <div className="flex gap-2 mb-4">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Aggiungi una competenza..."
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <Button size="sm" onClick={handleAddSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className={isEditing ? "cursor-pointer hover:bg-destructive hover:text-destructive-foreground" : ""}
                onClick={() => isEditing && handleRemoveSkill(skill)}
              >
                {skill}
                {isEditing && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              Non hai ancora aggiunto competenze.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
