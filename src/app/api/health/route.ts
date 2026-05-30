export async function GET() {
  try {
    return Response.json({
      status: 'ok',
      env: {
        node_env: process.env.NODE_ENV,
        has_db_url: !!process.env.DATABASE_URL,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
