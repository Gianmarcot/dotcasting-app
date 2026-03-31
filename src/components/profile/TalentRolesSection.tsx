import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useProfileById } from "@/hooks/useProfileById";
import { useUpdateProfileById } from "@/hooks/useUpdateProfileById";
import { toast } from "sonner";
import { TALENT_ROLES, REPRESENTATION_TYPES } from "@/lib/profileOptions";

interface TalentRolesSectionProps {
  externalProfileId?: string;
}

export const TalentRolesSection = ({ externalProfileId }: TalentRolesSectionProps) => {
  const { data: ownProfile } = useProfile();
  const { data: externalProfile } = useProfileById(externalProfileId);
  const updateOwnProfile = useUpdateProfile();
  const updateExternalProfile = useUpdateProfileById();
  
  const profile = externalProfileId ? externalProfile : ownProfile;
  const [isEditing, setIsEditing] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [representationType, setRepresentationType] = useState("");

  useEffect(() => {
    if (profile) {
      setSelectedRoles(profile.talent_categories || []);
      setRepresentationType(profile.representation_type || "");
    }
  }, [profile]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = async () => {
    try {
      const updates = {
        talent_categories: selectedRoles,
        representation_type: representationType || null,
      };
      
      if (externalProfileId) {
        await updateExternalProfile.mutateAsync({ profileId: externalProfileId, updates });
      } else {
        await updateOwnProfile.mutateAsync(updates);
      }
      setIsEditing(false);
      toast.success("Ruoli aggiornati!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setSelectedRoles(profile.talent_categories || []);
      setRepresentationType(profile.representation_type || "");
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalProfile.isPending : updateOwnProfile.isPending;

  const roleGroups = [
    { key: "artistic", label: "Artistici", roles: TALENT_ROLES.artistic },
    { key: "creative", label: "Tecnici Creativi", roles: TALENT_ROLES.creative },
    { key: "production", label: "Produzione", roles: TALENT_ROLES.production },
  ];

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Ruoli e Talenti</CardTitle>
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
        {/* Representation Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo di rappresentanza</Label>
          <RadioGroup 
            value={representationType} 
            onValueChange={setRepresentationType}
            disabled={!isEditing}
            className="flex gap-4"
          >
            {REPRESENTATION_TYPES.map(type => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="font-normal">{type.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Role Groups */}
        {roleGroups.map(group => (
          <div key={group.key} className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">{group.label}</Label>
            <div className="flex flex-wrap gap-2">
              {group.roles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => isEditing && handleRoleToggle(role)}
                  disabled={!isEditing}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                    selectedRoles.includes(role)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-foreground border-foreground hover:bg-muted",
                    !isEditing && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
