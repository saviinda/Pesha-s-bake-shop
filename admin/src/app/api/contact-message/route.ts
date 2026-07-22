import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage } from '@/lib/data';

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

    // Create contact message
    const success = await createContactMessage({ name, email, phone, message });

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in admin contact message API:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
