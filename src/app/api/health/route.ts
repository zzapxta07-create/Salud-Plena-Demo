import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: any = {
    timestamp: new Date().toISOString(),
    env: {
      node_env: process.env.NODE_ENV,
      has_db_url: !!process.env.DATABASE_URL,
      db_url_prefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
    },
    db: {
      connected: false,
      error: null,
      patient_count: null,
    },
  };

  try {
    const count = await prisma.patient.count();
    result.db.connected = true;
    result.db.patient_count = count;
  } catch (error: any) {
    result.db.error = {
      message: error?.message || 'Unknown',
      code: error?.code || null,
      meta: error?.meta || null,
      name: error?.name || null,
    };
  }

  return Response.json(result, {
    status: result.db.connected ? 200 : 500,
  });
}
