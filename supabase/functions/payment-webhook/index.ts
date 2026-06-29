import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')!

  const body = await req.json()
  const { order_id, transaction_status, fraud_status, signature_key, gross_amount, status_code } = body

  // Verify Midtrans signature: SHA512(order_id + status_code + gross_amount + server_key)
  const raw = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`
  const hash = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(raw))
  const expected = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  if (expected !== signature_key) {
    return new Response('Invalid signature', { status: 403 })
  }

  const paid =
    (transaction_status === 'capture' && fraud_status === 'accept') ||
    transaction_status === 'settlement'

  if (paid) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', order_id)
      .single()

    if (payment && payment.status !== 'paid') {
      const toUnlock: string[] =
        payment.plan === '3trackers'
          ? ['financial', 'todo', 'habit']
          : [payment.tracker]

      const { data: profile } = await supabase
        .from('profiles')
        .select('owned_templates')
        .eq('id', payment.user_id)
        .single()

      const current: string[] = profile?.owned_templates ?? []
      const updated = [...new Set([...current, ...toUnlock])]

      await Promise.all([
        supabase.from('profiles').update({ owned_templates: updated }).eq('id', payment.user_id),
        supabase.from('payments').update({ status: 'paid' }).eq('order_id', order_id),
      ])
    }
  }

  return new Response('OK')
})
