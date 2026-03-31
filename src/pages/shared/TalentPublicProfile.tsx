import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Ruler, Scale, Eye, Palette, Scissors, Languages, Sparkles, Briefcase, Home, Plane, FileText, ImageIcon, User, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useProfileById } from "@/hooks/useProfileById";
import { useTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { useTalentMediaByProfileId } from "@/hooks/useTalentMediaByProfileId";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { MediaLightbox } from "@/components/profile/MediaLightbox";

const calculateAge = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const genderLabels: Record<string, string> = {
  male: "Uomo",
  female: "Donna",
  non_binary: "Non binario",
  other: "Altro",
};

const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium">{value}</span>
    </div>
  );
};

const TalentPublicProfile = () => {
  const { profileId: urlProfileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { data: ownProfile } = useProfile();

  // If no URL profileId, use logged-in user's profile (talent preview)
  const profileId = urlProfileId || ownProfile?.id || null;

  const { data: profile, isLoading: profileLoading } = useProfileById(profileId);
  const { data: attributes, isLoading: attrLoading } = useTalentAttributesByProfileId(profileId);
  const { data: media, isLoading: mediaLoading } = useTalentMediaByProfileId(profileId);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isLoading = profileLoading || attrLoading;

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
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Torna indietro
        </Button>
      </div>
    );
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Senza nome";
  const initials = [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join("") || "?";
  const age = calculateAge(profile.birth_date);
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const birthPlace = [profile.birth_city, profile.birth_province, profile.birth_region, profile.birth_country].filter(Boolean).join(", ");

  const residenceAddress = profile.residence_address as Record<string, string> | null;
  const domicileAddress = profile.domicile_address as Record<string, string> | null;
  const socialLinks = profile.social_links as Record<string, string> | null;
  const travelAvailability = profile.travel_availability as Record<string, unknown> | null;
  const visas = profile.visas as Array<Record<string, string>> | null;

  const photoMedia = media?.filter(m => m.media_type === "image") || [];
  const videoMedia = media?.filter(m => m.media_type === "video") || [];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Indietro
      </Button>

      {/* Hero Section */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-40 w-40 sm:h-48 sm:w-48 rounded-xl flex-shrink-0">
              <AvatarImage
                src={profile.profile_photo_url || undefined}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-foreground text-4xl rounded-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-foreground">{fullName}</h1>
                {profile.stage_name && (
                  <p className="text-lg text-muted-foreground italic">"{profile.stage_name}"</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {age && <span>{age} anni</span>}
                {age && profile.gender && <span>·</span>}
                {profile.gender && <span>{genderLabels[profile.gender] || profile.gender}</span>}
                {(age || profile.gender) && location && <span>·</span>}
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                )}
              </div>
              {profile.talent_categories && profile.talent_categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.talent_categories.map((cat) => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                {profile.phone_number && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {profile.phone_prefix ? `${profile.phone_prefix} ` : ""}{profile.phone_number}
                  </span>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <Globe className="h-3.5 w-3.5" />
                    Sito web
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Me */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Chi sono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-line">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Media Gallery */}
          {media && media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Media Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {media.map((item, index) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                      onClick={() => setLightboxIndex(index)}
                    >
                      {item.media_type === "video" ? (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title || "Media"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Physical Appearance */}
          {attributes && (attributes.hair_color || attributes.eye_color || attributes.hair_length || attributes.hair_type || attributes.has_freckles || attributes.has_tattoos || attributes.has_piercings || attributes.has_diastema) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aspetto Fisico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow label="Colore capelli" value={attributes.hair_color} />
                <InfoRow label="Tipo capelli" value={attributes.hair_type} />
                <InfoRow label="Lunghezza capelli" value={attributes.hair_length} />
                <InfoRow label="Colore occhi" value={attributes.eye_color} />
                {(attributes.has_freckles || attributes.has_tattoos || attributes.has_piercings || attributes.has_diastema) && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {attributes.has_freckles && <Badge variant="outline">Lentiggini</Badge>}
                    {attributes.has_tattoos && <Badge variant="outline">Tatuaggi</Badge>}
                    {attributes.has_piercings && <Badge variant="outline">Piercing</Badge>}
                    {attributes.has_diastema && <Badge variant="outline">Diastema</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Measurements */}
          {attributes && (attributes.height || attributes.weight || attributes.chest || attributes.waist || attributes.hips || attributes.shoulder_width || attributes.neck_size || attributes.shoe_size || attributes.jacket_size || attributes.pants_size) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Misure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow label="Altezza" value={attributes.height ? `${attributes.height} cm` : null} />
                <InfoRow label="Peso" value={attributes.weight ? `${attributes.weight} kg` : null} />
                <InfoRow label="Petto" value={attributes.chest ? `${attributes.chest} cm` : null} />
                <InfoRow label="Vita" value={attributes.waist ? `${attributes.waist} cm` : null} />
                <InfoRow label="Fianchi" value={attributes.hips ? `${attributes.hips} cm` : null} />
                <InfoRow label="Spalle" value={attributes.shoulder_width ? `${attributes.shoulder_width} cm` : null} />
                <InfoRow label="Collo" value={attributes.neck_size ? `${attributes.neck_size} cm` : null} />
                <InfoRow label="Scarpe" value={attributes.shoe_size} />
                <InfoRow label="Giacca" value={attributes.jacket_size} />
                <InfoRow label="Pantaloni" value={attributes.pants_size} />
              </CardContent>
            </Card>
          )}

          {/* Skills & Abilities */}
          {attributes && ((attributes.skills && attributes.skills.length > 0) || (attributes.abilities && attributes.abilities.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Competenze e Abilità
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {attributes.skills && attributes.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Competenze</p>
                    <div className="flex flex-wrap gap-1.5">
                      {attributes.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {attributes.abilities && attributes.abilities.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Abilità</p>
                    <div className="flex flex-wrap gap-1.5">
                      {attributes.abilities.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {attributes?.languages && attributes.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Lingue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {attributes.languages.map((l) => <Badge key={l} variant="secondary">{l}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {(profile.driving_licenses?.length || profile.fiscal_code || profile.id_document_url || profile.has_passport || profile.has_vat_number) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documenti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow label="Codice Fiscale" value={profile.fiscal_code} />
                <InfoRow label="P.IVA" value={profile.has_vat_number ? profile.vat_number || "Sì" : null} />
                <InfoRow label="Passaporto" value={profile.has_passport ? (profile.passport_expiry ? `Sì (scade: ${profile.passport_expiry})` : "Sì") : null} />
                {profile.driving_licenses && profile.driving_licenses.length > 0 && (
                  <div className="py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">Patenti</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.driving_licenses.map((l) => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <InfoRow label="Telefono" value={profile.phone_number ? `${profile.phone_prefix || ""} ${profile.phone_number}`.trim() : null} />
              <InfoRow label="WhatsApp" value={profile.whatsapp_number ? `${profile.whatsapp_prefix || ""} ${profile.whatsapp_number}`.trim() : null} />
              <InfoRow label="Sito web" value={profile.website_url} />
              {socialLinks && Object.entries(socialLinks).filter(([, v]) => v).length > 0 && (
                <div className="py-2">
                  <span className="text-sm text-muted-foreground">Social</span>
                  <div className="space-y-1 mt-1">
                    {Object.entries(socialLinks).filter(([, v]) => v).map(([key, url]) => (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="dc-link-action truncate">
                        {key}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Info */}
          {(profile.main_occupation || profile.representation_type || profile.work_cities?.length) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Lavoro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow label="Occupazione" value={profile.main_occupation} />
                <InfoRow label="Rappresentanza" value={profile.representation_type} />
                {profile.work_cities && profile.work_cities.length > 0 && (
                  <div className="py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">Città di lavoro</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.work_cities.map((c) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Residence */}
          {(residenceAddress || domicileAddress || profile.postal_code) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Residenza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {residenceAddress && (
                  <InfoRow label="Residenza" value={[residenceAddress.street, residenceAddress.city, residenceAddress.province, residenceAddress.country].filter(Boolean).join(", ")} />
                )}
                {domicileAddress && (
                  <InfoRow label="Domicilio" value={[domicileAddress.street, domicileAddress.city, domicileAddress.province, domicileAddress.country].filter(Boolean).join(", ")} />
                )}
                <InfoRow label="CAP" value={profile.postal_code} />
              </CardContent>
            </Card>
          )}

          {/* Travel */}
          {(travelAvailability || visas?.length || profile.has_passport) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Disponibilità Viaggi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow label="Passaporto" value={profile.has_passport ? "Sì" : "No"} />
                {profile.passport_expiry && <InfoRow label="Scadenza passaporto" value={profile.passport_expiry} />}
                <InfoRow label="Figli minori" value={profile.has_minor_children ? "Sì" : profile.has_minor_children === false ? "No" : null} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && media && (
        <MediaLightbox
          media={media}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          isOwnerView={false}
          ratingsMap={new Map()}
        />
      )}
    </div>
  );
};

export default TalentPublicProfile;
