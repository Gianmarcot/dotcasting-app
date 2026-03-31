import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useProfileById } from "@/hooks/useProfileById";
import { useUpdateProfileById } from "@/hooks/useUpdateProfileById";
import { toast } from "sonner";
import { PHONE_PREFIXES } from "@/lib/profileOptions";
import type { Json } from "@/integrations/supabase/types";

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  amazon?: string;
}

interface ContactInfoSectionProps {
  externalProfileId?: string;
}

export const ContactInfoSection = ({ externalProfileId }: ContactInfoSectionProps) => {
  const { data: ownProfile } = useProfile();
  const { data: externalProfile } = useProfileById(externalProfileId);
  const updateOwnProfile = useUpdateProfile();
  const updateExternalProfile = useUpdateProfileById();
  
  const profile = externalProfileId ? externalProfile : ownProfile;
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    phonePrefix: "+39",
    phoneNumber: "",
    whatsappPrefix: "+39",
    whatsappNumber: "",
    websiteUrl: "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        phonePrefix: profile.phone_prefix || "+39",
        phoneNumber: profile.phone_number || "",
        whatsappPrefix: profile.whatsapp_prefix || "+39",
        whatsappNumber: profile.whatsapp_number || "",
        websiteUrl: profile.website_url || "",
      });
      setSocialLinks((profile.social_links as SocialLinks) || {});
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (key: keyof SocialLinks, value: string) => {
    setSocialLinks({ ...socialLinks, [key]: value });
  };

  const handleSave = async () => {
    try {
      const updates = {
        phone_prefix: formData.phonePrefix,
        phone_number: formData.phoneNumber || null,
        whatsapp_prefix: formData.whatsappPrefix,
        whatsapp_number: formData.whatsappNumber || null,
        website_url: formData.websiteUrl || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks as unknown as Json : null,
      };
      
      if (externalProfileId) {
        await updateExternalProfile.mutateAsync({ profileId: externalProfileId, updates });
      } else {
        await updateOwnProfile.mutateAsync(updates);
      }
      setIsEditing(false);
      toast.success("Contatti aggiornati!");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        phonePrefix: profile.phone_prefix || "+39",
        phoneNumber: profile.phone_number || "",
        whatsappPrefix: profile.whatsapp_prefix || "+39",
        whatsappNumber: profile.whatsapp_number || "",
        websiteUrl: profile.website_url || "",
      });
      setSocialLinks((profile.social_links as SocialLinks) || {});
    }
    setIsEditing(false);
  };

  const isPending = externalProfileId ? updateExternalProfile.isPending : updateOwnProfile.isPending;

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Contatti</CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone */}
        <div className="space-y-2">
          <Label>Telefono</Label>
          <div className="flex gap-2">
            <Select 
              value={formData.phonePrefix} 
              onValueChange={(v) => setFormData({...formData, phonePrefix: v})}
              disabled={!isEditing}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHONE_PREFIXES.map(p => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.code} {p.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="333 1234567"
              className="flex-1"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label>WhatsApp</Label>
          <div className="flex gap-2">
            <Select 
              value={formData.whatsappPrefix} 
              onValueChange={(v) => setFormData({...formData, whatsappPrefix: v})}
              disabled={!isEditing}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHONE_PREFIXES.map(p => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.code} {p.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="333 1234567"
              className="flex-1"
            />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label>Sito web</Label>
          <Input
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="https://miosito.com"
          />
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Social Media</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Instagram</Label>
              <Input
                value={socialLinks.instagram || ""}
                onChange={(e) => handleSocialChange("instagram", e.target.value)}
                disabled={!isEditing}
                placeholder="@username"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">TikTok</Label>
              <Input
                value={socialLinks.tiktok || ""}
                onChange={(e) => handleSocialChange("tiktok", e.target.value)}
                disabled={!isEditing}
                placeholder="@username"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">YouTube</Label>
              <Input
                value={socialLinks.youtube || ""}
                onChange={(e) => handleSocialChange("youtube", e.target.value)}
                disabled={!isEditing}
                placeholder="URL canale"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">X (Twitter)</Label>
              <Input
                value={socialLinks.x || ""}
                onChange={(e) => handleSocialChange("x", e.target.value)}
                disabled={!isEditing}
                placeholder="@username"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
