import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = await req.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");

    if (!token || token.length < 16) {
      return new Response(JSON.stringify({ error: "Token non valido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (password.length < 8) {
      return new Response(JSON.stringify({ error: "La password deve avere almeno 8 caratteri" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: inv, error: invErr } = await admin
      .from("team_invitations")
      .select("id, email, role, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (invErr || !inv) {
      return new Response(JSON.stringify({ error: "Invito non trovato" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (inv.status !== "pending") {
      return new Response(JSON.stringify({ error: "Invito non più valido" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(inv.expires_at).getTime() < Date.now()) {
      await admin.from("team_invitations").update({ status: "expired" }).eq("id", inv.id);
      return new Response(JSON.stringify({ error: "Invito scaduto" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: inv.email,
      password,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? "Errore creazione utente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // handle_new_user trigger inserts default 'talent' role — replace it
    await admin.from("user_roles").delete().eq("user_id", created.user.id);
    await admin.from("user_roles").insert({ user_id: created.user.id, role: inv.role });

    await admin
      .from("team_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", inv.id);

    return new Response(JSON.stringify({ ok: true, email: inv.email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Errore" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
