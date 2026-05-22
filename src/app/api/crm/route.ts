import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const cases = await prisma.crmCase.findMany({
      include: {
        patient: true,
        entity: true,
      },
    });
    return NextResponse.json(cases);
  } catch (error) {
    console.error('GET /api/crm error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CRM cases' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const crmCase = await prisma.crmCase.create({
      data: {
        patientId: body.patientId,
        entityId: body.entityId,
        type: body.type,
        status: body.status || 'NUEVO',
        nextAction: body.nextAction,
        observations: body.observations,
      },
      include: { patient: true, entity: true },
    });

    return NextResponse.json(crmCase, { status: 201 });
  } catch (error) {
    console.error('POST /api/crm error:', error);
    return NextResponse.json(
      { error: 'Failed to create CRM case' },
      { status: 500 }
    );
  }
}
