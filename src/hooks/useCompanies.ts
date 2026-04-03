import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CompanyWithStats = Tables<"companies"> & {
  castings_count: number;
  confirmed_talents_count: number;
  last_casting_date: string | null;
};

type CompanyInsert = {
  name: string;
  type?: string;
  location?: string;
  email?: string;
  website?: string;
  vat_number?: string;
  notes?: string;
  status?: string;
  contacts_json?: any;
};

// ─── List with derived stats ────────────────────────────────────────────
export const useCompaniesWithStats = (filters?: {
  search?: string;
  type?: string;
  sort?: string;
}) => {
  return useQuery({
    queryKey: ["companies-with-stats", filters],
    queryFn: async () => {
      // Fetch companies
      let q = supabase.from("companies").select("*").order("name");
      if (filters?.search) q = q.ilike("name", `%${filters.search}%`);
      if (filters?.type && filters.type !== "all") q = q.eq("type", filters.type);

      const { data: companies, error } = await q;
      if (error) throw error;

      // Fetch casting counts per company
      const { data: castings } = await supabase
        .from("castings")
        .select("id, company_id, created_at");

      // Fetch confirmed talents
      const { data: roleTalents } = await supabase
        .from("role_talents")
        .select("profile_id, casting_role_id")
        .eq("company_status", "confirmed");

      const { data: castingRoles } = await supabase
        .from("casting_roles")
        .select("id, casting_id");

      // Build lookup maps
      const castingsByCompany: Record<string, typeof castings> = {};
      castings?.forEach((c) => {
        if (!c.company_id) return;
        if (!castingsByCompany[c.company_id]) castingsByCompany[c.company_id] = [];
        castingsByCompany[c.company_id]!.push(c);
      });

      const roleToCasting: Record<string, string> = {};
      castingRoles?.forEach((r) => {
        roleToCasting[r.id] = r.casting_id;
      });

      const talentsByCompany: Record<string, Set<string>> = {};
      roleTalents?.forEach((rt) => {
        const castingId = roleToCasting[rt.casting_role_id];
        if (!castingId) return;
        const casting = castings?.find((c) => c.id === castingId);
        if (!casting?.company_id) return;
        if (!talentsByCompany[casting.company_id]) talentsByCompany[casting.company_id] = new Set();
        talentsByCompany[casting.company_id].add(rt.profile_id);
      });

      const result: CompanyWithStats[] = (companies || []).map((company) => {
        const companyCastings = castingsByCompany[company.id] || [];
        const lastDate = companyCastings.length
          ? companyCastings.sort((a, b) => b.created_at.localeCompare(a.created_at))[0].created_at
          : null;
        return {
          ...company,
          castings_count: companyCastings.length,
          confirmed_talents_count: talentsByCompany[company.id]?.size || 0,
          last_casting_date: lastDate,
        };
      });

      // Sort
      if (filters?.sort === "castings") {
        result.sort((a, b) => b.castings_count - a.castings_count);
      } else if (filters?.sort === "last_contact") {
        result.sort((a, b) => (b.last_casting_date || "").localeCompare(a.last_casting_date || ""));
      }
      // default is name, already sorted

      return result;
    },
  });
};

// ─── Single company ─────────────────────────────────────────────────────
export const useCompany = (id: string | undefined) => {
  return useQuery({
    queryKey: ["company", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

// ─── Castings for a company ─────────────────────────────────────────────
export const useCompanyCastings = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["company-castings", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("castings")
        .select(`*, casting_roles(id)`)
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

// ─── Confirmed talents for a company ────────────────────────────────────
export const useCompanyConfirmedTalents = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["company-confirmed-talents", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      // Get casting ids for this company
      const { data: castings } = await supabase
        .from("castings")
        .select("id")
        .eq("company_id", companyId!);

      if (!castings?.length) return [];

      const castingIds = castings.map((c) => c.id);

      // Get roles for these castings
      const { data: roles } = await supabase
        .from("casting_roles")
        .select("id")
        .in("casting_id", castingIds);

      if (!roles?.length) return [];

      const roleIds = roles.map((r) => r.id);

      // Get confirmed talents
      const { data: roleTalents } = await supabase
        .from("role_talents")
        .select("profile_id")
        .in("casting_role_id", roleIds)
        .eq("company_status", "confirmed");

      if (!roleTalents?.length) return [];

      // Unique profile ids
      const uniqueProfileIds = [...new Set(roleTalents.map((rt) => rt.profile_id))];

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, profile_photo_url")
        .in("id", uniqueProfileIds);

      return profiles || [];
    },
  });
};

// ─── Company notes ──────────────────────────────────────────────────────
export const useCompanyNotes = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["company-notes", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_notes")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateCompanyNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ company_id, body }: { company_id: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("company_notes")
        .insert({ company_id, body, created_by_user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["company-notes", vars.company_id] });
    },
  });
};

// ─── CRUD ───────────────────────────────────────────────────────────────
export const useCreateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (company: CompanyInsert) => {
      const { data, error } = await supabase
        .from("companies")
        .insert(company)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies-with-stats"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useUpdateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"companies"> & { id: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["companies-with-stats"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["company", data.id] });
    },
  });
};

export const useDeleteCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies-with-stats"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

// ─── Company types (sectors) ────────────────────────────────────────────
export const COMPANY_TYPES = [
  { value: "brand", label: "Brand" },
  { value: "production", label: "Produzione" },
  { value: "agency", label: "Agenzia" },
  { value: "fashion", label: "Moda" },
  { value: "entertainment", label: "Intrattenimento" },
  { value: "advertising", label: "Pubblicità" },
  { value: "events", label: "Eventi" },
  { value: "other", label: "Altro" },
];
