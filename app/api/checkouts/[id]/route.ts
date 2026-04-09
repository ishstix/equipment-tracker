import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

function isAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${process.env.ADMIN_SECRET}`;
}

// PUT /api/checkouts/:id — admin only
// body: { action: 'return_all' } or { action: 'return_item', item_id: string }
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  if (body.action === 'return_all') {
    // Get all unreturned items for this request
    const { data: items } = await supabase
      .from('checkout_items')
      .select('*')
      .eq('request_id', params.id)
      .eq('returned', false);

    if (items) {
      for (const item of items) {
        // Mark item returned
        await supabase
          .from('checkout_items')
          .update({ returned: true, return_date: now })
          .eq('id', item.id);

        // Increment available quantity
        await supabase.rpc('increment_available', {
          eq_id: item.equipment_id,
          amount: item.quantity,
        });
      }
    }

    // Mark request as returned
    await supabase
      .from('checkout_requests')
      .update({ status: 'returned' })
      .eq('id', params.id);

    return NextResponse.json({ success: true });
  }

  if (body.action === 'return_item') {
    const { data: item } = await supabase
      .from('checkout_items')
      .select('*')
      .eq('id', body.item_id)
      .single();

    if (!item || item.returned) {
      return NextResponse.json({ error: 'Item not found or already returned' }, { status: 400 });
    }

    await supabase
      .from('checkout_items')
      .update({ returned: true, return_date: now })
      .eq('id', body.item_id);

    await supabase.rpc('increment_available', {
      eq_id: item.equipment_id,
      amount: item.quantity,
    });

    // Check if all items in the request are now returned
    const { data: remaining } = await supabase
      .from('checkout_items')
      .select('id')
      .eq('request_id', params.id)
      .eq('returned', false);

    if (!remaining?.length) {
      await supabase
        .from('checkout_requests')
        .update({ status: 'returned' })
        .eq('id', params.id);
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
