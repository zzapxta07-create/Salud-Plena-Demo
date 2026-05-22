import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);

    let where = {};
    if (q) {
      where = {
        OR: [
          { documentNumber: { contains: q } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { firstLastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const patients = await prisma.patient.findMany({
      where,
      include: { entity: true },
      take: limit,
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('GET /api/patients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const patient = await prisma.patient.create({
      data: {
        documentNumber: body.documentNumber,
        documentType: body.documentType,
        expeditionPlace: body.expeditionPlace,
        firstName: body.firstName,
        middleName: body.middleName,
        firstLastName: body.firstLastName,
        secondLastName: body.secondLastName,
        gender: body.gender,
        birthDate: new Date(body.birthDate),
        patientType: body.patientType,
        entityId: body.entityId,
        phone: body.phone,
        cellphone: body.cellphone,
        email: body.email,
        address: body.address,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        photoUrl: body.photoUrl,
        status: body.status || 'NUEVO',
      },
      include: { entity: true },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('POST /api/patients error:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
