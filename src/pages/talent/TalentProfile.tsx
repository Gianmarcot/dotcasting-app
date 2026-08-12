import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { ProfileCompletionBar } from "@/components/profile/ProfileCompletionBar";
import { ProfileSectionNav } from "@/components/profile/ProfileSectionNav";
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

export const TalentProfile = () => {
  const { isLoading } = useProfile();

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

      {/* Suggerimenti in cima */}
      <ProfileCompletionBar />

      {/* Side-navigation + sezioni impilate in una sola colonna */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        <ProfileSectionNav />

        <div className="space-y-6 min-w-0">
          <div id="basic-info" className="scroll-mt-8">
            <BasicInfoSection />
          </div>

          <div id="about-me" className="scroll-mt-8">
            <AboutMeSection />
          </div>

          <div id="talent-roles" className="scroll-mt-8">
            <TalentRolesSection />
          </div>

          <div id="media-gallery" className="scroll-mt-8">
            <MediaGallerySection />
          </div>

          <div id="measurements" className="scroll-mt-8">
            <MeasurementsSection />
          </div>

          <div id="physical-features" className="scroll-mt-8">
            <PhysicalFeaturesSection />
          </div>

          <div id="abilities" className="scroll-mt-8">
            <AbilitiesSection />
          </div>

          <div id="skills" className="scroll-mt-8">
            <SkillsSection />
          </div>

          <div id="languages" className="scroll-mt-8">
            <LanguagesSection />
          </div>

          <div id="contact-info" className="scroll-mt-8">
            <ContactInfoSection />
          </div>

          <div id="address" className="scroll-mt-8">
            <AddressSection />
          </div>

          <div id="documents" className="scroll-mt-8">
            <DocumentsSection />
          </div>

          <div id="work-info" className="scroll-mt-8">
            <WorkInfoSection />
          </div>

          <div id="travel" className="scroll-mt-8">
            <TravelSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
