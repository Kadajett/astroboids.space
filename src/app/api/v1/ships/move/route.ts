import { NextResponse } from 'next/server';
import { supabase } from '~/lib/supabase';

export async function POST(request: Request) {
  const { shipId, newPosition } = await request.json();

  const { data, error } = await supabase
    .from('ships')
    .update({ position: newPosition })
    .eq('id', shipId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

