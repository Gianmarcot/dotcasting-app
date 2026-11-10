import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BUCKETS = ["talent-documents", "avatars", "talent-media"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "Non autorizzato" });

    const URL = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: authErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !claims?.claims) return json(401, { error: "Non autorizzato" });
    const userId = claims.claims.sub as string;

    const admin = createClient(URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isTalent } = await admin.rpc("has_role", { _user_id: userId, _role: "talent" });
    if (!isTalent) {
      return json(403, { error: "Gli account dello staff vanno rimossi dalla gestione team." });
    }

    // Rimuove i file privati e i media del talent.
    for (const bucket of BUCKETS) {
      const { data: files } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
      if (files?.length) {
        await admin.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
      }
    }

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw error;
    return json(200, { ok: true });
  } catch (e) {
    console.error("delete-account failed", e);
    return json(500, { error: "Non è stato possibile eliminare l'account. Riprova più tardi." });
  }
});
