import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { validateFiscalCode } from "@/lib/fiscalCode";

import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile, type ProfileUpdate } from "@/hooks/useUpdateProfile";
import {
  useTalentAttributes,
  useUpdateTalentAttributes,
  type AttributesUpdate,
} from "@/hooks/useTalentAttributes";

export type Scope = "p" | "a";
type Values = Record<string, unknown>;

/* --------------------------------- helpers --------------------------------- */

export const toNumber = (value: string): number | null => {
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export const calcAge = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

/** Canonical representation used to compare current values with the loaded ones. */
const canonical = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "∅";
  if (Array.isArray(value)) {
    return JSON.stringify([...value].map((v) => canonical(v)).sort());
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => [k, canonical(v)] as const)
      .filter(([, v]) => v !== "∅")
      .sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
  }
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
};

const isSame = (a: unknown, b: unknown) => canonical(a) === canonical(b);

/** Empty strings and empty arrays are persisted as NULL. */
const forDb = (value: unknown) => {
  if (value === "") return null;
  if (Array.isArray(value) && value.length === 0) return null;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const hasValue = Object.values(value as Record<string, unknown>).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    return hasValue ? value : null;
  }
  return value;
};

const IGNORED_KEYS = new Set([
  "id",
  "user_id",
  "profile_id",
  "created_at",
  "updated_at",
  "triaged_at",
  "onboarding_completed",
  "is_shortlisted",
  "visibility_settings",
  "profile_photo_url",
  "id_document_url",
  "cv_url",
]);

const snapshot = (row: Values | null | undefined): Values => {
  if (!row) return {};
  return Object.fromEntries(Object.entries(row).filter(([k]) => !IGNORED_KEYS.has(k)));
};

/* --------------------------------- context --------------------------------- */

interface ProfileFormContextValue {
  isLoading: boolean;
  /** Raw server rows (used for read-only display such as photo, uploads). */
  profileRow: ReturnType<typeof useProfile>["data"];
  str: (scope: Scope, key: string) => string;
  num: (scope: Scope, key: string) => string;
  bool: (scope: Scope, key: string) => boolean;
  triState: (scope: Scope, key: string) => boolean | null;
  arr: (scope: Scope, key: string) => string[];
  obj: <T>(scope: Scope, key: string) => T;
  raw: (scope: Scope, key: string) => unknown;
  set: (scope: Scope, key: string, value: unknown) => void;
  setMany: (scope: Scope, patch: Values) => void;
  /** Saves immediately, outside of the pending-changes flow (file uploads). */
  saveNow: (scope: Scope, patch: Values) => void;
  dirtyCount: number;
  isDirty: boolean;
  isSaving: boolean;
  save: () => Promise<boolean>;
  reset: () => void;
  resetKey: number;
  errors: Record<string, string>;
  registerField: (name: string) => (el: HTMLDivElement | null) => void;
}

const ProfileFormCtx = createContext<ProfileFormContextValue | null>(null);

export const useProfileForm = () => {
  const ctx = useContext(ProfileFormCtx);
  if (!ctx) throw new Error("useProfileForm must be used inside ProfileFormProvider");
  return ctx;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ProfileFormProvider = ({ children }: { children: ReactNode }) => {
  const { data: profileRow, isLoading } = useProfile();
  const { data: attributesRow } = useTalentAttributes();
  const updateProfile = useUpdateProfile();
  const updateAttributes = useUpdateTalentAttributes();

  const [baseline, setBaseline] = useState<{ p: Values; a: Values }>({ p: {}, a: {} });
  const [draft, setDraft] = useState<{ p: Values; a: Values }>({ p: {}, a: {} });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const dirtyKeys = useMemo(() => {
    const out: { scope: Scope; key: string }[] = [];
    (["p", "a"] as Scope[]).forEach((scope) => {
      Object.keys(draft[scope]).forEach((key) => {
        if (!isSame(draft[scope][key], baseline[scope][key])) out.push({ scope, key });
      });
    });
    return out;
  }, [draft, baseline]);

  const isDirty = dirtyKeys.length > 0;
  const dirtyRef = useRef(false);
  dirtyRef.current = isDirty;

  /* Sync from the server whenever there is nothing pending. */
  useEffect(() => {
    if (dirtyRef.current) return;
    const next = { p: snapshot(profileRow as Values | null), a: snapshot(attributesRow as Values | null) };
    setBaseline(next);
    setDraft(next);
  }, [profileRow, attributesRow]);

  const raw = useCallback((scope: Scope, key: string) => draft[scope][key], [draft]);

  const set = useCallback((scope: Scope, key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [scope]: { ...prev[scope], [key]: value } }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setMany = useCallback((scope: Scope, patch: Values) => {
    setDraft((prev) => ({ ...prev, [scope]: { ...prev[scope], ...patch } }));
  }, []);

  const str = useCallback(
    (scope: Scope, key: string) => {
      const v = draft[scope][key];
      return v === null || v === undefined ? "" : String(v);
    },
    [draft]
  );

  const num = str;

  const bool = useCallback((scope: Scope, key: string) => !!draft[scope][key], [draft]);

  const triState = useCallback(
    (scope: Scope, key: string) => {
      const v = draft[scope][key];
      return v === null || v === undefined ? null : !!v;
    },
    [draft]
  );

  const arr = useCallback(
    (scope: Scope, key: string) => (draft[scope][key] as string[] | null) ?? [],
    [draft]
  );

  const obj = useCallback(
    <T,>(scope: Scope, key: string) => ((draft[scope][key] as T) ?? ({} as T)),
    [draft]
  );

  const registerField = useCallback(
    (name: string) => (el: HTMLDivElement | null) => {
      fieldRefs.current[name] = el;
    },
    []
  );

  const validate = useCallback((): Record<string, string> => {
    const found: Record<string, string> = {};
    const birthDate = draft.p.birth_date as string | null;
    const age = calcAge(birthDate);
    if (birthDate && age !== null && age < 18) {
      found.birth_date = "Devi avere almeno 18 anni";
    }
    const email = (draft.p.contact_email as string | null) ?? "";
    if (email && !EMAIL_RE.test(email)) found.contact_email = "Inserisci un indirizzo email valido";
    const fiscal = (draft.p.fiscal_code as string | null) ?? "";
    if (fiscal) {
      if (fiscal.replace(/[^A-Za-z0-9]/g, "").length !== 16) {
        found.fiscal_code = "Il codice fiscale deve avere 16 caratteri";
      } else {
        const check = validateFiscalCode(fiscal);
        if (!check.valid) found.fiscal_code = check.error ?? "Codice fiscale non valido";
      }
    }

    const iban = (draft.p.iban as string | null) ?? "";
    if (iban && iban.replace(/\s/g, "").length < 15) found.iban = "IBAN non valido";
    return found;
  }, [draft]);

  const focusFirstError = useCallback((found: Record<string, string>) => {
    const first = Object.keys(found)[0];
    const el = first ? fieldRefs.current[first] : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const save = useCallback(async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      toast.error("Controlla i campi evidenziati");
      return false;
    }

    const profilePatch: Values = {};
    const attributesPatch: Values = {};
    dirtyKeys.forEach(({ scope, key }) => {
      const value = forDb(draft[scope][key]);
      if (scope === "p") profilePatch[key] = value;
      else attributesPatch[key] = value;
    });

    try {
      if (Object.keys(profilePatch).length > 0) {
        await updateProfile.mutateAsync(profilePatch as ProfileUpdate);
      }
      if (Object.keys(attributesPatch).length > 0) {
        await updateAttributes.mutateAsync(attributesPatch as AttributesUpdate);
      }
      setBaseline(draft);
      toast.success("Profilo salvato");
      return true;
    } catch {
      toast.error("Errore durante il salvataggio");
      return false;
    }
  }, [dirtyKeys, draft, focusFirstError, updateAttributes, updateProfile, validate]);

  const reset = useCallback(() => {
    setDraft(baseline);
    setErrors({});
    setResetKey((k) => k + 1);
  }, [baseline]);

  const saveNow = useCallback(
    (scope: Scope, patch: Values) => {
      const mutation = scope === "p" ? updateProfile : updateAttributes;
      mutation.mutate(patch as ProfileUpdate & AttributesUpdate, {
        onError: () => toast.error("Errore durante il salvataggio"),
      });
    },
    [updateAttributes, updateProfile]
  );

  const value: ProfileFormContextValue = {
    isLoading,
    profileRow,
    str,
    num,
    bool,
    triState,
    arr,
    obj,
    raw,
    set,
    setMany,
    saveNow,
    dirtyCount: dirtyKeys.length,
    isDirty,
    isSaving: updateProfile.isPending || updateAttributes.isPending,
    save,
    reset,
    resetKey,
    errors,
    registerField,
  };

  return <ProfileFormCtx.Provider value={value}>{children}</ProfileFormCtx.Provider>;
};

/* -------------------------------- FieldSlot -------------------------------- */

/** Wraps a validated field: highlights it and allows scrolling to it on error. */
export const FieldSlot = ({
  name,
  children,
  className,
}: {
  name: string;
  children: ReactNode;
  className?: string;
}) => {
  const { errors, registerField } = useProfileForm();
  const error = errors[name];

  return (
    <div
      ref={registerField(name)}
      className={cn(
        "flex flex-col gap-1",
        error && "rounded-2xl ring-2 ring-destructive ring-offset-2 ring-offset-profile-card",
        className
      )}
    >
      {children}
      {error && <span className="px-4 text-sm text-destructive">{error}</span>}
    </div>
  );
};
