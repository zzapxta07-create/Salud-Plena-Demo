import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const conversations = await prisma.whatsappConversation.findMany({
      include: {
        patient: true,
        messages: true,
      },
    });
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('GET /api/whatsapp error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
