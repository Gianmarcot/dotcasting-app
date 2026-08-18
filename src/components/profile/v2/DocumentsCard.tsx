import { useMemo } from "react";
import { IdCard } from "lucide-react";
import { fiscalCodeCoherenceWarning, validateFiscalCode } from "@/lib/fiscalCode";

import {
  COUNTRIES,
  NATIONALITIES,
  VAT_ACTIVITY_TYPES,
  VAT_REGIMES,
} from "@/lib/profileOptions";
import {
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  GroupHeading,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { UploadBlock } from "./UploadBlock";
import { FieldSlot, useProfileForm } from "./ProfileFormContext";

export const DocumentsCard = () => {
  const { str, bool, set, setMany, saveNow, profileRow } = useProfileForm();

  const hasPassport = bool("p", "has_passport");
  const hasVat = bool("p", "has_vat_number");

  const fiscalCode = str("p", "fiscal_code");
  const nationality = str("p", "nationality");
  const isItalian = !nationality || /ital/i.test(nationality);

  const fiscalCheck = useMemo(
    () => (isItalian ? validateFiscalCode(fiscalCode) : null),
    [fiscalCode, isItalian]
  );
  const fiscalError = isItalian
    ? fiscalCheck?.error ?? null
    : fiscalCode && fiscalCode.length !== 16
      ? "Il codice fiscale deve avere 16 caratteri"
      : null;
  const fiscalWarning =
    !fiscalError && isItalian
      ? fiscalCodeCoherenceWarning(fiscalCode, str("p", "birth_date") || null, str("p", "gender") || null)
      : null;


  return (
    <SectionCard icon={<IdCard strokeWidth={1} />} title="Documenti e fiscalità">
      <FieldGrid cols={2}>
        <FloatingSelect
          label="Cittadinanza"
          value={str("p", "nationality")}
          onValueChange={(v) => set("p", "nationality", v)}
          options={toOptions(NATIONALITIES)}
        />
        <FieldSlot name="fiscal_code" hideMessage>
          <FloatingInput
            label="Codice fiscale"
            value={fiscalCode}
            maxLength={16}
            onChange={(v) => set("p", "fiscal_code", v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            error={fiscalError}
            warning={fiscalWarning}
          />
        </FieldSlot>

      </FieldGrid>

      <UploadBlock
        label="Documento d'identità"
        description="Carta d'identità o passaporto. Formato JPG, PNG o PDF, massimo 10MB. Il file è privato e visibile solo a te e allo staff dell'agenzia."
        buttonLabel="Carica documento"
        accept="image/jpeg,image/png,application/pdf"
        fileNamePrefix="id-document"
        currentPath={profileRow?.id_document_url ?? null}
        onUploaded={(path) => saveNow("p", { id_document_url: path })}
      />

      <SectionDivider />

      <div className="space-y-8">
        <ProfileCheckbox
          checked={hasPassport}
          onCheckedChange={(checked) =>
            setMany("p", {
              has_passport: checked,
              ...(checked ? {} : { passport_country: null }),
            })
          }
          label="Ho un passaporto valido"
        />
        {hasPassport && (
          <FloatingSelect
            label="Stato di emissione"
            value={str("p", "passport_country")}
            onValueChange={(v) => set("p", "passport_country", v)}
            options={toOptions(COUNTRIES)}
          />
        )}

        <ProfileCheckbox
          checked={hasVat}
          onCheckedChange={(checked) => set("p", "has_vat_number", checked)}
          label="Ho una Partita IVA"
        />
        {hasVat && (
          <FieldGrid cols={3}>
            <FloatingInput
              label="Numero"
              value={str("p", "vat_number")}
              onChange={(v) => set("p", "vat_number", v)}
            />
            <FloatingSelect
              label="Tipologia attività"
              value={str("p", "vat_activity_type")}
              onValueChange={(v) => set("p", "vat_activity_type", v)}
              options={toOptions(VAT_ACTIVITY_TYPES)}
            />
            <FloatingSelect
              label="Regime fiscale"
              value={str("p", "vat_regime")}
              onValueChange={(v) => set("p", "vat_regime", v)}
              options={toOptions(VAT_REGIMES)}
            />
          </FieldGrid>
        )}
      </div>

      <SectionDivider />

      <div>
        <GroupHeading>Dati bancari</GroupHeading>
        <div className="space-y-8">
          <FieldGrid cols={2}>
            <FloatingInput
              label="Banca"
              value={str("p", "bank_name")}
              onChange={(v) => set("p", "bank_name", v)}
            />
            <FloatingInput
              label="Intestatario conto corrente"
              value={str("p", "bank_account_holder")}
              onChange={(v) => set("p", "bank_account_holder", v)}
            />
          </FieldGrid>
          <FieldSlot name="iban">
            <FloatingInput
              label="IBAN"
              value={str("p", "iban")}
              onChange={(v) => set("p", "iban", v.toUpperCase())}
            />
          </FieldSlot>
        </div>
      </div>
    </SectionCard>
  );
};
