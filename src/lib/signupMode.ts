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

/* --------------------------------------------------------------------------
 * Cambio email in attesa di conferma.
 * `auth.updateUser({ email })` non cambia l'indirizzo subito: diventa effettivo
 * solo dopo il click sul link inviato al nuovo indirizzo. Teniamo traccia della
 * richiesta sui metadati dell'account, così lo stato sopravvive a un
 * ricaricamento della pagina.
 * ------------------------------------------------------------------------ */

export const PENDING_EMAIL_METADATA_KEY = "pending_email";
export const PENDING_EMAIL_REQUESTED_AT_METADATA_KEY = "pending_email_requested_at";

/** Indirizzo richiesto e non ancora confermato, oppure null. */
export const getPendingEmail = (user: User | null | undefined): string | null => {
  const pending = user?.user_metadata?.[PENDING_EMAIL_METADATA_KEY];
  if (typeof pending !== "string" || !pending.trim()) return null;
  // Confermato: l'email dell'account coincide già con quella richiesta.
  if (user?.email && user.email.toLowerCase() === pending.toLowerCase()) return null;
  return pending;
};

export const markEmailChangePending = async (email: string) => {
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.auth.updateUser({
    data: {
      [PENDING_EMAIL_METADATA_KEY]: email,
      [PENDING_EMAIL_REQUESTED_AT_METADATA_KEY]: new Date().toISOString(),
    },
  });
};

export const clearEmailChangePending = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.auth.updateUser({
    data: {
      [PENDING_EMAIL_METADATA_KEY]: null,
      [PENDING_EMAIL_REQUESTED_AT_METADATA_KEY]: null,
    },
  });
};

