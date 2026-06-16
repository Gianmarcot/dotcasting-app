import { it } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgencySettingsForm } from "@/components/owner/settings/AgencySettingsForm";
import { AccountSection } from "@/components/owner/settings/AccountSection";

export const OwnerSettings = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-tenor uppercase tracking-wide text-2xl text-foreground">
          {it.backoffice.settings}
        </h1>
        <p className="text-muted-foreground mt-1">
          Configura agenzia e account
        </p>
      </div>

      <Tabs defaultValue="agency" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agency">Agenzia</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="agency">
          <AgencySettingsForm />
        </TabsContent>

        <TabsContent value="account">
          <AccountSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerSettings;
