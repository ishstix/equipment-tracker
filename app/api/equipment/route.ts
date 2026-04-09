import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

function isAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${process.env.ADMIN_SECRET}`;
}

// GET /api/equipment — public, returns all equipment
export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/equipment — admin only, creates new equipment
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, category, total_quantity, available_quantity, condition } = body;

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('equipment')
    .insert({
      name,
      description: description || null,
      category: category || null,
      total_quantity: total_quantity ?? 1,
      available_quantity: available_quantity ?? total_quantity ?? 1,
      condition: condition ?? 'good',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
