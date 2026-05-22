import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        entity: true,
        appointments: { include: { doctor: true, entity: true } },
        payments: true,
        attachedFiles: true,
        consents: { include: { doctor: true } },
        reminders: { include: { appointment: { include: { doctor: true } } } },
        crmCases: { include: { entity: true } },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('GET /api/patients/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}
