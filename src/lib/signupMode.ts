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
