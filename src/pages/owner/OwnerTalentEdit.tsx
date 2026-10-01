import { useParams } from "react-router-dom";
import { ProfileFormProvider } from "@/components/profile/v2/ProfileFormContext";
import { ProfileContent } from "@/pages/talent/TalentProfileV2";

const OwnerTalentEdit = () => {
  const { profileId } = useParams<{ profileId: string }>();
  if (!profileId) return null;
  return (
    <ProfileFormProvider externalProfileId={profileId}>
      <ProfileContent adminMode />
    </ProfileFormProvider>
  );
};

export default OwnerTalentEdit;
