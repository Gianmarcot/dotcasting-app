import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  ProfileSectionRail,
  PROFILE_SECTIONS,
  anchorToSection,
  type ProfileSectionKey,
} from "@/components/profile/ProfileSectionRail";

export const TalentProfile = () => {
  const { isLoading } = useProfile();
  const [activeSection, setActiveSection] = useState<ProfileSectionKey>("personal");

  const goToSection = (key: ProfileSectionKey) => {
    setActiveSection(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentIndex = PROFILE_SECTIONS.findIndex((s) => s.key === activeSection);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return <BasicInfoSection />;
      case "contacts":
        return (
          <>
            <ContactInfoSection />
            <AddressSection />
          </>
        );
      case "documents":
        return <DocumentsSection />;
      case "appearance":
        return (
          <>
            <MeasurementsSection />
            <PhysicalFeaturesSection />
          </>
        );
      case "bio":
        return (
          <>
            <AboutMeSection />
            <AbilitiesSection />
            <SkillsSection />
            <LanguagesSection />
          </>
        );
      case "work":
        return (
          <>
            <WorkInfoSection />
            <TravelSection />
          </>
        );
      case "roles":
        return <TalentRolesSection />;
      case "media":
        return <MediaGallerySection />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-foreground">Il mio Profilo</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Completa il tuo profilo per aumentare le tue possibilità di essere selezionato
          </p>
        </div>
        <Link to="/talent/profile/preview">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Eye className="h-4 w-4" />
            Visualizza profilo pubblico
          </Button>
        </Link>
      </div>

      {/* Top row: Photo + Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfilePhotoSection />
        </div>
        <div className="lg:col-span-2">
          <ProfileCompletionBar
            onSelectSection={(anchor) => {
              const key = anchorToSection(anchor);
              if (key) goToSection(key);
            }}
          />
        </div>
      </div>

      {/* Section navigation + content */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        <div className="lg:col-span-3 lg:sticky lg:top-6">
          <ProfileSectionRail active={activeSection} onSelect={goToSection} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          {renderSection()}

          {/* Prev / Next */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => goToSection(PROFILE_SECTIONS[currentIndex - 1].key)}
              disabled={currentIndex <= 0}
            >
              <ChevronLeft className="h-5 w-5" />
              Indietro
            </Button>
            <Button
              onClick={() => goToSection(PROFILE_SECTIONS[currentIndex + 1].key)}
              disabled={currentIndex >= PROFILE_SECTIONS.length - 1}
            >
              Avanti
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
