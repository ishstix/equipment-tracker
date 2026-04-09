import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

function isAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${process.env.ADMIN_SECRET}`;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('image') as File;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const supabase = createServiceClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `${params.id}.${fileExt}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('equipment-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from('equipment-images')
    .getPublicUrl(fileName);

  await supabase
    .from('equipment')
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json({ url: publicUrl });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();

  // Get current image_url to find the file name
  const { data: eq } = await supabase
    .from('equipment')
    .select('image_url')
    .eq('id', params.id)
    .single();

  if (eq?.image_url) {
    const fileName = eq.image_url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('equipment-images').remove([fileName]);
    }
  }

  await supabase
    .from('equipment')
    .update({ image_url: null, updated_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json({ success: true });
}
