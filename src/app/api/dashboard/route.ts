import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [totalPatients, totalAppointments, totalPayments, pendingPayments, crmCasesCount] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'PENDIENTE' } }),
      prisma.crmCase.count(),
    ]);

    const metrics = {
      totalPatients,
      totalAppointments,
      totalPayments,
      pendingPayments,
      crmCasesCount,
      completedPayments: totalPayments - pendingPayments,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
