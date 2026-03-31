 import { useProfile } from "./useProfile";
 import { useTalentAttributes } from "./useTalentAttributes";
 import { useTalentMedia } from "./useTalentMedia";
 import { useMemo } from "react";
 
 interface CompletionCheck {
   key: string;
   label: string;
   anchor: string;
   weight: number;
   isComplete: boolean;
 }
 
 interface CompletionLevel {
   min: number;
   max: number;
   emoji: string;
   message: string;
 }
 
export interface ProfileCompletionResult {
    percentage: number;
    score: number;
    maxScore: number;
    emoji: string;
    message: string;
    missingSections: Array<{
      key: string;
      label: string;
      anchor: string;
    }>;
    completedSections: Array<{
      key: string;
      label: string;
      anchor: string;
    }>;
    isLoading: boolean;
  }
 
 const COMPLETION_LEVELS: CompletionLevel[] = [
   { min: 0, max: 19, emoji: "😴", message: "Il tuo profilo sta ancora dormendo... sveglialo!" },
   { min: 20, max: 39, emoji: "😐", message: "Ci stai lavorando, ma c'è ancora strada da fare!" },
   { min: 40, max: 59, emoji: "🙂", message: "Sei sulla buona strada! Continua così." },
   { min: 60, max: 79, emoji: "😊", message: "Ottimo lavoro! Aggiungi ancora qualche dettaglio per brillare." },
   { min: 80, max: 94, emoji: "🤩", message: "Quasi perfetto! Manca pochissimo alla vetta!" },
   { min: 95, max: 100, emoji: "🌟", message: "Profilo da star! Sei pronto per essere scoperto!" },
 ];
 
 export const useProfileCompletion = (): ProfileCompletionResult => {
   const { data: profile, isLoading: profileLoading } = useProfile();
   const { data: attributes, isLoading: attributesLoading } = useTalentAttributes();
   const { data: media, isLoading: mediaLoading } = useTalentMedia();
 
   const result = useMemo(() => {
     const checks: CompletionCheck[] = [
       {
         key: "photo",
         label: "Foto profilo",
         anchor: "profile-photo",
         weight: 15,
         isComplete: !!profile?.profile_photo_url,
       },
       {
         key: "name",
         label: "Nome completo",
         anchor: "basic-info",
         weight: 10,
         isComplete: !!(profile?.first_name && profile?.last_name),
       },
       {
         key: "bio",
         label: "Biografia",
         anchor: "about-me",
         weight: 10,
         isComplete: !!(profile?.bio && profile.bio.length >= 50),
       },
       {
         key: "roles",
         label: "Ruoli",
         anchor: "talent-roles",
         weight: 10,
         isComplete: !!(profile?.talent_categories && profile.talent_categories.length > 0),
       },
       {
         key: "heightWeight",
         label: "Altezza/Peso",
         anchor: "measurements",
         weight: 5,
         isComplete: !!(attributes?.height || attributes?.weight),
       },
       {
         key: "measurements",
         label: "Misure",
         anchor: "measurements",
         weight: 10,
         isComplete: (() => {
           const measures = [
             attributes?.chest,
             attributes?.waist,
             attributes?.hips,
             attributes?.shoulder_width,
             attributes?.neck_size,
           ].filter(Boolean);
           return measures.length >= 3;
         })(),
       },
       {
         key: "hairEye",
         label: "Capelli/Occhi",
         anchor: "physical-features",
         weight: 5,
         isComplete: !!(attributes?.hair_color && attributes?.eye_color),
       },
       {
         key: "languages",
         label: "Lingue",
         anchor: "languages",
         weight: 5,
         isComplete: !!(attributes?.languages && attributes.languages.length > 0),
       },
       {
         key: "skills",
         label: "Competenze",
         anchor: "skills",
         weight: 5,
         isComplete: !!(attributes?.skills && attributes.skills.length > 0),
       },
       {
         key: "media",
         label: "Galleria Media",
         anchor: "media-gallery",
         weight: 15,
         isComplete: !!(media && media.length >= 3),
       },
       {
         key: "contact",
         label: "Contatti",
         anchor: "contact-info",
         weight: 5,
         isComplete: !!(profile?.phone_number || profile?.whatsapp_number),
       },
       {
         key: "address",
         label: "Indirizzo",
         anchor: "address",
         weight: 5,
         isComplete: !!(profile?.city && profile?.country),
       },
     ];
 
     const maxScore = checks.reduce((sum, check) => sum + check.weight, 0);
     const score = checks
       .filter((check) => check.isComplete)
       .reduce((sum, check) => sum + check.weight, 0);
     const percentage = Math.round((score / maxScore) * 100);
 
     const level = COMPLETION_LEVELS.find(
       (l) => percentage >= l.min && percentage <= l.max
     ) || COMPLETION_LEVELS[0];
 
     const missingSections = checks
       .filter((check) => !check.isComplete)
       .map(({ key, label, anchor }) => ({ key, label, anchor }));
 
     return {
       percentage,
       score,
       maxScore,
       emoji: level.emoji,
       message: level.message,
       missingSections,
     };
   }, [profile, attributes, media]);
 
   return {
     ...result,
     isLoading: profileLoading || attributesLoading || mediaLoading,
   };
 };