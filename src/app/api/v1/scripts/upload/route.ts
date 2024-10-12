import { NextResponse } from 'next/server';
import { supabase } from '~/lib/supabase';

export async function POST(request: Request) {
  const { userId, scriptName, scriptCode } = await request.json();

  const { data, error } = await supabase
    .from('scripts')
    .insert({ user_id: userId, script_name: scriptName, script_code: scriptCode });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

