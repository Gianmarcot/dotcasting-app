import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TalentWithAttributes } from "./useTalents";
import type { CastingRound } from "./useCastingRounds";

export interface RoundTalentRow {
  roleTalentId: string;
  pdfPath: string | null;
  generatedAt: string | null;
  talentStatus: string | null;
  companyStatus: string | null;
  talent: TalentWithAttributes;
  // counts
  photosCount: number;
  videosCount: number;
}

export interface RoundDetail {
  round: CastingRound;
  talents: RoundTalentRow[];
}

export const useRoundDetail = (roundId: string | undefined) =>
  useQuery({
    queryKey: ["round", roundId],
    enabled: !!roundId,
    queryFn: async (): Promise<RoundDetail> => {
      const { data: round, error: e1 } = await supabase
        .from("casting_rounds")
        .select("*")
        .eq("id", roundId!)
        .single();
      if (e1) throw e1;

      const { data: rows, error: e2 } = await supabase
        .from("casting_round_talents")
        .select(`
          round_id, role_talent_id, pdf_path, generated_at,
          role_talent:role_talents!casting_round_talents_role_talent_id_fkey(
            id, talent_status, company_status,
            profile:profiles!role_talents_profile_id_fkey(
              id, user_id, first_name, last_name, stage_name,
              city, country, gender, birth_date, profile_photo_url,
              talent_categories, bio, nationality, ethnicity,
              gender_identity, representation_type, has_vat_number,
              talent_attributes(
                height, weight, hair_color, hair_length, eye_color,
                skills, languages, chest, hips, shirt_size, shoe_size
              ),
              talent_media(id, media_type)
            )
          )
        `)
        .eq("round_id", roundId!);
      if (e2) throw e2;

      const talents: RoundTalentRow[] = ((rows ?? []) as any[])
        .filter((r) => r.role_talent?.profile)
        .map((r) => {
          const p = r.role_talent.profile;
          const media = (p.talent_media ?? []) as { media_type: string }[];
          const photos = media.filter((m) => m.media_type === "photo").length;
          const videos = media.filter((m) => m.media_type === "video").length;
          const talent: TalentWithAttributes = {
            id: p.id,
            user_id: p.user_id,
            first_name: p.first_name,
            last_name: p.last_name,
            stage_name: p.stage_name,
            city: p.city,
            country: p.country,
            gender: p.gender,
            birth_date: p.birth_date,
            profile_photo_url: p.profile_photo_url,
            talent_categories: p.talent_categories,
            bio: p.bio,
            nationality: p.nationality,
            ethnicity: p.ethnicity,
            gender_identity: p.gender_identity,
            representation_type: p.representation_type,
            has_vat_number: p.has_vat_number,
            attributes: p.talent_attributes?.[0] ?? null,
          };
          return {
            roleTalentId: r.role_talent_id,
            pdfPath: r.pdf_path,
            generatedAt: r.generated_at,
            talentStatus: r.role_talent.talent_status,
            companyStatus: r.role_talent.company_status,
            talent,
            photosCount: photos,
            videosCount: videos,
          };
        });

      return {
        round: round as unknown as CastingRound,
        talents,
      };
    },
  });
