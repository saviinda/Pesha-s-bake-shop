import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/verify-email?status=invalid', request.url));
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    // Local mode: mark token as verified in localStorage via redirect with success param
    return NextResponse.redirect(new URL(`/verify-email?status=success&token=${token}`, request.url));
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find the customer with this token
  const { data, error } = await supabase
    .from('customers')
    .select('id, email, email_verified, verification_token_expires_at')
    .eq('verification_token', token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(new URL('/verify-email?status=invalid', request.url));
  }

  if (data.email_verified) {
    return NextResponse.redirect(new URL('/verify-email?status=already', request.url));
  }

  // Check expiry
  if (data.verification_token_expires_at) {
    const expiry = new Date(data.verification_token_expires_at);
    if (new Date() > expiry) {
      return NextResponse.redirect(new URL('/verify-email?status=expired', request.url));
    }
  }

  // Mark verified and clear the token
  const { error: updateError } = await supabase
    .from('customers')
    .update({
      email_verified: true,
      verification_token: null,
      verification_token_expires_at: null,
    })
    .eq('id', data.id);

  if (updateError) {
    return NextResponse.redirect(new URL('/verify-email?status=error', request.url));
  }

  return NextResponse.redirect(new URL('/verify-email?status=success', request.url));
}
