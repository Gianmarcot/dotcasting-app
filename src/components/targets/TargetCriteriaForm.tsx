import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { TargetCriteria } from "@/hooks/useTargets";
import {
  GENDERS,
  HAIR_COLORS,
  EYE_COLORS,
  ABILITIES,
  TALENT_ROLES,
} from "@/lib/profileOptions";

interface TargetCriteriaFormProps {
  criteria: TargetCriteria;
  onChange: (criteria: TargetCriteria) => void;
}

export const TargetCriteriaForm = ({ criteria, onChange }: TargetCriteriaFormProps) => {
  const allCategories = [
    ...TALENT_ROLES.artistic,
    ...TALENT_ROLES.creative,
    ...TALENT_ROLES.production,
  ];

  const updateCriteria = <K extends keyof TargetCriteria>(
    key: K,
    value: TargetCriteria[K]
  ) => {
    onChange({ ...criteria, [key]: value });
  };

  const toggleArrayItem = (key: keyof TargetCriteria, item: string) => {
    const current = (criteria[key] as string[]) || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateCriteria(key, updated.length > 0 ? updated : undefined);
  };

  const addCity = (city: string) => {
    if (!city.trim()) return;
    const current = criteria.cities || [];
    if (!current.includes(city.trim())) {
      updateCriteria("cities", [...current, city.trim()]);
    }
  };

  const removeCity = (city: string) => {
    const current = criteria.cities || [];
    const updated = current.filter((c) => c !== city);
    updateCriteria("cities", updated.length > 0 ? updated : undefined);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Gender */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Genere</Label>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <div key={g.value} className="flex items-center space-x-2">
              <Checkbox
                id={`gender-${g.value}`}
                checked={criteria.gender?.includes(g.value) || false}
                onCheckedChange={() => toggleArrayItem("gender", g.value)}
              />
              <label htmlFor={`gender-${g.value}`} className="text-sm cursor-pointer">
                {g.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Età</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="w-24"
            value={criteria.age_min ?? ""}
            onChange={(e) => updateCriteria("age_min", e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            className="w-24"
            value={criteria.age_max ?? ""}
            onChange={(e) => updateCriteria("age_max", e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-sm text-muted-foreground">anni</span>
        </div>
      </div>

      {/* Height Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Altezza</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="w-24"
            value={criteria.height_min ?? ""}
            onChange={(e) => updateCriteria("height_min", e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            className="w-24"
            value={criteria.height_max ?? ""}
            onChange={(e) => updateCriteria("height_max", e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-sm text-muted-foreground">cm</span>
        </div>
      </div>

      {/* Cities */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Città</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(criteria.cities || []).map((city) => (
            <Badge key={city} variant="secondary" className="flex items-center gap-1">
              {city}
              <button onClick={() => removeCity(city)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          placeholder="Aggiungi città e premi Invio..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCity(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Categorie</Label>
        <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
          {allCategories.map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={criteria.categories?.includes(cat) || false}
                onCheckedChange={() => toggleArrayItem("categories", cat)}
              />
              <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">
                {cat}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Hair Colors */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Colore Capelli</Label>
        <div className="flex flex-wrap gap-2">
          {HAIR_COLORS.map((color) => (
            <Badge
              key={color}
              variant={criteria.hair_colors?.includes(color) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleArrayItem("hair_colors", color)}
            >
              {color}
            </Badge>
          ))}
        </div>
      </div>

      {/* Eye Colors */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Colore Occhi</Label>
        <div className="flex flex-wrap gap-2">
          {EYE_COLORS.map((color) => (
            <Badge
              key={color}
              variant={criteria.eye_colors?.includes(color) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleArrayItem("eye_colors", color)}
            >
              {color}
            </Badge>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Competenze</Label>
        <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
          {ABILITIES.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={criteria.skills?.includes(skill) || false}
                onCheckedChange={() => toggleArrayItem("skills", skill)}
              />
              <label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer">
                {skill}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tattoos & Piercings */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Caratteristiche fisiche</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="no-tattoos"
              checked={criteria.has_tattoos === false}
              onCheckedChange={(checked) => 
                updateCriteria("has_tattoos", checked ? false : undefined)
              }
            />
            <label htmlFor="no-tattoos" className="text-sm cursor-pointer">
              Senza tatuaggi
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="no-piercings"
              checked={criteria.has_piercings === false}
              onCheckedChange={(checked) => 
                updateCriteria("has_piercings", checked ? false : undefined)
              }
            />
            <label htmlFor="no-piercings" className="text-sm cursor-pointer">
              Senza piercing
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
