import { PageHeader } from "@/components/ui/page-header";
import { OdontogramaView } from "@/components/clinic/odontograma-view";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Odontologia — Odontograma"
        subtitle="Ver y editar odontograma como seccion independiente"
        breadcrumbs={[{ label: "Odontologia" }, { label: "Odontograma" }]}
      />
      <OdontogramaView specialty="Odontologia" />
    </>
  );
}
