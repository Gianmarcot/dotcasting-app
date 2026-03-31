import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useProfileById } from "@/hooks/useProfileById";
import { useUpdateProfileById } from "@/hooks/useUpdateProfileById";
import { toast } from "sonner";

interface ProfilePhotoSectionProps {
  externalProfileId?: string;
}

export const ProfilePhotoSection = ({ externalProfileId }: ProfilePhotoSectionProps) => {
  const { user } = useAuth();
  const { data: ownProfile } = useProfile();
  const { data: externalProfile } = useProfileById(externalProfileId);
  const updateOwnProfile = useUpdateProfile();
  const updateExternalProfile = useUpdateProfileById();
  
  const profile = externalProfileId ? externalProfile : ownProfile;
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarInitial = profile?.first_name?.charAt(0).toUpperCase() 
    || user?.email?.charAt(0).toUpperCase() 
    || "U";

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Use the profile's user_id for external profiles, or current user for own profile
    const targetUserId = externalProfileId ? profile?.user_id : user?.id;
    if (!file || !targetUserId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Il file è troppo grande. Massimo 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${targetUserId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (externalProfileId) {
        await updateExternalProfile.mutateAsync({ 
          profileId: externalProfileId, 
          updates: { profile_photo_url: publicUrl } 
        });
      } else {
        await updateOwnProfile.mutateAsync({ profile_photo_url: publicUrl });
      }
      toast.success("Foto profilo aggiornata!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Errore durante il caricamento della foto");
    } finally {
      setIsUploading(false);
    }
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : "";

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <Avatar className="h-28 w-28">
              <AvatarImage src={profile?.profile_photo_url || ""} />
              <AvatarFallback className="text-3xl bg-muted">
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          <div>
            {displayName && (
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
            )}
            {(profile?.city || profile?.country) && (
              <p className="text-sm text-muted-foreground">
                {[profile?.city, profile?.country].filter(Boolean).join(", ")}
              </p>
            )}
            {profile?.gender && (
              <p className="text-sm text-muted-foreground">{profile.gender}</p>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
