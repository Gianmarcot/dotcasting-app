import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapToTalent } from "@/lib/casting/fetchRoundTalents";
import { resolveCard, RoundPreset } from "@/lib/casting/roundPreset";
import { TalentCardWeb } from "@/lib/casting/TalentCardWeb";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
const logo = "/logo.png";

interface RpcTalentRow {
  role_talent_id: string;
  pdf_path: string | null;
  profile: Record<string, unknown>;
  attributes: Record<string, unknown> | null;
  media: Array<{ url: string; sort_order: number; media_type: string; category: string | null }>;
}

interface BrandingPayload {
  agency_name?: string | null;
  agency_logo_url?: string | null;
  contact_email?: string | null;
}

interface SharedRoundPayload {
  round?: { id: string; label: string; field_preset: RoundPreset; shared_at: string };
  casting?: { title: string };
  role?: { name: string };
  branding?: BrandingPayload;
  talents?: RpcTalentRow[];
}

const Unavailable = () => (
  <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center px-6 text-center">
    <img src={logo} alt="dotCasting" className="h-10 mb-8 opacity-80" />
    <h1 className="font-tenor uppercase tracking-wide text-2xl text-[#333333] mb-2">
      Link non disponibile
    </h1>
    <p className="font-dm text-[#666] max-w-sm">
      Il link non è più attivo oppure non è valido.
    </p>
  </div>
);

const TalentBlock = ({
  row,
  preset,
  token,
  branding,
}: {
  row: RpcTalentRow;
  preset: RoundPreset;
  token: string;
  branding?: BrandingPayload;
}) => {
  const talent = mapToTalent({
    ...row.profile,
    attributes: row.attributes ? [row.attributes] : null,
    media: row.media ?? [],
  } as unknown as Parameters<typeof mapToTalent>[0]);

  const card = resolveCard(talent, preset, {
    agencyName: branding?.agency_name ?? null,
    agencyLogoUrl: branding?.agency_logo_url ?? null,
    agencyContactEmail: branding?.contact_email ?? null,
  });

  const dl = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-round-pdf-url", {
        body: { token, roleTalentId: row.role_talent_id },
      });
      if (error || !data?.url) throw new Error("Download non disponibile");
      return data.url as string;
    },
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener");
    },
    onError: () => toast.error("Download non disponibile"),
  });

  return (
    <div className="dc-card p-4 sm:p-6">
      <TalentCardWeb card={card} />
      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => dl.mutate()}
          disabled={!row.pdf_path || dl.isPending}
          className="rounded-full"
        >
          {dl.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Scarica PDF
        </Button>
      </div>
    </div>
  );
};

export default function SharedRound() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-round", token],
    enabled: !!token,
    queryFn: async (): Promise<SharedRoundPayload> => {
      const { data, error } = await supabase.rpc("get_shared_round", { p_token: token! });
      if (error) throw error;
      return (data ?? {}) as SharedRoundPayload;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#666]" />
      </div>
    );
  }

  if (isError || !data?.round || !data.talents) return <Unavailable />;

  const { round, casting, role, talents } = data;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="border-b border-[#E5DDD0] bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center text-center gap-3">
          <img src={logo} alt="dotCasting" className="h-8" />
          <h1 className="font-tenor uppercase tracking-wide text-xl sm:text-2xl text-[#333333]">
            {casting?.title}
            {role?.name ? ` — ${role.name}` : ""}
          </h1>
          {round.label && (
            <p className="font-dm text-sm text-[#666]">{round.label}</p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {talents.length === 0 ? (
          <p className="text-center font-dm text-[#666]">Nessun talent in questo invio.</p>
        ) : (
          talents.map((t) => (
            <TalentBlock key={t.role_talent_id} row={t} preset={round.field_preset} token={token!} />
          ))
        )}
      </main>

      <footer className="py-8 text-center font-dm text-xs text-[#999]">
        dotCasting
      </footer>
    </div>
  );
}
