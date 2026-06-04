import { fetchClinicalHistoryData } from "@/lib/documents/clinical-history-data";
import { buildMedplusAuthorizationExcel } from "@/lib/documents/medplus-authorization-excel";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchClinicalHistoryData(id);
  if (!data) return new Response("Paciente no encontrado", { status: 404 });

  if (data.entity?.name !== "MedPlus") {
    return new Response("El paciente no es afiliado de MedPlus", { status: 403 });
  }

  const buffer = await buildMedplusAuthorizationExcel(data);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="autorizacion-medplus-${id}.xlsx"`,
    },
  });
}
