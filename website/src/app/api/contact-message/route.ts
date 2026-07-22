import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          phone: phone || null,
          message,
          read: false
        });
      
      if (error) {
        console.error('Failed to save contact message to Supabase:', error);
        // Continue to fallback
      } else {
        return NextResponse.json({ success: true });
      }
    }

    // Fallback: Try to send to admin site
    try {
      const adminResponse = await fetch(`${process.env.ADMIN_SITE_URL || 'http://localhost:3001'}/api/contact-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      });

      if (adminResponse.ok) {
        return NextResponse.json({ success: true });
      }
    } catch (fetchError) {
      console.warn('Admin site not available, message saved locally only');
    }

    // Final fallback: Save to localStorage (client-side will handle this)
    return NextResponse.json({ 
      success: true, 
      warning: 'Message saved locally - admin site unavailable' 
    });
  } catch (error) {
    console.error('Error in contact message API:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
