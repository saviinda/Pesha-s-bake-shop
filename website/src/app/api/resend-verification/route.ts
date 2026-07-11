import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });

    // Generate a fresh 6-digit OTP code, expires in 10 minutes
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from('customers')
        .update({
          verification_code: newCode,
          verification_code_expires_at: expiresAt,
          email_verified: false,
        })
        .eq('email', email);
    } else {
      // Local fallback — update pending verification store
      // (The login page handles emailing the code directly)
    }

    // Return the new code so the client-side login page can send the email
    return NextResponse.json({ success: true, newCode });
  } catch (err: any) {
    console.error('[resend-verification]', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
