import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { it } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export const TalentProfile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    ethnicity: "",
    birthDate: "",
    city: "",
    country: "Italia",
    bio: "",
  });

  // Populate form with profile data when loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        gender: profile.gender || "",
        ethnicity: profile.ethnicity || "",
        birthDate: profile.birth_date || "",
        city: profile.city || "",
        country: profile.country || "Italia",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const avatarInitial = profile?.first_name?.charAt(0).toUpperCase() 
    || user?.email?.charAt(0).toUpperCase() 
    || "U";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {it.profile.edit} Profilo
          </h1>
          <p className="text-muted-foreground mt-1">
            Completa il tuo profilo per aumentare le tue possibilità
          </p>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? it.profile.save : it.profile.edit}
        </Button>
      </div>

      {/* Profile photo */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profile_photo_url || ""} />
                <AvatarFallback className="text-2xl bg-muted">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{it.profile.photo}</h3>
              <p className="text-sm text-muted-foreground">
                Carica una foto professionale. Formato: JPG, PNG. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Informazioni personali</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{it.profile.firstName}</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{it.profile.lastName}</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">{it.profile.gender}</Label>
              <Input
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ethnicity">{it.profile.ethnicity}</Label>
              <Input
                id="ethnicity"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">{it.profile.birthDate}</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{it.profile.city}</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{it.profile.country}</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{it.profile.bio}</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              placeholder="Racconta qualcosa di te..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Physical attributes */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{it.profile.attributes}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">{it.profile.height} (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">{it.profile.weight} (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hairColor">{it.profile.hairColor}</Label>
              <Input
                id="hairColor"
                name="hairColor"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eyeColor">{it.profile.eyeColor}</Label>
              <Input
                id="eyeColor"
                name="eyeColor"
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentProfile;
