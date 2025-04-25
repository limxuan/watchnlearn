import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', user.id)
      .single();

      console.log("gime", data)

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: 'Error fetching XP' }, { status: 500 });
    }
    if (!data) {
        return NextResponse.json({ error: 'XP not found!'},{ status: 404})
    }


    return NextResponse.json({
      username: user?.user_metadata?.username || user?.email, // adjust if needed
      total_xp: data.total_xp,
    });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}