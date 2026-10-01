import { useParams } from "react-router-dom";
import { ProfileContent } from "@/pages/talent/TalentProfileV2";

const OwnerTalentEdit = () => {
  const { profileId } = useParams<{ profileId: string }>();
  if (!profileId) return null;
  return <ProfileContent adminMode externalProfileId={profileId} />;
};

export default OwnerTalentEdit;
