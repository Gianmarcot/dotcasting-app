import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Risposta identica in tutti i casi: non rivelare mai se l'indirizzo esiste.
const OK = { ok: true }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NOTICE_COOLDOWN_MS = 60 * 60 * 1000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const startedAt = Date.now()
  const settle = async (status = 200) => {
    // Tempi di risposta uniformi tra i tre casi.
    const elapsed = Date.now() - startedAt
    if (elapsed < 900) await new Promise((r) => setTimeout(r, 900 - elapsed))
    return json(OK, status)
  }

  let email = ''
  let password = ''
  let signupMode = 'self'
  let redirectTo = ''

  try {
    const body = await req.json()
    email = String(body?.email ?? '').trim().toLowerCase()
    password = String(body?.password ?? '')
    signupMode = body?.signupMode === 'guardian' ? 'guardian' : 'self'
    redirectTo = String(body?.redirectTo ?? '')
  } catch {
    return json({ error: 'Richiesta non valida' }, 400)
  }

  if (!EMAIL_RE.test(email) || password.length < 8) {
    return json({ error: 'Richiesta non valida' }, 400)
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  })
  const anonClient = createClient(SUPABASE_URL, ANON, {
    auth: { persistSession: false },
  })

  const appBase = (() => {
    try {
      return new URL(redirectTo).origin
    } catch {
      return 'https://app.dotcasting.com'
    }
  })()
  const emailRedirectTo = redirectTo || `${appBase}/email-confermata`

  try {
    const { data: state, error: stateError } = await admin.rpc('auth_email_state', {
      p_email: email,
    })
    if (stateError) throw stateError

    if (state === 'none') {
      await anonClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: { signup_mode: signupMode },
        },
      })
    } else if (state === 'unconfirmed') {
      await anonClient.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo },
      })
    } else {
      // Account già confermato: avvisa il proprietario della casella, max 1 volta all'ora.
      const { data: row } = await admin
        .from('signup_notice_throttle')
        .select('last_sent_at')
        .eq('email', email)
        .maybeSingle()

      const last = row?.last_sent_at ? new Date(row.last_sent_at).getTime() : 0
      if (Date.now() - last > NOTICE_COOLDOWN_MS) {
        const nowIso = new Date().toISOString()
        await admin
          .from('signup_notice_throttle')
          .upsert({ email, last_sent_at: nowIso }, { onConflict: 'email' })

        try {
          await sendTemplateEmail('account-exists', email, {
            templateData: {
              siteName: 'dotCasting',
              loginUrl: `${appBase}/auth`,
              resetUrl: `${appBase}/auth`,
            },
            idempotencyKey: `account-exists-${email}-${nowIso.slice(0, 13)}`,
          })
        } catch (err) {
          console.error('account-exists email failed', err)
        }
      }
    }
  } catch (err) {
    console.error('signup-request error', err)
  }

  return await settle()
})
