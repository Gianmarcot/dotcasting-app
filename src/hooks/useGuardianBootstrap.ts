import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isGuardianSignup } from "@/lib/signupMode";

/**
 * Per gli account registrati in modalità tutore predispone, se mancanti:
 * 1. la riga `guardians` del tutore (vuota, la riempie l'onboarding);
 * 2. il collegamento di tutela sul profilo talent del minore (`guardian_user_id`).
 *
 * Idempotente: se esistono già non fa nulla.
 */
export const useGuardianBootstrap = () => {
  const { user } = useAuth();
  const doneFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !isGuardianSignup(user)) return;
    if (doneFor.current === user.id) return;
    doneFor.current = user.id;

    void (async () => {
      const { error: guardianError } = await supabase
        .from("guardians")
        .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

      if (guardianError) {
        console.error("guardian bootstrap (guardians):", guardianError);
        doneFor.current = null;
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ guardian_user_id: user.id })
        .eq("user_id", user.id)
        .is("guardian_user_id", null);

      if (profileError) {
        console.error("guardian bootstrap (profiles):", profileError);
        doneFor.current = null;
      }
    })();
  }, [user]);
};
