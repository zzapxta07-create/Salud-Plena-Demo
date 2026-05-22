import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const entities = await prisma.entity.findMany({
      where: { active: true },
    });
    return NextResponse.json(entities);
  } catch (error) {
    console.error('GET /api/entities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}
