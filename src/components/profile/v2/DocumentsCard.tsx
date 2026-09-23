import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, IdCard, Info } from "lucide-react";
import { fiscalCodeMismatchFields, validateFiscalCode } from "@/lib/fiscalCode";
import { useAppSettings } from "@/hooks/useAppSettings";
import { hasCatastaliLoaded, loadCatastali } from "@/lib/geo/catastali";

import { COUNTRIES, NATIONALITIES, VAT_REGIMES } from "@/lib/profileOptions";
import {
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  GroupHeading,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
  YesNoRadio,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { UploadBlock } from "./UploadBlock";
import { FieldSlot, useProfileForm } from "./ProfileFormContext";

export const DocumentsCard = () => {
  const { str, bool, triState, set, setMany, saveNow, profileRow } = useProfileForm();
  const { data: settings } = useAppSettings();

  const hasPassport = bool("p", "has_passport");
  const hasVat = bool("p", "has_vat_number");

  const hasFiscalCode = triState("p", "has_italian_fiscal_code");
  const fiscalCode = str("p", "fiscal_code");

  const fiscalCheck = useMemo(() => validateFiscalCode(fiscalCode), [fiscalCode]);
  const fiscalError = fiscalCheck.error
    ? "Il codice fiscale non sembra corretto: ricontrollalo."
    : null;

  /* La tabella dei codici catastali serve per verificare il luogo di nascita. */
  const [catastaliReady, setCatastaliReady] = useState(hasCatastaliLoaded());
  useEffect(() => {
    if (catastaliReady) return;
    let alive = true;
    loadCatastali()
      .then(() => alive && setCatastaliReady(true))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [catastaliReady]);

  const firstName = str("p", "first_name");
  const lastName = str("p", "last_name");
  const birthDate = str("p", "birth_date");
  const gender = str("p", "gender");
  const birthCity = str("p", "birth_city");
  const birthCountry = str("p", "birth_country");

  const mismatches = useMemo(
    () =>
      fiscalCheck.valid
        ? fiscalCodeMismatchFields(fiscalCode, {
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate || null,
            gender: gender || null,
            birth_city: birthCity || null,
            birth_country: birthCountry || null,
          })
        : [],
    [
      fiscalCheck.valid,
      fiscalCode,
      firstName,
      lastName,
      birthDate,
      gender,
      birthCity,
      birthCountry,
      catastaliReady,
    ]
  );

  const fiscalWarning =
    mismatches.length > 0
      ? `Il codice fiscale non corrisponde a ${mismatches.join(" / ")}. Verifica il codice e gli altri dati del profilo.`
      : null;

  /* Lo stato "da verificare" viene salvato con il profilo. */
  const mismatchFlag = hasFiscalCode !== false && mismatches.length > 0;
  useEffect(() => {
    if (bool("p", "fiscal_code_mismatch") !== mismatchFlag) {
      set("p", "fiscal_code_mismatch", mismatchFlag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mismatchFlag]);

  const agencyEmail = settings?.contact_email;
  const agencyName = settings?.agency_name || "l'agenzia";

  return (
    <SectionCard icon={<IdCard strokeWidth={1} />} title="Documenti e fiscalità">
      <FieldGrid cols={2}>
        <FloatingSelect
          label="Cittadinanza"
          value={str("p", "nationality")}
          onValueChange={(v) => set("p", "nationality", v)}
          options={toOptions(NATIONALITIES)}
        />
      </FieldGrid>

      <div className="space-y-4">
        <span className="text-[15px] text-foreground">Hai un codice fiscale italiano?</span>
        <YesNoRadio
          value={hasFiscalCode}
          onValueChange={(v) =>
            setMany("p", {
              has_italian_fiscal_code: v,
              ...(v ? {} : { fiscal_code: null, fiscal_code_mismatch: false }),
            })
          }
        />
      </div>

      {hasFiscalCode === true && (
        <FieldGrid cols={2}>
          <FieldSlot name="fiscal_code" hideMessage>
            <FloatingInput
              label="Codice fiscale"
              value={fiscalCode}
              maxLength={16}
              onChange={(v) => set("p", "fiscal_code", v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              error={fiscalError ? " " : null}
            />
          </FieldSlot>
          {(fiscalError || fiscalWarning) && (
            <NoticeBox tone="warning" icon={<AlertTriangle strokeWidth={1.5} />}>
              <p>{fiscalError ?? fiscalWarning}</p>
            </NoticeBox>
          )}
        </FieldGrid>
      )}

      {hasFiscalCode === false && (
        <NoticeBox tone="warning" icon={<Info strokeWidth={1.5} />}>
          <p>
            Senza un codice fiscale italiano puoi creare e mantenere il tuo profilo, ma non è
            possibile contrattualizzarti per un lavoro. Se la situazione cambia, o se pensi di
            poterlo ottenere, scrivici: ne parliamo insieme.
            {agencyEmail && (
              <>
                {" "}
                Puoi contattare {agencyName} a{" "}
                <a href={`mailto:${agencyEmail}`} className="underline">
                  {agencyEmail}
                </a>
                .
              </>
            )}
          </p>
        </NoticeBox>
      )}

      <SectionDivider />




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
            <FloatingSelect
              label="Regime fiscale"
              value={str("p", "vat_regime")}
              onValueChange={(v) => set("p", "vat_regime", v)}
              options={toOptions(VAT_REGIMES)}
            />
            <FloatingInput
              label="Tipologia attività"
              value={str("p", "vat_activity_type")}
              onChange={(v) => set("p", "vat_activity_type", v)}
            />
            <FloatingInput
              label="Numero"
              value={str("p", "vat_number")}
              onChange={(v) => set("p", "vat_number", v)}
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
