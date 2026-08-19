CREATE TABLE public.communication_templates (
  type TEXT PRIMARY KEY,
  enabled_app BOOLEAN NOT NULL DEFAULT true,
  enabled_email BOOLEAN NOT NULL DEFAULT false,
  label TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  action_label TEXT NOT NULL DEFAULT '',
  email_subject TEXT,
  email_body TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.communication_templates TO authenticated;
GRANT INSERT, UPDATE ON public.communication_templates TO authenticated;
GRANT ALL ON public.communication_templates TO service_role;

ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read templates"
ON public.communication_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can insert templates"
ON public.communication_templates FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update templates"
ON public.communication_templates FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_communication_templates_updated_at
BEFORE UPDATE ON public.communication_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.communication_templates (type, label, body, action_label) VALUES
('profile_incomplete', 'Completa il tuo profilo', 'Mancano ancora questi dati: {missing_list}. Completali per avere più possibilità di essere selezionato.', 'Vai al profilo'),
('photos_missing', 'Fotografie da completare', 'Mancano fotografie in queste categorie: {categories_list}. Caricale dalla gestione foto.', 'Gestisci le foto'),
('documents', 'Documenti e fiscalità', 'Manca un documento valido nel tuo profilo: {documents_detail}. Aggiorna la sezione Documenti e fiscalità.', 'Vai ai documenti'),
('engagement_new', 'Nuovo ingaggio', 'Sei stato ingaggiato per: {project_title}
Ruolo: {role_name}
Quando: {date}
Dove: {location}', 'Vai al casting'),
('engagement_updated', 'Ingaggio aggiornato', 'Per {project_title} sono cambiate queste informazioni: {changes_list}. Controlla il dettaglio aggiornato.', 'Vedi cosa è cambiato');