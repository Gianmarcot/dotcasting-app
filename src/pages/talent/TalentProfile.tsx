import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ProfilePhotoSection } from "@/components/profile/ProfilePhotoSection";
import { BasicInfoSection } from "@/components/profile/BasicInfoSection";
import { AboutMeSection } from "@/components/profile/AboutMeSection";
import { AppearanceSection } from "@/components/profile/AppearanceSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { LanguagesSection } from "@/components/profile/LanguagesSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, X } from "lucide-react";
import { useState } from "react";

export const TalentProfile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [showTip, setShowTip] = useState(true);

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

      {/* Tip Banner */}
      {showTip && (
        <Alert className="bg-muted/50 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Aggiungi tutti i dettagli rilevanti per te. Le sezioni lasciate vuote saranno visibili solo a te.
            </span>
            <button onClick={() => setShowTip(false)} className="ml-4">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </AlertDescription>
        </Alert>
      )}

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

          {/* About Me */}
          <AboutMeSection />

          {/* Appearance */}
          <AppearanceSection />

          {/* Skills */}
          <SkillsSection />

          {/* Languages */}
          <LanguagesSection />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <ProfilePhotoSection />

          {/* Basic Info */}
          <BasicInfoSection />
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
