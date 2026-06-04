import { fetchClinicalHistoryData } from "@/lib/documents/clinical-history-data";
import { renderMedplusPackagePDF } from "@/lib/documents/medplus-package-pdf";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchClinicalHistoryData(id);
  if (!data) return new Response("Paciente no encontrado", { status: 404 });

  if (data.entity?.name !== "MedPlus") {
    return new Response("El paciente no es afiliado de MedPlus", { status: 403 });
  }

  const buffer = await renderMedplusPackagePDF(data);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="medplus-paquete-${id}.pdf"`,
    },
  });
}
