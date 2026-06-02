import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({
      include: {
        appointment: { include: { doctor: true } },
      },
    });
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('GET /api/reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}
