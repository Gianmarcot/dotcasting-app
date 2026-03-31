import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X, Loader2, Plus } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useProfileById } from "@/hooks/useProfileById";
import { useUpdateProfileById } from "@/hooks/useUpdateProfileById";
import { toast } from "sonner";
import { CONTINENTS } from "@/lib/profileOptions";
import type { Json } from "@/integrations/supabase/types";

interface TravelAvailability {
  continents?: string[];
  countries?: string[];
}

interface Visa {
  country: string;
  duration: string;
}

interface TravelSectionProps {
  externalProfileId?: string;
}

export const TravelSection = ({ externalProfileId }: TravelSectionProps) => {
  const { data: ownProfile } = useProfile();
  const { data: externalProfile } = useProfileById(externalProfileId);
  const updateOwnProfile = useUpdateProfile();
  const updateExternalProfile = useUpdateProfileById();
  
  const profile = externalProfileId ? externalProfile : ownProfile;
  const [isEditing, setIsEditing] = useState(false);

  const [travelAvailability, setTravelAvailability] = useState<TravelAvailability>({ continents: [], countries: [] });
  const [visas, setVisas] = useState<Visa[]>([]);
  const [newCountry, setNewCountry] = useState("");
  const [newVisa, setNewVisa] = useState({ country: "", duration: "" });

  useEffect(() => {
    if (profile) {
      setTravelAvailability((profile.travel_availability as TravelAvailability) || { continents: [], countries: [] });
      setVisas((profile.visas as unknown as Visa[]) || []);
    }
  }, [profile]);

  const handleContinentToggle = (continent: string) => {
    const current = travelAvailability.continents || [];
    setTravelAvailability({
      ...travelAvailability,
      continents: current.includes(continent)
        ? current.filter(c => c !== continent)
        : [...current, continent]
    });
  };

  const handleAddCountry = () => {
    if (newCountry.trim()) {
      const current = travelAvailability.countries || [];
      if (!current.includes(newCountry.trim())) {
        setTravelAvailability({
          ...travelAvailability,
          countries: [...current, newCountry.trim()]
        });
      }
      setNewCountry("");
    }
  };

  const handleRemoveCountry = (country: string) => {
    setTravelAvailability({
      ...travelAvailability,
      countries: (travelAvailability.countries || []).filter(c => c !== country)
    });
  };

  const handleAddVisa = () => {
    if (newVisa.country.trim()) {
      setVisas([...visas, { country: newVisa.country.trim(), duration: newVisa.duration }]);
      setNewVisa({ country: "", duration: "" });
    }
  };

  const handleRemoveVisa = (index: number) => {
    setVisas(visas.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const updates = {
        travel_availability: travelAvailability as unknown as Json,
        visas: visas.length > 0 ? visas as unknown as Json : null,
      };
      
      if (externalProfileId) {
        await updateExternalProfile.mutateAsync({ profileId: externalProfileId, updates });
      } else {
        await updateOwnProfile.mutateAsync(updates);
      }
      setIsEditing(false);
      toast.success("Disponibilità viaggi aggiornata!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setTravelAvailability((profile.travel_availability as TravelAvailability) || { continents: [], countries: [] });
      setVisas((profile.visas as unknown as Visa[]) || []);
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalProfile.isPending : updateOwnProfile.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Viaggi e Visti</CardTitle>
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
        {/* Continents */}
        <div className="space-y-3">
          <Label>Disponibilità per continenti</Label>
          <div className="flex flex-wrap gap-3">
            {CONTINENTS.map(continent => (
              <div key={continent} className="flex items-center space-x-2">
                <Checkbox
                  id={continent}
                  checked={(travelAvailability.continents || []).includes(continent)}
                  onCheckedChange={() => handleContinentToggle(continent)}
                  disabled={!isEditing}
                />
                <Label htmlFor={continent} className="text-sm font-normal cursor-pointer">
                  {continent}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Specific Countries */}
        <div className="space-y-3">
          <Label>Paesi specifici</Label>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="Aggiungi paese"
                onKeyPress={(e) => e.key === "Enter" && handleAddCountry()}
              />
              <Button size="sm" variant="outline" onClick={handleAddCountry}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(travelAvailability.countries || []).map(country => (
              <Badge key={country} variant="secondary" className="gap-1">
                {country}
                {isEditing && (
                  <button onClick={() => handleRemoveCountry(country)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Visas */}
        <div className="space-y-3">
          <Label>Visti in possesso</Label>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newVisa.country}
                onChange={(e) => setNewVisa({...newVisa, country: e.target.value})}
                placeholder="Paese"
                className="flex-1"
              />
              <Input
                value={newVisa.duration}
                onChange={(e) => setNewVisa({...newVisa, duration: e.target.value})}
                placeholder="Durata (es. 1 anno)"
                className="w-32"
              />
              <Button size="sm" variant="outline" onClick={handleAddVisa}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="space-y-2">
            {visas.map((visa, index) => (
              <div key={index} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                <span className="text-sm">
                  {visa.country} {visa.duration && `- ${visa.duration}`}
                </span>
                {isEditing && (
                  <button onClick={() => handleRemoveVisa(index)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {visas.length === 0 && !isEditing && (
              <span className="text-sm text-muted-foreground">Nessun visto inserito</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
