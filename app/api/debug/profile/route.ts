import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (userError || !user) {
    return NextResponse.json(
      {
        ok: false,
        step: 'getUser',
        userError: userError?.message ?? null
      },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_paid')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    ok: true,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    userId: user.id,
    profile,
    profileError: profileError?.message ?? null
  });
}