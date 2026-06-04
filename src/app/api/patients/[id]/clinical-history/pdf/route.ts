import { fetchClinicalHistoryData } from "@/lib/documents/clinical-history-data";
import { renderClinicalHistoryPDF } from "@/lib/documents/clinical-history-pdf";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchClinicalHistoryData(id);
  if (!data) return new Response("Paciente no encontrado", { status: 404 });

  const buffer = await renderClinicalHistoryPDF(data);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="historia-clinica-${id}.pdf"`,
    },
  });
}
