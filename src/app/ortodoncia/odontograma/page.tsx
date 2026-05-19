import { PageHeader } from "@/components/ui/page-header";
import { OdontogramaView } from "@/components/clinic/odontograma-view";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Ortodoncia — Odontograma"
        subtitle="Odontograma del paciente en contexto de ortodoncia"
        breadcrumbs={[{ label: "Ortodoncia" }, { label: "Odontograma" }]}
      />
      <OdontogramaView specialty="Ortodoncia" />
    </>
  );
}
