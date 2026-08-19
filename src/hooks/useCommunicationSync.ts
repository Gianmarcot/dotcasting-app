import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentMedia } from "@/hooks/useTalentMedia";
import { useTalentEngagements } from "@/hooks/useTalentEngagements";
import { useCommunications } from "@/hooks/useCommunications";
import { PHOTO_CATEGORIES } from "@/lib/mediaCategories";
import type { Communication } from "@/lib/communications";

interface Desired {
  dedupe_key: string;
  type: string;
  title: string;
  body: string;
  severity?: string;
  action_type: "link";
  action_payload: Record<string, unknown>;
  /** peso della condizione: se aumenta, la comunicazione torna in cima */
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
  const runningRef = useRef(false);

  useEffect(() => {
    if (!user?.id || !profile || !existing || !engagements) return;
    if (runningRef.current) return;

    const desired: Desired[] = [];

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
      const first = missingGroups[0];
      desired.push({
        dedupe_key: "profile_incomplete",
        type: "profile_incomplete",
        title: "Completa il tuo profilo",
        body: `Mancano ancora questi dati: ${missingGroups
          .map((g) => g.label)
          .join(", ")}. Inizia dai ${first.label}.`,
        action_type: "link",
        action_payload: { target: first.target, label: `Vai a ${first.label}` },
        weight: missingGroups.length,
      });
    }

    /* --- 2. Foto insufficienti ---------------------------------------- */
    (media ?? []) &&
      PHOTO_CATEGORIES.forEach((cat) => {
        const min = "minRequired" in cat ? (cat.minRequired as number) : MIN_PHOTOS_FALLBACK;
        const count = (media ?? []).filter((m) => m.category === cat.key).length;
        if (media && count < min) {
          desired.push({
            dedupe_key: `photos_missing:${cat.key}`,
            type: "photos_missing",
            title: count === 0 ? `Aggiungi le "${cat.label}"` : `Foto insufficienti: ${cat.label}`,
            body: `Hai ${count} foto su ${min} richieste nella categoria "${cat.label}".`,
            action_type: "link",
            action_payload: {
              target: "media",
              photos_category: cat.key,
              label: "Gestisci le foto",
            },
            weight: min - count,
          });
        }
      });

    /* --- 3. Documenti / passaporto ------------------------------------ */
    const passportExpiry = profile.passport_expiry ? new Date(profile.passport_expiry) : null;
    const daysToExpiry = passportExpiry
      ? Math.round((passportExpiry.getTime() - Date.now()) / 86400000)
      : null;
    if (!profile.id_document_url || (daysToExpiry !== null && daysToExpiry < 90)) {
      const expiring = daysToExpiry !== null && daysToExpiry < 90;
      desired.push({
        dedupe_key: "documents",
        type: "documents",
        title: expiring ? "Passaporto in scadenza" : "Documento d'identità mancante",
        body: expiring
          ? `Il tuo passaporto scade tra ${Math.max(daysToExpiry ?? 0, 0)} giorni. Aggiorna i dati nella sezione Documenti e fiscalità.`
          : "Carica il tuo documento d'identità nella sezione Documenti e fiscalità.",
        severity: expiring && (daysToExpiry ?? 0) < 30 ? "warning" : "info",
        action_type: "link",
        action_payload: { target: "documents", label: "Vai ai documenti" },
        weight: expiring ? 2 : 1,
      });
    }

    /* --- 4/5. Ingaggi pubblicati e modificati -------------------------- */
    (engagements ?? []).forEach((e) => {
      const signature = [e.dateISO, e.venueName, e.venueAddress, e.instructions].join("|");
      desired.push({
        dedupe_key: `engagement_new:${e.id}`,
        type: "engagement_new",
        title: `Nuovo ingaggio: ${e.title}`,
        body: [
          e.roleName ? `Ruolo: ${e.roleName}` : null,
          e.dateISO
            ? new Date(e.dateISO).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : null,
          e.venueName || e.city,
        ]
          .filter(Boolean)
          .join(" · "),
        action_type: "link",
        action_payload: {
          href: `/talent/applications/${e.id}`,
          label: "Apri l'ingaggio",
          signature,
        },
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
          // torna in cima e di nuovo da leggere solo se la situazione peggiora
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

        /* Ingaggio modificato dopo la pubblicazione */
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

          const key = `engagement_updated:${e.id}`;
          const prevUpd = byKey.get(key);
          const payload = {
            talent_user_id: user.id,
            type: "engagement_updated",
            title: `Ingaggio aggiornato: ${e.title}`,
            body: `Sono cambiate: ${changes.join(", ")}. Controlla il dettaglio aggiornato.`,
            action_type: "link",
            action_payload: { href: `/talent/applications/${e.id}`, label: "Vedi cosa è cambiato" },
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
          await supabase
            .from("communications")
            .update({ action_payload: { ...base.action_payload, signature } })
            .eq("id", base.id);
          changed = true;
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
  }, [user?.id, profile, attributes, media, engagements, existing]);
};
