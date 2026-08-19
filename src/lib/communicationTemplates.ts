/**
 * Testi delle comunicazioni automatiche, configurabili dall'agenzia.
 * I segnaposto usano la forma {nome} e vanno costruiti con frasi neutre,
 * senza articoli o preposizioni articolate attaccate al segnaposto.
 */

export type CommunicationTemplateType =
  | "profile_incomplete"
  | "photos_missing"
  | "documents"
  | "engagement_new"
  | "engagement_updated";

export interface CommunicationTemplate {
  type: CommunicationTemplateType;
  enabled_app: boolean;
  enabled_email: boolean;
  label: string;
  body: string;
  action_label: string;
  email_subject: string | null;
  email_body: string | null;
}

export interface TemplatePlaceholder {
  token: string;
  description: string;
  sample: string;
}

const P = {
  talent_name: { token: "talent_name", description: "Nome del talent", sample: "Giulia" },
  missing_list: {
    token: "missing_list",
    description: "Elenco dei dati mancanti",
    sample: "misure, biografia",
  },
  categories_list: {
    token: "categories_list",
    description: "Elenco delle categorie foto scoperte",
    sample: "Foto principali (2 su 4), Foto al naturale (0 su 2)",
  },
  photos_count: { token: "photos_count", description: "Foto caricate", sample: "2" },
  photos_required: { token: "photos_required", description: "Foto richieste", sample: "4" },
  documents_detail: {
    token: "documents_detail",
    description: "Dettaglio del documento mancante o in scadenza",
    sample: "documento d'identità",
  },
  project_title: {
    token: "project_title",
    description: "Titolo del progetto",
    sample: "Spot TV Brand di Moda",
  },
  role_name: { token: "role_name", description: "Ruolo", sample: "Modello principale" },
  date: { token: "date", description: "Data dell'ingaggio", sample: "24 agosto 2026" },
  location: { token: "location", description: "Luogo", sample: "Studio Fotografico Alfa" },
  changes_list: {
    token: "changes_list",
    description: "Elenco di cosa è cambiato",
    sample: "data o orario, luogo",
  },
} satisfies Record<string, TemplatePlaceholder>;

export interface TemplateDefinition {
  type: CommunicationTemplateType;
  name: string;
  description: string;
  placeholders: TemplatePlaceholder[];
  defaults: Pick<CommunicationTemplate, "label" | "body" | "action_label">;
}

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    type: "profile_incomplete",
    name: "Profilo incompleto",
    description: "Inviata quando mancano dati nel profilo del talent.",
    placeholders: [P.talent_name, P.missing_list],
    defaults: {
      label: "Completa il tuo profilo",
      body: "Mancano ancora questi dati: {missing_list}. Completali per avere più possibilità di essere selezionato.",
      action_label: "Vai al profilo",
    },
  },
  {
    type: "photos_missing",
    name: "Foto insufficienti",
    description:
      "Una sola comunicazione che elenca tutte le categorie foto sotto il minimo richiesto.",
    placeholders: [P.talent_name, P.categories_list, P.photos_count, P.photos_required],
    defaults: {
      label: "Fotografie da completare",
      body: "Mancano fotografie in queste categorie: {categories_list}. Caricale dalla gestione foto.",
      action_label: "Gestisci le foto",
    },
  },
  {
    type: "documents",
    name: "Documenti e passaporto",
    description: "Documento d'identità mancante oppure passaporto in scadenza.",
    placeholders: [P.talent_name, P.documents_detail],
    defaults: {
      label: "Documenti e fiscalità",
      body: "Manca un documento valido nel tuo profilo: {documents_detail}. Aggiorna la sezione Documenti e fiscalità.",
      action_label: "Vai ai documenti",
    },
  },
  {
    type: "engagement_new",
    name: "Nuovo ingaggio pubblicato",
    description: "Inviata quando l'agenzia rende visibile un ingaggio al talent.",
    placeholders: [P.talent_name, P.project_title, P.role_name, P.date, P.location],
    defaults: {
      label: "Nuovo ingaggio",
      body: "Sei stato ingaggiato per: {project_title}\nRuolo: {role_name}\nQuando: {date}\nDove: {location}",
      action_label: "Vai al casting",
    },
  },
  {
    type: "engagement_updated",
    name: "Ingaggio modificato",
    description: "Inviata quando cambia un ingaggio già pubblicato.",
    placeholders: [P.talent_name, P.project_title, P.changes_list, P.date, P.location],
    defaults: {
      label: "Ingaggio aggiornato",
      body: "Per {project_title} sono cambiate queste informazioni: {changes_list}. Controlla il dettaglio aggiornato.",
      action_label: "Vedi cosa è cambiato",
    },
  },
];

export const getTemplateDefinition = (type: string) =>
  TEMPLATE_DEFINITIONS.find((d) => d.type === type);

export const defaultTemplate = (type: CommunicationTemplateType): CommunicationTemplate => {
  const def = getTemplateDefinition(type)!;
  return {
    type,
    enabled_app: true,
    enabled_email: false,
    email_subject: null,
    email_body: null,
    ...def.defaults,
  };
};

/** Sostituisce i segnaposto {nome} con i valori disponibili. */
export const renderTemplate = (
  text: string,
  vars: Record<string, string | number | null | undefined>
) =>
  text
    .replace(/\{(\w+)\}/g, (match, key: string) => {
      const value = vars[key];
      return value === null || value === undefined || value === "" ? "" : String(value);
    })
    // ripulisce doppi spazi e spazi prima della punteggiatura lasciati dai segnaposto vuoti
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();

/** Anteprima con dati di esempio. */
export const sampleVars = (type: CommunicationTemplateType): Record<string, string> => {
  const def = getTemplateDefinition(type);
  const vars: Record<string, string> = {};
  def?.placeholders.forEach((p) => {
    vars[p.token] = p.sample;
  });
  return vars;
};
