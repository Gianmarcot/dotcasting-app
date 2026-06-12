import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller auth
    const authHeader = req.headers.get("Authorization");
    console.log("create-talent: authHeader present?", !!authHeader);
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorizzato: header mancante" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    console.log("create-talent: env present?", { url: !!supabaseUrl, srv: !!serviceRoleKey, anon: !!anonKey });

    // Client with caller's JWT to check role
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    const caller = userData?.user;
    console.log("create-talent: getUser result", { hasCaller: !!caller, err: userErr?.message });
    if (!caller) {
      return new Response(JSON.stringify({ error: "Non autorizzato: utente non trovato", detail: userErr?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is owner or admin
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isOwnerOrAdmin = roles?.some(
      (r: { role: string }) => r.role === "owner" || r.role === "admin"
    );
    if (!isOwnerOrAdmin) {
      return new Response(
        JSON.stringify({ error: "Solo gli Owner possono creare talent" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse body
    const { email, first_name, last_name, gender, city, country } =
      await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email è obbligatoria" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate temporary password
    const tempPassword =
      crypto.randomUUID().slice(0, 8) +
      "!" +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    // Create user via Admin API
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

    if (createError) {
      const message =
        createError.message === "A user with this email address has already been registered"
          ? "Un utente con questa email esiste già"
          : createError.message;
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile with provided data (trigger handle_new_user already created profile + role)
    const updateData: Record<string, string | null> = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (gender) updateData.gender = gender;
    if (city) updateData.city = city;
    if (country) updateData.country = country;

    if (Object.keys(updateData).length > 0) {
      await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("user_id", newUser.user.id);
    }

    // Fetch profile_id (created by handle_new_user trigger)
    const { data: profileRow } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", newUser.user.id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        email: newUser.user.email,
        profile_id: profileRow?.id ?? null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("create-talent error:", err);
    return new Response(
      JSON.stringify({ error: "Errore interno del server" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
