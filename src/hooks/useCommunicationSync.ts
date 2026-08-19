import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentMedia } from "@/hooks/useTalentMedia";
import { useTalentEngagements } from "@/hooks/useTalentEngagements";
import { useCommunications } from "@/hooks/useCommunications";
import { useCommunicationTemplates } from "@/hooks/useCommunicationTemplates";
import { PHOTO_CATEGORIES } from "@/lib/mediaCategories";
import { renderTemplate, type CommunicationTemplateType } from "@/lib/communicationTemplates";
import type { Communication } from "@/lib/communications";

interface Desired {
  dedupe_key: string;
  type: CommunicationTemplateType;
  title: string;
  body: string;
  severity?: string;
  action_type: "link";
  action_payload: Record<string, unknown>;
  /** peso della condizione: se aumenta, la comunicazione torna in fondo al flusso */
  weight: number;
}

const MIN_PHOTOS_FALLBACK = 2;

export const useCommunicationSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: attributes } = useTalentAttributes();
  const { data: media } = useTalentMedia();
  const { data: engagements } = useTalentEngagements();
  const { data: existing } = useCommunications();
  const { data: templates } = useCommunicationTemplates();
  const runningRef = useRef(false);

  useEffect(() => {
    if (!user?.id || !profile || !existing || !engagements || !templates) return;
    if (runningRef.current) return;

    const talentName = profile.first_name || "";
    const desired: Desired[] = [];

    const push = (
      type: CommunicationTemplateType,
      opts: {
        dedupe_key?: string;
        vars: Record<string, string | number | null | undefined>;
        payload?: Record<string, unknown>;
        weight: number;
        severity?: string;
      }
    ) => {
      const tpl = templates[type];
      if (!tpl || !tpl.enabled_app) return;
      desired.push({
        dedupe_key: opts.dedupe_key ?? type,
        type,
        title: renderTemplate(tpl.label, { talent_name: talentName, ...opts.vars }),
        body: renderTemplate(tpl.body, { talent_name: talentName, ...opts.vars }),
        severity: opts.severity,
        action_type: "link",
        action_payload: { label: tpl.action_label, ...(opts.payload ?? {}) },
        weight: opts.weight,
      });
    };

    /* --- 1. Profilo incompleto ---------------------------------------- */
    const missingGroups: { label: string; target: string }[] = [];
    if (!profile.phone_number && !profile.whatsapp_number)
      missingGroups.push({ label: "contatti", target: "contacts" });
    if (!profile.city || !profile.country)
      missingGroups.push({ label: "indirizzi", target: "address" });
    const measures = [
      attributes?.chest,
      attributes?.waist,
      attributes?.hips,
      attributes?.shoulder_width,
      attributes?.neck_size,
    ].filter(Boolean);
    if (!attributes?.height || !attributes?.weight || measures.length < 3)
      missingGroups.push({ label: "misure", target: "physical" });
    if (!profile.talent_categories?.length)
      missingGroups.push({ label: "ruoli", target: "roles" });
    if (!profile.bio) missingGroups.push({ label: "biografia", target: "bio" });

    if (missingGroups.length) {
      push("profile_incomplete", {
        vars: { missing_list: missingGroups.map((g) => g.label).join(", ") },
        payload: { target: missingGroups[0].target },
        weight: missingGroups.length,
      });
    }

    /* --- 2. Foto insufficienti (una sola comunicazione) ---------------- */
    if (media) {
      const short: { label: string; count: number; min: number; key: string }[] = [];
      PHOTO_CATEGORIES.forEach((cat) => {
        const min = "minRequired" in cat ? (cat.minRequired as number) : MIN_PHOTOS_FALLBACK;
        const count = media.filter((m) => m.category === cat.key).length;
        if (count < min) short.push({ label: cat.label, count, min, key: cat.key });
      });
      if (short.length) {
        push("photos_missing", {
          vars: {
            categories_list: short.map((s) => `${s.label} (${s.count} su ${s.min})`).join(", "),
            photos_count: short.reduce((a, s) => a + s.count, 0),
            photos_required: short.reduce((a, s) => a + s.min, 0),
          },
          payload: { target: "media", photos_category: short[0].key },
          weight: short.reduce((a, s) => a + (s.min - s.count), 0),
        });
      }
    }

    /* --- 3. Documenti / passaporto ------------------------------------ */
    const passportExpiry = profile.passport_expiry ? new Date(profile.passport_expiry) : null;
    const daysToExpiry = passportExpiry
      ? Math.round((passportExpiry.getTime() - Date.now()) / 86400000)
      : null;
    if (!profile.id_document_url || (daysToExpiry !== null && daysToExpiry < 90)) {
      const expiring = daysToExpiry !== null && daysToExpiry < 90;
      push("documents", {
        vars: {
          documents_detail: expiring
            ? `passaporto in scadenza tra ${Math.max(daysToExpiry ?? 0, 0)} giorni`
            : "documento d'identità",
        },
        payload: { target: "documents" },
        severity: expiring && (daysToExpiry ?? 0) < 30 ? "warning" : "info",
        weight: expiring ? 2 : 1,
      });
    }

    /* --- 4. Ingaggi pubblicati ---------------------------------------- */
    (engagements ?? []).forEach((e) => {
      const signature = [e.dateISO, e.venueName, e.venueAddress, e.instructions].join("|");
      push("engagement_new", {
        dedupe_key: `engagement_new:${e.id}`,
        vars: {
          project_title: e.title,
          role_name: e.roleName,
          date: e.dateISO
            ? new Date(e.dateISO).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "da definire",
          location: e.venueName || e.city || "da definire",
        },
        payload: { href: `/talent/applications/${e.id}`, signature },
        weight: 1,
      });
    });

    const run = async () => {
      runningRef.current = true;
      try {
        const byKey = new Map<string, Communication>();
        existing.forEach((c) => c.dedupe_key && byKey.set(c.dedupe_key, c));
        let changed = false;

        for (const d of desired) {
          const prev = byKey.get(d.dedupe_key);
          if (!prev) {
            const { error } = await supabase.from("communications").insert({
              talent_user_id: user.id,
              type: d.type,
              title: d.title,
              body: d.body,
              severity: d.severity ?? "info",
              action_type: d.action_type,
              action_payload: { ...d.action_payload, weight: d.weight },
              dedupe_key: d.dedupe_key,
            });
            if (!error) changed = true;
            continue;
          }

          const prevWeight = Number(prev.action_payload?.weight ?? 0);
          const worsened = d.weight > prevWeight;
          const contentChanged = prev.title !== d.title || prev.body !== d.body;
          if (!worsened && !contentChanged) continue;

          const patch: Record<string, unknown> = {
            title: d.title,
            body: d.body,
            severity: d.severity ?? "info",
            action_payload: { ...d.action_payload, weight: d.weight },
          };
          // torna in fondo e di nuovo da leggere solo se la situazione peggiora
          if (worsened) {
            patch.created_at = new Date().toISOString();
            patch.read_at = null;
          }
          const { error } = await supabase
            .from("communications")
            .update(patch)
            .eq("id", prev.id);
          if (!error) changed = true;
        }

        /* --- 5. Ingaggio modificato dopo la pubblicazione --------------- */
        const updTpl = templates.engagement_updated;
        for (const e of engagements ?? []) {
          const base = byKey.get(`engagement_new:${e.id}`);
          if (!base) continue;
          const signature = [e.dateISO, e.venueName, e.venueAddress, e.instructions].join("|");
          const prevSignature = String(base.action_payload?.signature ?? "");
          if (!prevSignature || prevSignature === signature) continue;

          const [pDate, pVenue, pAddr, pInstr] = prevSignature.split("|");
          const changes: string[] = [];
          if (pDate !== String(e.dateISO)) changes.push("data o orario");
          if (pVenue !== String(e.venueName) || pAddr !== String(e.venueAddress))
            changes.push("luogo");
          if (pInstr !== String(e.instructions)) changes.push("istruzioni");

          await supabase
            .from("communications")
            .update({ action_payload: { ...base.action_payload, signature } })
            .eq("id", base.id);
          changed = true;

          if (!updTpl?.enabled_app) continue;

          const vars = {
            talent_name: talentName,
            project_title: e.title,
            changes_list: changes.join(", "),
            date: e.dateISO
              ? new Date(e.dateISO).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "da definire",
            location: e.venueName || e.city || "da definire",
          };
          const key = `engagement_updated:${e.id}`;
          const prevUpd = byKey.get(key);
          const payload = {
            talent_user_id: user.id,
            type: "engagement_updated",
            title: renderTemplate(updTpl.label, vars),
            body: renderTemplate(updTpl.body, vars),
            action_type: "link" as const,
            action_payload: {
              href: `/talent/applications/${e.id}`,
              label: updTpl.action_label,
            },
            dedupe_key: key,
          };
          if (prevUpd) {
            await supabase
              .from("communications")
              .update({
                title: payload.title,
                body: payload.body,
                action_payload: payload.action_payload,
                created_at: new Date().toISOString(),
                read_at: null,
              })
              .eq("id", prevUpd.id);
          } else {
            await supabase.from("communications").insert(payload);
          }
        }

        if (changed) {
          queryClient.invalidateQueries({ queryKey: ["communications", user.id] });
        }
      } finally {
        runningRef.current = false;
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile, attributes, media, engagements, existing, templates]);
};
