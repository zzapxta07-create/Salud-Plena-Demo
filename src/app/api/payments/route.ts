import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: { patient: true },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('GET /api/payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payment = await prisma.payment.create({
      data: {
        patientId: body.patientId,
        concept: body.concept,
        amount: body.amount,
        method: body.method,
        status: body.status || 'PENDIENTE',
        observation: body.observation,
        paidAt: body.paidAt ? new Date(body.paidAt) : null,
      },
      include: { patient: true },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
