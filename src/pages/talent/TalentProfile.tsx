import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
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
import { ProfileCompletionBar } from "@/components/profile/ProfileCompletionBar";

export const TalentProfile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Utente";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-foreground">Il mio Profilo</h1>
        <p className="text-muted-foreground mt-1">
          Completa il tuo profilo per aumentare le tue possibilità di essere selezionato
        </p>
      </div>

      {/* Profile Completion Progress */}
      <ProfileCompletionBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Name & Location Header */}
          <div className="pb-4 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
            {(profile?.city || profile?.country) && (
              <p className="text-muted-foreground">
                {[profile?.city, profile?.country].filter(Boolean).join(", ")}
              </p>
            )}
            {profile?.gender && (
              <p className="text-sm text-muted-foreground mt-1">{profile.gender}</p>
            )}
          </div>

          {/* Basic Info */}
          <div id="basic-info">
            <BasicInfoSection />
          </div>

          {/* About Me */}
          <div id="about-me">
            <AboutMeSection />
          </div>

          {/* Talent Roles */}
          <div id="talent-roles">
            <TalentRolesSection />
          </div>

          {/* Media Gallery */}
          <div id="media-gallery">
            <MediaGallerySection />
          </div>

          {/* Measurements */}
          <div id="measurements">
            <MeasurementsSection />
          </div>

          {/* Physical Features */}
          <div id="physical-features">
            <PhysicalFeaturesSection />
          </div>

          {/* Abilities */}
          <div id="abilities">
            <AbilitiesSection />
          </div>

          {/* Skills */}
          <div id="skills">
            <SkillsSection />
          </div>

          {/* Languages */}
          <div id="languages">
            <LanguagesSection />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <div id="profile-photo">
            <ProfilePhotoSection />
          </div>

          {/* Contact Info */}
          <div id="contact-info">
            <ContactInfoSection />
          </div>

          {/* Address */}
          <div id="address">
            <AddressSection />
          </div>

          {/* Documents */}
          <div id="documents">
            <DocumentsSection />
          </div>

          {/* Work Info */}
          <div id="work-info">
            <WorkInfoSection />
          </div>

          {/* Travel */}
          <div id="travel">
            <TravelSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
