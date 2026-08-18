import { useState } from "react";
import { MapPin } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import {
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
} from "@/components/profile/fields/FormFields";
import { AddressBlock, type AddressValue } from "@/components/profile/fields/AddressFields";
import { useProfileForm } from "./ProfileFormContext";

export const AddressCard = () => {
  const { obj, set, setMany, raw } = useProfileForm();

  const residence = obj<AddressValue>("p", "residence_address");
  const domicile = obj<AddressValue>("p", "domicile_address");
  const [sameAsResidence, setSameAsResidence] = useState(() => !raw("p", "domicile_address"));

  const setResidence = (next: AddressValue) => {
    setMany("p", {
      residence_address: next as unknown as Json,
      postal_code: next.postal_code || null,
      city: next.city || null,
      country: next.state || null,
    });
  };

  return (
    <SectionCard icon={<MapPin strokeWidth={1} />} title="Indirizzo">
      <div>
        <GroupLabel>Residenza</GroupLabel>
        <AddressBlock value={residence} onChange={setResidence} />
      </div>

      <ProfileCheckbox
        checked={sameAsResidence}
        onCheckedChange={(checked) => {
          setSameAsResidence(checked);
          if (checked) set("p", "domicile_address", null);
        }}
        label="Il domicilio coincide con la residenza"
      />

      {!sameAsResidence && (
        <>
          <SectionDivider />
          <div>
            <GroupLabel>Domicilio</GroupLabel>
            <AddressBlock
              value={domicile}
              onChange={(next) => set("p", "domicile_address", next as unknown as Json)}
            />
          </div>
        </>
      )}
    </SectionCard>
  );
};
