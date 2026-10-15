import { SaveBar } from "@/components/ui/save-bar";
import { useProfileForm } from "./ProfileFormContext";

export const ProfileSaveBar = () => {
  const { isDirty, dirtyCount, isSaving, save, reset } = useProfileForm();
  return <SaveBar dirty={isDirty} count={dirtyCount} saving={isSaving} onSave={() => void save()} onReset={reset} />;
};
