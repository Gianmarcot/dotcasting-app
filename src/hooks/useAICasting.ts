import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { TalentWithAttributes } from "./useTalents";
import { matchTalentsWithCriteria } from "./useTargetMatching";
import type { TargetCriteria } from "./useTargets";

export interface AICastingRole {
  name: string;
  description: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  budget: number | null;
  location: string | null;
  height_min: number | null;
  height_max: number | null;
  hair_color: string | null;
  body_type: string | null;
  skills: string[];
}

export interface AICastingResult {
  title: string;
  client: string | null;
  location: string | null;
  dates: string | null;
  notes: string | null;
  roles: AICastingRole[];
}

export const useAICasting = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const generateCasting = async (prompt: string): Promise<AICastingResult | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-casting", {
        body: { prompt },
      });

      if (error) throw new Error(error.message || "Errore nella generazione");
      if (data?.error) throw new Error(data.error);
      if (!data?.casting) throw new Error("Risposta AI non valida");

      return data.casting as AICastingResult;
    } catch (err: any) {
      toast({
        title: "Errore generazione AI",
        description: err.message || "Impossibile generare il casting",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const createCastingFromAI = async (result: AICastingResult) => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      // Find or skip company
      let companyId: string | null = null;
      if (result.client) {
        const { data: companies } = await supabase
          .from("companies")
          .select("id")
          .ilike("name", `%${result.client}%`)
          .limit(1);
        companyId = companies?.[0]?.id || null;
      }

      // Parse locations
      const locations = result.location ? [result.location] : null;

      // Create casting
      const { data: casting, error: castingError } = await supabase
        .from("castings")
        .insert({
          title: result.title,
          description: result.notes || null,
          company_id: companyId,
          locations,
          status: "draft",
          created_by_user_id: user.id,
        })
        .select()
        .single();

      if (castingError) throw castingError;

      // Create roles
      const roleInserts = result.roles.map((role) => ({
        casting_id: casting.id,
        name: role.name,
        description: role.description || null,
        gender: role.gender || null,
        age_min: role.age_min || null,
        age_max: role.age_max || null,
        budget: role.budget || null,
        location: role.location || null,
        required_skills: role.skills?.length ? role.skills : [],
        phase: "talent_search",
      }));

      const { data: createdRoles, error: rolesError } = await supabase
        .from("casting_roles")
        .insert(roleInserts)
        .select();

      if (rolesError) throw rolesError;

      // Auto-match talents for each role
      if (createdRoles?.length) {
        await autoMatchTalentsForRoles(createdRoles, result.roles, user.id);
      }

      queryClient.invalidateQueries({ queryKey: ["owner-castings"] });

      toast({
        title: "Casting creato con AI",
        description: `"${result.title}" con ${createdRoles?.length || 0} ruoli`,
      });

      return casting;
    } catch (err: any) {
      toast({
        title: "Errore creazione",
        description: err.message || "Impossibile creare il casting",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    generateCasting,
    createCastingFromAI,
    isGenerating,
    isCreating,
    isProcessing: isGenerating || isCreating,
  };
};

async function autoMatchTalentsForRoles(
  createdRoles: any[],
  aiRoles: AICastingRole[],
  userId: string
) {
  // Fetch all talents with attributes
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, talent_attributes(*)");

  if (!profiles?.length) return;

  const talents: TalentWithAttributes[] = profiles.map((p: any) => ({
    ...p,
    attributes: p.talent_attributes?.[0] || null,
  }));

  for (let i = 0; i < createdRoles.length; i++) {
    const dbRole = createdRoles[i];
    const aiRole = aiRoles[i];
    if (!aiRole) continue;

    // Build criteria from AI role
    const criteria: TargetCriteria = {};
    if (aiRole.gender) criteria.gender = [aiRole.gender];
    if (aiRole.age_min != null) criteria.age_min = aiRole.age_min;
    if (aiRole.age_max != null) criteria.age_max = aiRole.age_max;
    if (aiRole.height_min != null) criteria.height_min = aiRole.height_min;
    if (aiRole.height_max != null) criteria.height_max = aiRole.height_max;
    if (aiRole.hair_color) criteria.hair_colors = [aiRole.hair_color];
    if (aiRole.skills?.length) criteria.skills = aiRole.skills;
    if (aiRole.location) criteria.cities = [aiRole.location];

    // Only match if there are criteria
    if (Object.keys(criteria).length === 0) continue;

    const matches = matchTalentsWithCriteria(talents, criteria);
    const topMatches = matches.slice(0, 10); // Top 10

    if (topMatches.length === 0) continue;

    const roleTalentInserts = topMatches.map((m) => ({
      casting_role_id: dbRole.id,
      profile_id: m.talent.id,
      status: "shortlisted",
      added_by_user_id: userId,
      talent_status: "none",
      company_status: "none",
    }));

    await supabase.from("role_talents").insert(roleTalentInserts);
  }
}
