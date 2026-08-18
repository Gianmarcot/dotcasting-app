import { useCallback } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile, type ProfileUpdate } from "@/hooks/useUpdateProfile";
import {
  useTalentAttributes,
  useUpdateTalentAttributes,
  type AttributesUpdate,
} from "@/hooks/useTalentAttributes";

/** Auto-save helper for the talent profile form: saves a patch on change/blur. */
export const useProfileAutoSave = () => {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

  const save = useCallback(
    (patch: ProfileUpdate) => {
      update.mutate(patch, {
        onError: () => toast.error("Errore durante il salvataggio"),
      });
    },
    [update]
  );

  return { profile, isLoading, save, isSaving: update.isPending };
};

export const useAttributesAutoSave = () => {
  const { data: attributes } = useTalentAttributes();
  const update = useUpdateTalentAttributes();

  const save = useCallback(
    (patch: AttributesUpdate) => {
      update.mutate(patch, {
        onError: () => toast.error("Errore durante il salvataggio"),
      });
    },
    [update]
  );

  return { attributes, save, isSaving: update.isPending };
};

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
