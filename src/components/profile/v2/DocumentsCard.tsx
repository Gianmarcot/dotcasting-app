import { useEffect, useState } from "react";
import { IdCard } from "lucide-react";
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
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { UploadBlock } from "./UploadBlock";
import { useProfileAutoSave } from "./useProfileAutoSave";

export const DocumentsCard = () => {
  const { profile, save } = useProfileAutoSave();

  const [nationality, setNationality] = useState("");
  const [fiscalCode, setFiscalCode] = useState("");
  const [hasPassport, setHasPassport] = useState(false);
  const [passportCountry, setPassportCountry] = useState("");
  const [hasVat, setHasVat] = useState(false);
  const [vatNumber, setVatNumber] = useState("");
  const [vatActivity, setVatActivity] = useState("");
  const [vatRegime, setVatRegime] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [iban, setIban] = useState("");

  useEffect(() => {
    if (!profile) return;
    setNationality(profile.nationality ?? "");
    setFiscalCode(profile.fiscal_code ?? "");
    setHasPassport(!!profile.has_passport);
    setPassportCountry(profile.passport_country ?? "");
    setHasVat(!!profile.has_vat_number);
    setVatNumber(profile.vat_number ?? "");
    setVatActivity(profile.vat_activity_type ?? "");
    setVatRegime(profile.vat_regime ?? "");
    setBankName(profile.bank_name ?? "");
    setBankHolder(profile.bank_account_holder ?? "");
    setIban(profile.iban ?? "");
  }, [profile]);

  return (
    <SectionCard icon={<IdCard strokeWidth={1} />} title="Documenti e fiscalità">
      <FieldGrid cols={2}>
        <FloatingSelect
          label="Cittadinanza"
          value={nationality}
          onValueChange={(v) => {
            setNationality(v);
            save({ nationality: v });
          }}
          options={toOptions(NATIONALITIES)}
        />
        <FloatingInput
          label="Codice fiscale"
          value={fiscalCode}
          onChange={(v) => setFiscalCode(v.toUpperCase())}
          onBlur={() => save({ fiscal_code: fiscalCode || null })}
        />
      </FieldGrid>

      <UploadBlock
        label="Documento d'identità"
        description="Carta d'identità o passaporto. Formato JPG, PNG o PDF, massimo 10MB. Il file è privato e visibile solo a te e allo staff dell'agenzia."
        buttonLabel="Carica documento"
        accept="image/jpeg,image/png,application/pdf"
        fileNamePrefix="id-document"
        currentPath={profile?.id_document_url ?? null}
        onUploaded={(path) => save({ id_document_url: path })}
      />

      <SectionDivider />

      <div className="space-y-6">
        <ProfileCheckbox
          checked={hasPassport}
          onCheckedChange={(checked) => {
            setHasPassport(checked);
            save({ has_passport: checked, ...(checked ? {} : { passport_country: null }) });
            if (!checked) setPassportCountry("");
          }}
          label="Ho un passaporto valido"
        />
        {hasPassport && (
          <FloatingSelect
            label="Stato di emissione"
            value={passportCountry}
            onValueChange={(v) => {
              setPassportCountry(v);
              save({ passport_country: v });
            }}
            options={toOptions(COUNTRIES)}
          />
        )}

        <ProfileCheckbox
          checked={hasVat}
          onCheckedChange={(checked) => {
            setHasVat(checked);
            save({ has_vat_number: checked });
          }}
          label="Ho una Partita IVA"
        />
        {hasVat && (
          <FieldGrid cols={3}>
            <FloatingInput
              label="Numero"
              value={vatNumber}
              onChange={setVatNumber}
              onBlur={() => save({ vat_number: vatNumber || null })}
            />
            <FloatingSelect
              label="Tipologia attività"
              value={vatActivity}
              onValueChange={(v) => {
                setVatActivity(v);
                save({ vat_activity_type: v });
              }}
              options={toOptions(VAT_ACTIVITY_TYPES)}
            />
            <FloatingSelect
              label="Regime fiscale"
              value={vatRegime}
              onValueChange={(v) => {
                setVatRegime(v);
                save({ vat_regime: v });
              }}
              options={toOptions(VAT_REGIMES)}
            />
          </FieldGrid>
        )}
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Dati bancari</GroupLabel>
        <div className="space-y-4 sm:space-y-8">
          <FieldGrid cols={2}>
            <FloatingInput
              label="Banca"
              value={bankName}
              onChange={setBankName}
              onBlur={() => save({ bank_name: bankName || null })}
            />
            <FloatingInput
              label="Intestatario conto corrente"
              value={bankHolder}
              onChange={setBankHolder}
              onBlur={() => save({ bank_account_holder: bankHolder || null })}
            />
          </FieldGrid>
          <FloatingInput
            label="IBAN"
            value={iban}
            onChange={(v) => setIban(v.toUpperCase())}
            onBlur={() => save({ iban: iban || null })}
          />
        </div>
      </div>
    </SectionCard>
  );
};
