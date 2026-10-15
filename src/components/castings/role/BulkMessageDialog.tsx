import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingSelect, FloatingTextarea } from "@/components/ui/field";
import { useSendCommunication } from "@/hooks/useSendCommunication";
import type { RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { toast } from "sonner";

const TEMPLATES = [
  {
    value: "selection",
    title: "Inserito in una selezione",
    body: "Ciao {nome}, ti abbiamo inserito in una selezione per il ruolo {ruolo}. Ti faremo sapere appena avremo un riscontro dal cliente.",
  },
  {
    value: "profile",
    title: "Completa il profilo",
    body: "Ciao {nome}, per proporti al meglio per il ruolo {ruolo} ti chiediamo di completare il tuo profilo.",
  },
  {
    value: "availability",
    title: "Richiesta di disponibilità",
    body: "Ciao {nome}, stiamo valutando il tuo profilo per il ruolo {ruolo}. Puoi confermarci la tua disponibilità?",
  },
  {
    value: "photos",
    title: "Servono altre foto",
    body: "Ciao {nome}, per il ruolo {ruolo} ci servirebbero altre foto aggiornate. Puoi caricarle nel tuo profilo?",
  },
];

const firstName = (t: RoleTalentWithProfile) => t.profile?.first_name?.trim() || t.profile?.stage_name?.trim() || "";
const fill = (body: string, t: RoleTalentWithProfile | undefined, roleName: string) =>
  body.split("{nome}").join(t ? firstName(t) : "").split("{ruolo}").join(roleName);

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  talents: RoleTalentWithProfile[];
  roleName: string;
  castingId: string;
}

/** Messaggio a più talent da testi precompilati, personalizzato per destinatario. */
export const BulkMessageDialog = ({ open, onOpenChange, talents, roleName, castingId }: Props) => {
  const send = useSendCommunication();
  const [template, setTemplate] = useState(TEMPLATES[0].value);
  const [body, setBody] = useState(TEMPLATES[0].body);

  useEffect(() => {
    if (!open) return;
    setTemplate(TEMPLATES[0].value);
    setBody(TEMPLATES[0].body);
  }, [open]);

  const current = TEMPLATES.find((t) => t.value === template)!;
  const recipients = talents.filter((t) => t.profile?.user_id);
  const skipped = talents.length - recipients.length;

  const submit = async () => {
    try {
      for (const t of recipients) {
        await send.mutateAsync({
          recipients: [t.profile!.user_id!],
          title: current.title,
          body: fill(body, t, roleName),
          castingId,
        });
      }
      toast.success("Messaggio inviato", {
        description: `${recipients.length} ${recipients.length === 1 ? "destinatario" : "destinatari"}`,
      });
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Invio non riuscito", { description: e?.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Messaggio a {talents.length} talent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FloatingSelect
            label="Testo"
            value={template}
            onValueChange={(v) => {
              setTemplate(v);
              setBody(TEMPLATES.find((t) => t.value === v)!.body);
            }}
            options={TEMPLATES.map((t) => ({ value: t.value, label: t.title }))}
          />
          <FloatingTextarea label="Messaggio" value={body} onChange={setBody} maxLength={2000} />
          <p className="text-xs text-muted-foreground">{"{nome}"} viene sostituito con il nome di ogni destinatario.</p>
          {recipients[0] && (
            <div className="rounded-2xl bg-cream-dark p-4 text-sm">
              <p className="mb-1 text-xs text-muted-foreground">Anteprima per {firstName(recipients[0]) || "il primo destinatario"}</p>
              <p className="whitespace-pre-wrap text-foreground">{fill(body, recipients[0], roleName)}</p>
            </div>
          )}
          {skipped > 0 && (
            <p className="text-sm text-[#C88500]">
              {skipped} talent senza account non {skipped === 1 ? "riceverà" : "riceveranno"} il messaggio.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={submit} disabled={send.isPending || recipients.length === 0 || !body.trim()}>
            Invia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
