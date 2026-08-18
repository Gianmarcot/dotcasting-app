import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import {
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
} from "@/components/profile/fields/FormFields";
import { AddressBlock, type AddressValue } from "@/components/profile/fields/AddressFields";
import { useProfileAutoSave } from "./useProfileAutoSave";

const hasValues = (address: AddressValue) =>
  Object.values(address).some((v) => v !== undefined && v !== "");

export const AddressCard = () => {
  const { profile, save } = useProfileAutoSave();

  const [residence, setResidence] = useState<AddressValue>({});
  const [domicile, setDomicile] = useState<AddressValue>({});
  const [sameAsResidence, setSameAsResidence] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setResidence((profile.residence_address as AddressValue) ?? {});
    setDomicile((profile.domicile_address as AddressValue) ?? {});
    setSameAsResidence(!profile.domicile_address);
  }, [profile]);

  const commitResidence = () => {
    save({
      residence_address: hasValues(residence) ? (residence as unknown as Json) : null,
      postal_code: residence.postal_code || null,
      city: residence.city || null,
      country: residence.state || null,
    });
  };

  const commitDomicile = () => {
    save({
      domicile_address: hasValues(domicile) ? (domicile as unknown as Json) : null,
    });
  };

  return (
    <SectionCard icon={<MapPin strokeWidth={1} />} title="Indirizzo">
      <div>
        <GroupLabel>Residenza</GroupLabel>
        <AddressBlock value={residence} onChange={setResidence} onCommit={commitResidence} />
      </div>

      <ProfileCheckbox
        checked={sameAsResidence}
        onCheckedChange={(checked) => {
          setSameAsResidence(checked);
          if (checked) {
            setDomicile({});
            save({ domicile_address: null });
          }
        }}
        label="Il domicilio coincide con la residenza"
      />

      {!sameAsResidence && (
        <>
          <SectionDivider />
          <div>
            <GroupLabel>Domicilio</GroupLabel>
            <AddressBlock value={domicile} onChange={setDomicile} onCommit={commitDomicile} />
          </div>
        </>
      )}
    </SectionCard>
  );
};
