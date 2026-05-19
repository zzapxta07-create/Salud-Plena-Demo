import { PageHeader } from "@/components/ui/page-header";
import { EvolucionForm } from "@/components/clinic/evolucion-form";

export default function Page() {
  const existing = [
    {
      id: "ev-1",
      patientId: "pat-1",
      treatment: "Limpieza dental",
      note: "Se realizo profilaxis completa. Paciente refiere sensibilidad leve en 36. Se indica enjuague con clorhexidina 0.12% por 7 dias.",
      doctorName: "Dr(a). Laura Castillo",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    },
    {
      id: "ev-2",
      patientId: "pat-2",
      treatment: "Endodoncia 14",
      note: "Primera sesion endodoncia: apertura, limpieza y conformacion biomecanica. Medicacion con hidroxido de calcio. Cita control en 7 dias.",
      doctorName: "Dr(a). Carolina Rios",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
  ];
  return (
    <>
      <PageHeader
        title="Odontologia — Evolucion"
        subtitle="Nota del procedimiento realizado, asociada a paciente, doctor y tratamiento"
        breadcrumbs={[{ label: "Odontologia" }, { label: "Evolucion" }]}
      />
      <EvolucionForm specialty="Odontologia" existing={existing} />
    </>
  );
}
