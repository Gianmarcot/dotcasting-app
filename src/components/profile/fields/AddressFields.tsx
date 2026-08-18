import { useEffect, useState } from "react";
import { FieldGrid, FloatingInput, FloatingSelect, toOptions } from "./FormFields";
import { COUNTRIES, ITALIAN_PROVINCES, ITALIAN_REGIONS } from "@/lib/profileOptions";
import { getComuniSync, loadComuni } from "@/lib/geo/comuni";

export interface AddressValue {
  state?: string;
  region?: string;
  province?: string;
  city?: string;
  street?: string;
  postal_code?: string;
}

export const isItaly = (address: AddressValue | undefined) => address?.state === "Italia";

export const cascadeAddress = (
  address: AddressValue,
  field: keyof AddressValue,
  value: string
): AddressValue => {
  const next: AddressValue = { ...address, [field]: value };
  if (field === "state") {
    next.region = "";
    next.province = "";
    next.city = "";
  }
  if (field === "region") {
    next.province = "";
    next.city = "";
  }
  if (field === "province") {
    next.city = "";
  }
  return next;
};

/** Stato | Regione | Provincia | Città — cascading (dropdowns for Italy, free text elsewhere) */
export const GeoFields = ({
  value,
  onChange,
  labels = {},
}: {
  value: AddressValue;
  onChange: (next: AddressValue) => void;
  labels?: { state?: string; region?: string; province?: string; city?: string };
}) => {
  const italy = isItaly(value);
  const province = value.province ?? "";
  const [comuni, setComuni] = useState<string[] | null>(() =>
    province ? getComuniSync(province) : null
  );

  useEffect(() => {
    if (!italy || !province) {
      setComuni(null);
      return;
    }
    let active = true;
    loadComuni().then((data) => {
      if (active) setComuni(data[province] ?? null);
    });
    return () => {
      active = false;
    };
  }, [italy, province]);

  const set = (field: keyof AddressValue) => (v: string) =>
    onChange(cascadeAddress(value, field, v));

  return (
    <>
      <FloatingSelect
        label={labels.state ?? "Stato"}
        value={value.state ?? ""}
        onValueChange={set("state")}
        options={toOptions(COUNTRIES)}
      />
      {italy ? (
        <FloatingSelect
          label={labels.region ?? "Regione"}
          value={value.region ?? ""}
          onValueChange={set("region")}
          options={toOptions(ITALIAN_REGIONS)}
        />
      ) : (
        <FloatingInput
          label={labels.region ?? "Regione"}
          value={value.region ?? ""}
          onChange={(v) => onChange({ ...value, region: v })}
        />
      )}
      {italy ? (
        <FloatingSelect
          label={labels.province ?? "Provincia"}
          value={province}
          onValueChange={set("province")}
          options={toOptions(ITALIAN_PROVINCES[value.region ?? ""] ?? [])}
        />
      ) : (
        <FloatingInput
          label={labels.province ?? "Provincia"}
          value={province}
          onChange={(v) => onChange({ ...value, province: v })}
        />
      )}
      {italy && comuni && comuni.length > 0 ? (
        <FloatingSelect
          label={labels.city ?? "Città"}
          value={value.city ?? ""}
          onValueChange={(v) => onChange({ ...value, city: v })}
          options={toOptions(comuni)}
        />
      ) : (
        <FloatingInput
          label={labels.city ?? "Città"}
          value={value.city ?? ""}
          onChange={(v) => onChange({ ...value, city: v })}
        />
      )}
    </>
  );
};

export const AddressBlock = ({
  value,
  onChange,
  onCommit,
}: {
  value: AddressValue;
  onChange: (next: AddressValue) => void;
  onCommit?: () => void;
}) => (
  <div className="space-y-4 sm:space-y-8">
    <FieldGrid cols={4}>
      <GeoFields
        value={value}
        onChange={(next) => {
          onChange(next);
          onCommit?.();
        }}
      />
    </FieldGrid>
    <FieldGrid cols={2}>
      <FloatingInput
        label="Via e numero"
        value={value.street ?? ""}
        onChange={(v) => onChange({ ...value, street: v })}
        onBlur={onCommit}
      />
      <FloatingInput
        label="CAP"
        value={value.postal_code ?? ""}
        onChange={(v) => onChange({ ...value, postal_code: v })}
        onBlur={onCommit}
      />
    </FieldGrid>
  </div>
);
