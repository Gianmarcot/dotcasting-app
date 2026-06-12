import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfileById } from "@/hooks/useProfileById";
import { ProfilePhotoSection } from "@/components/profile/ProfilePhotoSection";
import { BasicInfoSection } from "@/components/profile/BasicInfoSection";
import { AboutMeSection } from "@/components/profile/AboutMeSection";
import { MediaGallerySection } from "@/components/profile/MediaGallerySection";
import { TalentRolesSection } from "@/components/profile/TalentRolesSection";
import { MeasurementsSection } from "@/components/profile/MeasurementsSection";
import { PhysicalFeaturesSection } from "@/components/profile/PhysicalFeaturesSection";
import { AbilitiesSection } from "@/components/profile/AbilitiesSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { LanguagesSection } from "@/components/profile/LanguagesSection";
import { ContactInfoSection } from "@/components/profile/ContactInfoSection";
import { AddressSection } from "@/components/profile/AddressSection";
import { DocumentsSection } from "@/components/profile/DocumentsSection";
import { WorkInfoSection } from "@/components/profile/WorkInfoSection";
import { TravelSection } from "@/components/profile/TravelSection";

const OwnerTalentEdit = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfileById(profileId);
  const [publishing, setPublishing] = useState(false);

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : "Talent";

  const isPublished = !!profile?.onboarding_completed;

  const handlePublish = async () => {
    if (!profile) return;
    const missing: string[] = [];
    if (!profile.first_name) missing.push("Nome");
    if (!profile.last_name) missing.push("Cognome");
    if (!profile.talent_categories || profile.talent_categories.length === 0) {
      missing.push("Almeno un ruolo");
    }
    if (missing.length > 0) {
      toast.error(`Campi mancanti: ${missing.join(", ")}`);
      return;
    }
    setPublishing(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", profile.id);
      if (error) {
        toast.error("Errore nella pubblicazione del profilo");
        return;
      }
      toast.success("Profilo pubblicato");
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
      queryClient.invalidateQueries({ queryKey: ["owner-talents"] });
      queryClient.invalidateQueries({ queryKey: ["owner-talents-count"] });
      navigate("/owner/talents");
    } finally {
      setPublishing(false);
    }
  };

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : "Talent";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profilo non trovato</p>
        <Button variant="outline" onClick={() => navigate("/owner/talents")} className="mt-4">
          Torna alla lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl text-foreground">Modifica Profilo</h1>
          <p className="text-muted-foreground mt-1">
            {displayName}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/owner/talents/${profileId}/view`)}>
          <Eye className="h-4 w-4 mr-2" />
          Visualizza profilo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <BasicInfoSection externalProfileId={profileId} />

          {/* About Me */}
          <AboutMeSection externalProfileId={profileId} />

          {/* Talent Roles */}
          <TalentRolesSection externalProfileId={profileId} />

          {/* Media Gallery */}
          <MediaGallerySection 
            externalProfileId={profileId} 
            externalUserId={profile.user_id}
          />

          {/* Measurements */}
          <MeasurementsSection externalProfileId={profileId} />

          {/* Physical Features */}
          <PhysicalFeaturesSection externalProfileId={profileId} />

          {/* Abilities */}
          <AbilitiesSection externalProfileId={profileId} />

          {/* Skills */}
          <SkillsSection externalProfileId={profileId} />

          {/* Languages */}
          <LanguagesSection externalProfileId={profileId} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <ProfilePhotoSection externalProfileId={profileId} />

          {/* Contact Info */}
          <ContactInfoSection externalProfileId={profileId} />

          {/* Address */}
          <AddressSection externalProfileId={profileId} />

          {/* Documents */}
          <DocumentsSection externalProfileId={profileId} />

          {/* Work Info */}
          <WorkInfoSection externalProfileId={profileId} />

          {/* Travel */}
          <TravelSection externalProfileId={profileId} />
        </div>
      </div>
    </div>
  );
};

export default OwnerTalentEdit;
