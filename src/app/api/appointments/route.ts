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

    const startIso = body.startIso ? new Date(body.startIso) : new Date(body.date);
    const durationMin = body.durationMinutes || 30;
    const endIso = body.endIso
      ? new Date(body.endIso)
      : new Date(startIso.getTime() + durationMin * 60000);

    const appointment = await prisma.appointment.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        entityId: body.entityId,
        // n8n flat fields
        startIso,
        endIso,
        fechaIsoDia: startIso,
        diaTexto: body.diaTexto,
        servicio: body.servicio ?? body.treatment,
        name: body.name,
        phone: body.phone,
        especialistaNombre: body.especialistaNombre,
        estadoCita: body.estadoCita ?? 'pendiente',
        // legacy
        date: startIso,
        durationMinutes: durationMin,
        treatment: body.servicio ?? body.treatment,
        observation: body.observation,
        status: body.status || 'AGENDADA',
      } as any,
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
