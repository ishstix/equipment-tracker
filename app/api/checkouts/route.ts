import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendCheckoutEmail } from '@/lib/email';

function isAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${process.env.ADMIN_SECRET}`;
}

// GET /api/checkouts — admin only, returns all requests with items + equipment
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: requests, error: reqError } = await supabase
    .from('checkout_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (reqError) return NextResponse.json({ error: reqError.message }, { status: 500 });

  // Fetch items with equipment for each request
  const enriched = await Promise.all(
    (requests ?? []).map(async (req) => {
      const { data: items } = await supabase
        .from('checkout_items')
        .select('*, equipment(*)')
        .eq('request_id', req.id);
      return { ...req, items: items ?? [] };
    })
  );

  return NextResponse.json(enriched);
}

// POST /api/checkouts — public, submit a checkout request
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { requester_name, requester_email, pickup_date, due_date, notes, items } = body;

  if (!requester_name || !requester_email || !pickup_date || !due_date || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Validate availability for each item
  for (const item of items) {
    const { data: eq } = await supabase
      .from('equipment')
      .select('available_quantity, condition, name')
      .eq('id', item.equipment_id)
      .single();

    if (!eq) return NextResponse.json({ error: `Equipment not found` }, { status: 400 });
    if (eq.condition === 'out_of_commission') {
      return NextResponse.json({ error: `${eq.name} is out of service` }, { status: 400 });
    }
    if (eq.available_quantity < item.quantity) {
      return NextResponse.json({ error: `Not enough ${eq.name} available` }, { status: 400 });
    }
  }

  // Create the checkout request
  const { data: request, error: reqError } = await supabase
    .from('checkout_requests')
    .insert({
      requester_name,
      requester_email,
      checkout_date: pickup_date,
      due_date,
      notes: notes || null,
      status: 'active',
    })
    .select()
    .single();

  if (reqError) return NextResponse.json({ error: reqError.message }, { status: 500 });

  // Create checkout items and decrement availability
  const checkoutItems = [];
  for (const item of items) {
    const { data: ci } = await supabase
      .from('checkout_items')
      .insert({
        request_id: request.id,
        equipment_id: item.equipment_id,
        quantity: item.quantity,
        returned: false,
      })
      .select('*, equipment(*)')
      .single();

    if (ci) checkoutItems.push(ci);

    // Decrement available quantity
    await supabase.rpc('decrement_available', {
      eq_id: item.equipment_id,
      amount: item.quantity,
    });
  }

  // Send confirmation emails (non-blocking)
  sendCheckoutEmail(request, checkoutItems).catch((err) =>
    console.error('Email send failed:', err)
  );

  return NextResponse.json({ success: true, id: request.id }, { status: 201 });
}
