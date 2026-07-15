import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, RotateCcw, MessageSquare, Trash2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import {
  TALENT_STATUS_OPTIONS,
  COMPANY_STATUS_OPTIONS,
  type TalentStatus,
  type CompanyStatus,
  type RoleTalentWithProfile,
} from "@/hooks/useRoleTalents";
import { cn } from "@/lib/utils";

function getAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const getInitials = (first?: string | null, last?: string | null) => {
  const a = first?.charAt(0) ?? "";
  const b = last?.charAt(0) ?? "";
  return (a + b).toUpperCase() || "?";
};

interface Props {
  rt: RoleTalentWithProfile;
  onTalentStatusChange: (rt: RoleTalentWithProfile, v: TalentStatus) => void;
  onCompanyStatusChange: (rt: RoleTalentWithProfile, v: CompanyStatus) => void;
  onSendInvite: (rt: RoleTalentWithProfile) => void;
  onMessage: (rt: RoleTalentWithProfile) => void;
  onRemove: (rt: RoleTalentWithProfile) => void;
}

export const RoleTalentRow = ({
  rt,
  onTalentStatusChange,
  onCompanyStatusChange,
  onSendInvite,
  onMessage,
  onRemove,
}: Props) => {
  const navigate = useNavigate();
  const age = getAge(rt.profile?.birth_date ?? null);
  const talentSt = (rt.talent_status || "none") as TalentStatus;
  const companySt = (rt.company_status || "none") as CompanyStatus;
  const initials = getInitials(rt.profile?.first_name, rt.profile?.last_name);
  const showSendInvite = talentSt === "none" || talentSt === "rejected";
  const showResendInvite = talentSt === "invited";

  const open = () => {
    if (rt.profile?.id) navigate(`/owner/talents/${rt.profile.id}`);
  };

  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
      className="group grid grid-cols-[80px_1fr_160px_160px_140px] items-center gap-4 px-4 py-4 border-b border-border/40 last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
    >
      {/* Portrait photo */}
      <div className="w-20 aspect-[2/3] rounded-xl overflow-hidden bg-muted shrink-0">
        {rt.profile?.profile_photo_url ? (
          <img
            src={rt.profile.profile_photo_url}
            alt={`${rt.profile?.first_name ?? ""} ${rt.profile?.last_name ?? ""}`.trim()}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
            {initials}
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">
          {rt.profile?.first_name} {rt.profile?.last_name}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {[age ? `${age} anni` : null, rt.profile?.city].filter(Boolean).join(" · ")}
          {rt.created_at && (
            <>
              {(age || rt.profile?.city) && " · "}
              <span className="text-muted-foreground/60">
                {format(new Date(rt.created_at), "d MMM", { locale: itLocale })}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Talent status */}
      <div onClick={stop} onKeyDown={stop}>
        <TalentStatusSelect
          value={talentSt}
          onChange={(v) => onTalentStatusChange(rt, v)}
        />
      </div>

      {/* Company status */}
      <div onClick={stop} onKeyDown={stop}>
        <CompanyStatusSelect
          value={companySt}
          onChange={(v) => onCompanyStatusChange(rt, v)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1" onClick={stop} onKeyDown={stop}>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider delayDuration={200}>
            {showSendInvite && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-md" onClick={() => onSendInvite(rt)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Invia invito</TooltipContent>
              </Tooltip>
            )}
            {showResendInvite && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-md" onClick={() => onSendInvite(rt)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reinvia invito</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-md" onClick={() => onMessage(rt)}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Messaggio</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-md"
                  className="text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
                  onClick={() => onRemove(rt)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rimuovi</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </div>
  );
};

function TalentStatusSelect({
  value,
  onChange,
}: {
  value: TalentStatus;
  onChange: (v: TalentStatus) => void;
}) {
  const current = TALENT_STATUS_OPTIONS.find((s) => s.value === value) || TALENT_STATUS_OPTIONS[0];
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TalentStatus)}>
      <SelectTrigger
        className={cn(
          "h-8 w-[140px] border-0 text-sm font-semibold rounded-full px-3",
          current.color,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TALENT_STATUS_OPTIONS.map((s) => (
          <SelectItem key={s.value} value={s.value} className="cursor-pointer">
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CompanyStatusSelect({
  value,
  onChange,
}: {
  value: CompanyStatus;
  onChange: (v: CompanyStatus) => void;
}) {
  const current = COMPANY_STATUS_OPTIONS.find((s) => s.value === value) || COMPANY_STATUS_OPTIONS[0];
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CompanyStatus)}>
      <SelectTrigger
        className={cn(
          "h-8 w-[140px] border-0 text-sm font-semibold rounded-full px-3",
          current.color,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COMPANY_STATUS_OPTIONS.map((s) => (
          <SelectItem key={s.value} value={s.value} className="cursor-pointer">
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
