import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')!

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401, headers: cors })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', ''),
  )
  if (authError || !user) return new Response('Unauthorized', { status: 401, headers: cors })

  const { plan, tracker } = await req.json()
  const amount = plan === '3trackers' ? 59999 : 29999
  const orderId = `novo-${user.id.slice(0, 8)}-${Date.now()}`
  const itemName = plan === '3trackers' ? 'Novo – All 3 Trackers' : `Novo – ${tracker} Tracker`

  const midtransResp = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(MIDTRANS_SERVER_KEY + ':')}`,
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: { email: user.email },
      item_details: [{ id: plan, price: amount, quantity: 1, name: itemName }],
    }),
  })

  const midtransData = await midtransResp.json()

  if (!midtransData.token) {
    return new Response(JSON.stringify({ error: 'Midtrans error', detail: midtransData }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  await supabase.from('payments').insert({
    order_id: orderId,
    user_id: user.id,
    plan,
    tracker: tracker ?? null,
    amount,
    status: 'pending',
  })

  return new Response(JSON.stringify({ token: midtransData.token, orderId }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
