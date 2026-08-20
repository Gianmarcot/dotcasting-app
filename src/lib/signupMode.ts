import type { User } from "@supabase/supabase-js";

/**
 * Modalità scelta in registrazione.
 * - "self": il talent registra il proprio account.
 * - "guardian": un tutore registra l'account per un minore (o un adulto tutelato).
 *
 * È persistita sui metadati dell'account (non in stato di navigazione), così sopravvive
 * a un abbandono e a un nuovo accesso.
 */
export type SignupMode = "self" | "guardian";

export const SIGNUP_MODE_METADATA_KEY = "signup_mode";

export const parseSignupMode = (value: unknown): SignupMode =>
  value === "guardian" ? "guardian" : "self";

export const getSignupMode = (user: User | null | undefined): SignupMode =>
  parseSignupMode(user?.user_metadata?.[SIGNUP_MODE_METADATA_KEY]);

export const isGuardianSignup = (user: User | null | undefined) =>
  getSignupMode(user) === "guardian";

/**
 * Conversione di un profilo tutelato: dopo il compimento dei 18 anni le
 * credenziali sono ancora del genitore. Teniamo traccia sui metadati di quando
 * il talent le ha aggiornate, per non far sparire l'avviso troppo presto.
 */
export const CREDENTIALS_UPDATED_METADATA_KEY = "credentials_updated_at";

export const hasUpdatedCredentials = (user: User | null | undefined) =>
  !!user?.user_metadata?.[CREDENTIALS_UPDATED_METADATA_KEY];

/** true quando l'account nasce come tutela ma il profilo non è più tutelato. */
export const needsCredentialsUpdate = (
  user: User | null | undefined,
  guardianUserId: string | null | undefined
) => isGuardianSignup(user) && !guardianUserId && !hasUpdatedCredentials(user);

export const markCredentialsUpdated = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.auth.updateUser({
    data: { [CREDENTIALS_UPDATED_METADATA_KEY]: new Date().toISOString() },
  });
};
