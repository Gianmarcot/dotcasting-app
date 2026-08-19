import { Skeleton } from "@/components/ui/skeleton";
import { useCommunicationTemplates } from "@/hooks/useCommunicationTemplates";
import { TEMPLATE_DEFINITIONS } from "@/lib/communicationTemplates";
import { TemplateEditorCard } from "./TemplateEditorCard";

/** Controllo dei testi delle comunicazioni automatiche. */
export const CommunicationsSettingsSection = () => {
  const { data: templates, isLoading } = useCommunicationTemplates();

  if (isLoading || !templates) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Attiva o disattiva ogni comunicazione automatica e personalizza i testi. I segnaposto
        vengono sostituiti con i dati reali del talent.
      </p>
      {TEMPLATE_DEFINITIONS.map((definition) => (
        <TemplateEditorCard
          key={definition.type}
          definition={definition}
          template={templates[definition.type]}
        />
      ))}
    </div>
  );
};
