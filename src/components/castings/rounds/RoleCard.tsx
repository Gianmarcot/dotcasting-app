import { useNavigate } from "react-router-dom";
import { ChevronRight, MoreHorizontal, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/integrations/supabase/types";

export interface RoleCounts {
  total: number;
  confirmed: number;
  published: number;
}

interface Props {
  role: Tables<"casting_roles">;
  castingId: string;
  counts: RoleCounts;
  roundsCount: number;
  onEditRole: (role: Tables<"casting_roles">) => void;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const RoleCard = ({ role, castingId, counts, roundsCount, onEditRole }: Props) => {
  const navigate = useNavigate();
  const openRole = () => navigate(`/owner/castings/${castingId}/${role.id}`);

  const genderLabel = (() => {
    const g = (role.gender ?? "").toLowerCase();
    if (g === "male" || g === "m" || g === "maschio") return "Maschio";
    if (g === "female" || g === "f" || g === "femmina") return "Femmina";
    if (!g) return null;
    if (g === "other" || g === "altro") return "Altro";
    return role.gender;
  })();
  const ageLabel =
    role.age_min && role.age_max ? `${role.age_min} – ${role.age_max} anni` : null;
  const subtitle = [genderLabel, ageLabel].filter(Boolean).join(" • ");

  const progress: { key: string; text: string; muted?: boolean }[] = [];
  if (counts.total > 0) progress.push({ key: "s", text: `${counts.total} in shortlist` });
  if (roundsCount === 0) {
    progress.push({ key: "n", text: "nessun invio", muted: true });
  } else {
    progress.push({ key: "i", text: plural(roundsCount, "invio", "invii") });
    if (counts.published > 0)
      progress.push({ key: "g", text: plural(counts.published, "ingaggio", "ingaggi") });
  }

  return (
    <div className="dc-card relative flex items-center gap-4 p-6 hover:bg-muted/20 transition-colors">
      {/* Area cliccabile: link all'intera card, sotto il menu */}
      <button
        type="button"
        onClick={openRole}
        aria-label={`Apri ruolo ${role.name}`}
        className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="min-w-0 flex-1 space-y-2 pointer-events-none">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-2xl font-display uppercase tracking-wider text-foreground">
            {role.name}
          </h3>
          <Badge
            className={
              counts.confirmed > 0
                ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] font-semibold"
                : "bg-muted text-muted-foreground font-semibold"
            }
          >
            {counts.confirmed}/{counts.total} approvati
          </Badge>
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {progress.map((p, i) => (
            <span key={p.key} className="inline-flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground">•</span>}
              <span className={p.muted ? "text-muted-foreground opacity-70" : "text-foreground"}>
                {p.text}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Azioni ruolo"
              className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEditRole(role)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifica ruolo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 pointer-events-none" />
    </div>
  );
};
