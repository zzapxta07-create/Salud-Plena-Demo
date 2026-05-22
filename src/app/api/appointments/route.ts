import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
        entity: true,
      },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('GET /api/appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const appointment = await prisma.appointment.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        entityId: body.entityId,
        date: new Date(body.date),
        durationMinutes: body.durationMinutes || 30,
        treatment: body.treatment,
        observation: body.observation,
        status: body.status || 'AGENDADA',
      },
      include: { patient: true, doctor: true, entity: true },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('POST /api/appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
