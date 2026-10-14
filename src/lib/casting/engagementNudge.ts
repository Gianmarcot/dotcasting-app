import { supabase } from "@/integrations/supabase/client";
import { renderTemplate, type CommunicationTemplate } from "@/lib/communicationTemplates";

export interface NudgeCasting {
  title: string;
  locations: string[] | null;
  start_date: string | null;
  call_datetime: string | null;
  venue_name: string | null;
  venue_address: string | null;
  talent_instructions: string | null;
}

/** Stessa chiave di deduplica usata da useCommunicationSync. */
export const engagementDedupeKey = (roleTalentId: string) => `engagement_new:${roleTalentId}`;

/**
 * Sollecito ingaggio: riporta in cima (non letta) la comunicazione esistente,
 * oppure la crea dal modello dell'agenzia con gli stessi segnaposto del sync.
 */
export const nudgeEngagement = async ({
  roleTalentId,
  profileId,
  roleName,
  roleLocation,
  casting,
  template,
}: {
  roleTalentId: string;
  profileId: string;
  roleName: string;
  roleLocation: string | null;
  casting: NudgeCasting;
  template: CommunicationTemplate;
}) => {
  if (!template.enabled_app) throw new Error("Comunicazione disattivata nelle impostazioni");
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("user_id, first_name")
    .eq("id", profileId)
    .single();
  if (pErr) throw pErr;

  const key = engagementDedupeKey(roleTalentId);
  const now = new Date().toISOString();
  const { data: existing, error: eErr } = await supabase
    .from("communications")
    .select("id")
    .eq("talent_user_id", profile.user_id)
    .eq("dedupe_key", key)
    .maybeSingle();
  if (eErr) throw eErr;

  if (existing) {
    const { error } = await supabase
      .from("communications")
      .update({ created_at: now, read_at: null })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const dateISO = casting.call_datetime ?? casting.start_date ?? null;
  const vars = {
    talent_name: profile.first_name || "",
    project_title: casting.title,
    role_name: roleName,
    date: dateISO
      ? new Date(dateISO).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })
      : "da definire",
    location: casting.venue_name || casting.locations?.[0] || roleLocation || "da definire",
  };
  // Stessa firma del sync, così le modifiche successive vengono rilevate come "ingaggio modificato".
  const signature = [dateISO, casting.venue_name, casting.venue_address, casting.talent_instructions].join("|");
  const { error } = await supabase.from("communications").insert({
    talent_user_id: profile.user_id,
    type: "engagement_new",
    title: renderTemplate(template.label, vars),
    body: renderTemplate(template.body, vars),
    severity: "info",
    action_type: "link",
    action_payload: { label: template.action_label, href: `/talent/applications/${roleTalentId}`, signature, weight: 1 },
    dedupe_key: key,
  });
  if (error) throw error;
};
