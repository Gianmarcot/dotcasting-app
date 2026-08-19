import { useState } from "react";
import { Link2, Paperclip, Upload, CalendarClock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROFILE_TARGETS } from "@/lib/communications";
import type { AttachedAction } from "@/hooks/useSendCommunication";

const TYPE_LABELS: Record<AttachedAction["type"], string> = {
  upload: "Richiesta di materiale",
  link: "Rimando a una sezione del profilo",
  availability: "Richiesta di disponibilità",
};

export const actionSummary = (action: AttachedAction) => {
  if (action.type === "upload") return `Materiale: ${action.material || "da specificare"}`;
  if (action.type === "link")
    return `Sezione: ${PROFILE_TARGETS.find((t) => t.value === action.target)?.label ?? "profilo"}`;
  return "Disponibilità richiesta";
};

/** Comando per allegare un'azione alla comunicazione in invio. */
export const ActionAttachPopover = ({
  value,
  onChange,
}: {
  value: AttachedAction | null;
  onChange: (action: AttachedAction | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AttachedAction>({ type: "upload", material: "" });

  const confirm = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="secondary" size="icon" aria-label="Allega un'azione">
            <Paperclip />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[340px] space-y-4 p-4">
          <div className="space-y-2">
            <Label>Tipo di azione</Label>
            <Select
              value={draft.type}
              onValueChange={(v) => setDraft({ type: v as AttachedAction["type"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABELS) as AttachedAction["type"][]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {draft.type === "upload" && (
            <div className="space-y-2">
              <Label>Cosa serve</Label>
              <Input
                value={draft.material ?? ""}
                onChange={(e) => setDraft({ ...draft, material: e.target.value })}
                placeholder="Es. autocertificazione firmata"
              />
            </div>
          )}

          {draft.type === "link" && (
            <div className="space-y-2">
              <Label>Sezione del profilo</Label>
              <Select
                value={draft.target ?? ""}
                onValueChange={(v) => setDraft({ ...draft, target: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Scegli la sezione" />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_TARGETS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {draft.type === "availability" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Dal</Label>
                <Input
                  type="date"
                  value={draft.periodStart ?? ""}
                  onChange={(e) => setDraft({ ...draft, periodStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Al</Label>
                <Input
                  type="date"
                  value={draft.periodEnd ?? ""}
                  onChange={(e) => setDraft({ ...draft, periodEnd: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Scadenza per rispondere</Label>
            <Input
              type="date"
              value={draft.deadline ?? ""}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
            />
          </div>

          <Button type="button" size="sm" className="w-full" onClick={confirm}>
            Allega azione
          </Button>
        </PopoverContent>
      </Popover>

      {value && (
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground">
          {value.type === "upload" && <Upload className="h-3.5 w-3.5" />}
          {value.type === "link" && <Link2 className="h-3.5 w-3.5" />}
          {value.type === "availability" && <CalendarClock className="h-3.5 w-3.5" />}
          {actionSummary(value)}
          <button type="button" onClick={() => onChange(null)} aria-label="Rimuovi azione">
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
    </div>
  );
};
