import { useEffect, useRef, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AgencyAvatar,
  CommunicationBubble,
  renderBody,
  ActionPill,
} from "@/components/communications/CommunicationBubble";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useUpdateCommunicationTemplate } from "@/hooks/useCommunicationTemplates";
import {
  defaultTemplate,
  renderTemplate,
  sampleVars,
  type CommunicationTemplate,
  type TemplateDefinition,
} from "@/lib/communicationTemplates";
import { ArrowUpRight } from "lucide-react";

/** Elenco dei segnaposto disponibili, inseribili con un click. */
const PlaceholderList = ({
  definition,
  onInsert,
}: {
  definition: TemplateDefinition;
  onInsert: (token: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {definition.placeholders.map((p) => (
      <button
        key={p.token}
        type="button"
        title={p.description}
        onClick={() => onInsert(`{${p.token}}`)}
        className="rounded-full border border-border bg-white/30 px-3 py-1 text-xs text-foreground transition-colors hover:bg-white/60"
      >
        {`{${p.token}}`}
      </button>
    ))}
  </div>
);

export const TemplateEditorCard = ({
  definition,
  template,
}: {
  definition: TemplateDefinition;
  template: CommunicationTemplate;
}) => {
  const { data: settings } = useAppSettings();
  const update = useUpdateCommunicationTemplate();
  const [draft, setDraft] = useState<CommunicationTemplate>(template);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setDraft(template), [template]);

  const set = <K extends keyof CommunicationTemplate>(
    key: K,
    value: CommunicationTemplate[K]
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const insertPlaceholder = (token: string) => {
    const el = bodyRef.current;
    if (!el) {
      set("body", `${draft.body} ${token}`);
      return;
    }
    const start = el.selectionStart ?? draft.body.length;
    const end = el.selectionEnd ?? start;
    const next = draft.body.slice(0, start) + token + draft.body.slice(end);
    set("body", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const save = async (patch?: Partial<CommunicationTemplate>) => {
    const payload = { ...draft, ...(patch ?? {}) };
    setDraft(payload);
    try {
      await update.mutateAsync({ ...payload, type: definition.type });
      toast.success("Testo salvato");
    } catch (e) {
      toast.error("Salvataggio non riuscito");
    }
  };

  const reset = () => {
    const def = defaultTemplate(definition.type);
    setDraft((d) => ({
      ...d,
      label: def.label,
      body: def.body,
      action_label: def.action_label,
    }));
  };

  const vars = sampleVars(definition.type);
  const previewLabel = renderTemplate(draft.label, vars);
  const previewBody = renderTemplate(draft.body, vars);

  return (
    <div className="dc-card space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg uppercase text-foreground">{definition.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{definition.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor={`app-${definition.type}`} className="text-sm">
            In app
          </Label>
          <Switch
            id={`app-${definition.type}`}
            checked={draft.enabled_app}
            onCheckedChange={(v) => save({ enabled_app: v })}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Etichetta del tipo</Label>
            <Input value={draft.label} onChange={(e) => set("label", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Corpo del messaggio</Label>
            <Textarea
              ref={bodyRef}
              rows={5}
              value={draft.body}
              onChange={(e) => set("body", e.target.value)}
            />
            <PlaceholderList definition={definition} onInsert={insertPlaceholder} />
          </div>

          <div className="space-y-2">
            <Label>Etichetta del pulsante di azione</Label>
            <Input
              value={draft.action_label}
              onChange={(e) => set("action_label", e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => save()} disabled={update.isPending}>
              <Save />
              Salva
            </Button>
            <Button size="sm" variant="secondary" onClick={reset}>
              <RotateCcw />
              Ripristina il testo predefinito
            </Button>
          </div>
        </div>

        {/* Anteprima come la vede il talent */}
        <div className="space-y-2">
          <Label>Anteprima</Label>
          <div className="rounded-3xl bg-[#f4f0ec] p-4">
            <div className="flex items-start gap-3">
              <AgencyAvatar
                logoUrl={settings?.agency_logo_url}
                name={settings?.agency_name}
              />
              <CommunicationBubble
                label={previewLabel}
                body={renderBody(previewBody)}
                time="15:29"
                action={
                  draft.action_label ? (
                    <ActionPill disabled>
                      <ArrowUpRight className="h-5 w-5" />
                      {draft.action_label}
                    </ActionPill>
                  ) : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canale email: predisposizione, non ancora attivo */}
      <div className="space-y-4 rounded-3xl border border-dashed border-border p-4 opacity-70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Invio via email</p>
            <p className="text-xs text-muted-foreground">
              Non ancora attivo: i testi email saranno scritti in un intervento successivo.
            </p>
          </div>
          <Switch
            checked={draft.enabled_email}
            disabled
            aria-label="Invio email (non attivo)"
          />
        </div>
        <div className="space-y-2">
          <Label>Oggetto email</Label>
          <Input value={draft.email_subject ?? ""} disabled placeholder="Non ancora attivo" />
        </div>
        <div className="space-y-2">
          <Label>Corpo email</Label>
          <Textarea rows={3} value={draft.email_body ?? ""} disabled placeholder="Non ancora attivo" />
        </div>
      </div>
    </div>
  );
};
