import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, message: 'Email and code are required.' }, { status: 400 });
    }

    // Local/demo mode — no Supabase configured
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ success: true, local: true });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('customers')
      .select('id, email_verified, verification_code, verification_code_expires_at')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
    }

    if (data.email_verified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    if (!data.verification_code || data.verification_code !== code.trim()) {
      return NextResponse.json({ success: false, message: 'Incorrect verification code. Please try again.' }, { status: 400 });
    }

    if (data.verification_code_expires_at) {
      const expiry = new Date(data.verification_code_expires_at);
      if (new Date() > expiry) {
        return NextResponse.json({ success: false, expired: true, message: 'This code has expired. Please request a new one.' }, { status: 400 });
      }
    }

    // Mark as verified and clear the code
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        email_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
      })
      .eq('id', data.id);

    if (updateError) {
      return NextResponse.json({ success: false, message: 'Verification failed. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[verify-code]', err.message);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
