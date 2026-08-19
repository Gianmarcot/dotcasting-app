import { useMemo, useState } from "react";
import { Loader2, Search, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCastings } from "@/hooks/useCastings";
import { useCastingRoles } from "@/hooks/useCastingRoles";
import { useRoundsByRole } from "@/hooks/useRoundsByRole";
import {
  useRoleRecipients,
  useRoundRecipients,
  useTalentRecipientSearch,
  type RecipientCandidate,
} from "@/hooks/useCommunicationRecipients";
import { useSendCommunication, type AttachedAction } from "@/hooks/useSendCommunication";
import { ActionAttachPopover } from "@/components/messages/ActionAttachPopover";

type Source = "search" | "role" | "round";

export const BroadcastDialog = ({
  open,
  onOpenChange,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: (batchId: string | null) => void;
}) => {
  const [source, setSource] = useState<Source>("search");
  const [search, setSearch] = useState("");
  const [castingId, setCastingId] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, RecipientCandidate>>({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [action, setAction] = useState<AttachedAction | null>(null);

  const { data: castings = [] } = useCastings();
  const { data: roles = [] } = useCastingRoles(castingId ?? undefined);
  const { data: roundsByRole } = useRoundsByRole(castingId ?? undefined);
  const rounds = roleId ? roundsByRole?.get(roleId) ?? [] : [];

  const searchResults = useTalentRecipientSearch(source === "search" ? search : "");
  const roleResults = useRoleRecipients(source === "role" ? roleId : null);
  const roundResults = useRoundRecipients(source === "round" ? roundId : null);

  const candidates: RecipientCandidate[] = useMemo(() => {
    if (source === "search") return searchResults.data ?? [];
    if (source === "role") return roleResults.data ?? [];
    return roundResults.data ?? [];
  }, [source, searchResults.data, roleResults.data, roundResults.data]);

  const send = useSendCommunication();
  const recipients = Object.values(selected);

  const toggle = (c: RecipientCandidate) =>
    setSelected((prev) => {
      const next = { ...prev };
      if (next[c.userId]) delete next[c.userId];
      else next[c.userId] = c;
      return next;
    });

  const handleSend = async () => {
    if (!recipients.length || !body.trim()) return;
    try {
      const { batchId } = await send.mutateAsync({
        recipients: recipients.map((r) => r.userId),
        title,
        body: body.trim(),
        action,
        castingId,
      });
      toast.success(`Comunicazione inviata a ${recipients.length} talent`);
      onSent?.(batchId);
      onOpenChange(false);
      setSelected({});
      setBody("");
      setTitle("");
      setAction(null);
    } catch {
      toast.error("Errore durante l'invio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invio a più talent</DialogTitle>
          <DialogDescription>
            La comunicazione arriva identica a ogni destinatario e resta nella sua conversazione
            individuale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "search" as Source, label: "Tutti i talent" },
                { key: "role" as Source, label: "Talent di un ruolo" },
                { key: "round" as Source, label: "Talent di un invio" },
              ]
            ).map((s) => (
              <Button
                key={s.key}
                type="button"
                size="sm"
                variant={source === s.key ? "default" : "secondary"}
                onClick={() => setSource(s.key)}
              >
                {s.label}
              </Button>
            ))}
          </div>

          {source === "search" ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca un talent per nome"
                className="pl-9"
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <Select
                value={castingId ?? ""}
                onValueChange={(v) => {
                  setCastingId(v);
                  setRoleId(null);
                  setRoundId(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Casting" />
                </SelectTrigger>
                <SelectContent>
                  {castings.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={roleId ?? ""}
                onValueChange={(v) => {
                  setRoleId(v);
                  setRoundId(null);
                }}
                disabled={!castingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ruolo" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {source === "round" && (
                <Select value={roundId ?? ""} onValueChange={setRoundId} disabled={!roleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Invio" />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="max-h-56 space-y-1 overflow-y-auto rounded-2xl border border-border p-2">
            {candidates.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Nessun talent da mostrare.
              </p>
            ) : (
              candidates.map((c) => (
                <label
                  key={c.userId}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/40"
                >
                  <Checkbox checked={!!selected[c.userId]} onCheckedChange={() => toggle(c)} />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.photoUrl ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {c.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{c.name}</span>
                </label>
              ))
            )}
          </div>

          <div className="space-y-2">
            <Label>Titolo (opzionale)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Convocazione set del 12 settembre"
            />
          </div>

          <div className="space-y-2">
            <Label>Testo della comunicazione</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Scrivi il messaggio…"
            />
          </div>

          <ActionAttachPopover value={action} onChange={setAction} />
        </div>

        <DialogFooter className="items-center justify-between gap-3 sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {recipients.length} destinatari selezionati
          </span>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!recipients.length || !body.trim() || send.isPending}
          >
            {send.isPending ? <Loader2 className="animate-spin" /> : <Send />}
            Invia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
