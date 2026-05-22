import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const crmCase = await prisma.crmCase.findUnique({
      where: { id },
      include: {
        patient: true,
        entity: true,
        appointments: true,
        files: true,
      },
    });

    if (!crmCase) {
      return NextResponse.json(
        { error: 'CRM case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(crmCase);
  } catch (error) {
    console.error('GET /api/crm/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CRM case' },
      { status: 500 }
    );
  }
}
