import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  token: z.string().min(16).max(128),
  roleTalentId: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { token, roleTalentId } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Validate token + status='shared'
    const { data: round, error: roundErr } = await supabase
      .from("casting_rounds")
      .select("id")
      .eq("share_token", token)
      .eq("status", "shared")
      .maybeSingle();

    if (roundErr || !round) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch pdf_path for this round + role_talent
    const { data: crt, error: crtErr } = await supabase
      .from("casting_round_talents")
      .select("pdf_path")
      .eq("round_id", round.id)
      .eq("role_talent_id", roleTalentId)
      .maybeSingle();

    if (crtErr || !crt?.pdf_path) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signErr } = await supabase
      .storage
      .from("casting-pdfs")
      .createSignedUrl(crt.pdf_path, 300);

    if (signErr || !signed?.signedUrl) {
      return new Response(JSON.stringify({ error: "Sign failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: signed.signedUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
